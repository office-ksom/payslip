import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Coins, AlertCircle, Loader2, Lock, Unlock, X, Eye } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const formatMonthYear = (myStr) => {
  if (!myStr || !/^\d{4}-\d{2}$/.test(myStr)) return myStr;
  const [year, month] = myStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(month, 10) - 1;
  if (monthIdx >= 0 && monthIdx < 12) {
    return `${year}-${months[monthIdx]}`;
  }
  return myStr;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return dateStr;
  }
};

const EPFEntry = (props) => {
  const { user: contextUser } = useOutletContext() || {};
  const user = props.user || contextUser;

  const [activeTab, setActiveTab] = useState('permanent'); // 'permanent', 'daily_wage'
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEmp, setModalEmp] = useState(null);
  const [modalIndex, setModalIndex] = useState(-1);

  // Preview overlay state
  const [showFullPreview, setShowFullPreview] = useState(false);

  const loadEPFEntries = async (targetMonth, targetTab) => {
    await Promise.resolve();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`/api/epf-entries?month_year=${targetMonth}&category=${targetTab}`);
      if (!res.ok) {
        throw new Error('Failed to fetch EPF entries');
      }
      const data = await res.json();
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
        const aActive = a.is_active !== undefined ? Number(a.is_active) : 1;
        const bActive = b.is_active !== undefined ? Number(b.is_active) : 1;
        if (aActive !== bActive) return bActive - aActive;
        const sortDiff = (a.sort_order || 0) - (b.sort_order || 0);
        if (sortDiff !== 0) return sortDiff;
        return (a.name || '').localeCompare(b.name || '');
      });
      setEntries(sorted);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when month or tab changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEPFEntries(monthYear, activeTab);
  }, [monthYear, activeTab]);

  if (user?.role === 'viewer') {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'super_admin';

  // Determine lock state from records (if any record is locked, the whole tab is locked)
  const isLocked = entries.length > 0 && entries[0].is_approved === 1;
  const lockedBy = entries.length > 0 ? entries[0].approved_by : '';
  const lockedOn = entries.length > 0 ? entries[0].approved_on : '';

  // Handle local change of input fields in the main table
  const handleInputChange = (index, field, value) => {
    if (isLocked) return;

    const updated = [...entries];
    const rawVal = field === 'uan' ? value : parseFloat(value) || 0;
    
    updated[index] = {
      ...updated[index],
      [field]: rawVal
    };

    if (field === 'epf_wage') {
      const epfWage = parseFloat(value) || 0;
      const isDeputation = updated[index].appointment_type === 'Deputation';
      // EDLI capped at Rs 15,000 maximum EPF wage (0 for Deputation)
      updated[index].edli = isDeputation ? 0 : Math.round(Math.min(epfWage, 15000) * 0.005);
      updated[index].employer_contribution = isDeputation ? 0 : Math.round(epfWage * 0.12);
      updated[index].admin_charges = isDeputation ? 0 : Math.round(epfWage * 0.005);
    }

    setEntries(updated);
  };

  // Recalculate all fields for a row using formulas
  const handleRecalculateRow = (index) => {
    if (isLocked) return;

    const row = entries[index];
    const wages = parseFloat(row.wages) || 0;
    const doj = row.date_of_joining;

    let status = 'before_2014';
    if (doj) {
      if (doj >= '2025-08-01') {
        status = 'after_2025';
      } else if (doj >= '2014-09-01') {
        status = 'after_2014_before_2025';
      }
    }

    let epf_wage = wages;
    if (status === 'after_2014_before_2025' || status === 'after_2025') {
      epf_wage = Math.min(wages, 15000);
    }

    let eps_wage = 0;
    if (status === 'before_2014') {
      eps_wage = wages;
    } else if (status === 'after_2014_before_2025') {
      eps_wage = Math.min(wages, 15000);
    }

    const isDeputation = row.appointment_type === 'Deputation';

    // EDLI capped at Rs 15,000 maximum EPF wage (0 for Deputation)
    const edli = isDeputation ? 0 : Math.round(Math.min(epf_wage, 15000) * 0.005);
    const employer_contribution = isDeputation ? 0 : Math.round(epf_wage * 0.12);
    const admin_charges = isDeputation ? 0 : Math.round(epf_wage * 0.005);

    const updated = [...entries];
    updated[index] = {
      ...row,
      epf_wage,
      eps_wage,
      edli,
      employer_contribution,
      admin_charges
    };
    setEntries(updated);
  };

  // Open modal for editing employee EPF details
  const openModal = (row, index) => {
    setModalIndex(index);
    setModalEmp({ ...row });
    setModalOpen(true);
  };

  // Handle inputs inside the modal
  const handleModalInputChange = (field, value) => {
    const updatedEmp = { ...modalEmp };
    const rawVal = field === 'uan' ? value : parseFloat(value) || 0;

    updatedEmp[field] = rawVal;

    if (field === 'epf_wage') {
      const epfWage = parseFloat(value) || 0;
      const isDeputation = updatedEmp.appointment_type === 'Deputation';
      // EDLI capped at Rs 15,000 maximum EPF wage (0 for Deputation)
      updatedEmp.edli = isDeputation ? 0 : Math.round(Math.min(epfWage, 15000) * 0.005);
      updatedEmp.employer_contribution = isDeputation ? 0 : Math.round(epfWage * 0.12);
      updatedEmp.admin_charges = isDeputation ? 0 : Math.round(epfWage * 0.005);
    }

    setModalEmp(updatedEmp);
  };

  // Commit modal changes back to the main grid list
  const saveModalData = () => {
    if (isLocked) {
      setModalOpen(false);
      return;
    }
    const updated = [...entries];
    updated[modalIndex] = { ...modalEmp };
    setEntries(updated);
    setModalOpen(false);
  };

  const handleSave = async () => {
    if (isLocked) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/epf-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month_year: monthYear,
          category: activeTab,
          entries: entries
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save EPF entries');
      }

      const resData = await res.json();
      if (resData.success) {
        setMessage({ type: 'success', text: 'EPF entries saved successfully!' });
        loadEPFEntries(monthYear, activeTab);
      } else {
        throw new Error(resData.error || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Lock entries
  const handleLock = async () => {
    setLocking(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/epf-entries/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month_year: monthYear,
          category: activeTab,
          action: 'approve'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to lock EPF entries');
      }

      setMessage({ type: 'success', text: 'EPF sheet verified and locked successfully!' });
      loadEPFEntries(monthYear, activeTab);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLocking(false);
    }
  };

  // Unlock entries
  const handleUnlock = async () => {
    if (!isSuperAdmin) return;
    setLocking(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/epf-entries/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month_year: monthYear,
          category: activeTab,
          action: 'unlock'
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to unlock EPF entries');
      }

      setMessage({ type: 'success', text: 'EPF sheet unlocked successfully.' });
      loadEPFEntries(monthYear, activeTab);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLocking(false);
    }
  };

  // Calculate totals
  const totalWages = entries.reduce((sum, r) => sum + (r.wages || 0), 0);
  const totalEPFWages = entries.reduce((sum, r) => sum + (r.epf_wage || 0), 0);
  const totalEPSWages = entries.reduce((sum, r) => sum + (r.eps_wage || 0), 0);
  const totalEDLI = entries.reduce((sum, r) => sum + (r.edli || 0), 0);
  const totalEEContribution = entries.reduce((sum, r) => sum + (r.employee_contribution || 0), 0);
  const totalERContribution = entries.reduce((sum, r) => sum + (r.employer_contribution || 0), 0);
  const totalAdminCharges = entries.reduce((sum, r) => sum + (r.admin_charges || 0), 0);

  return (
    <div>
      <div className="epf-main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>EPF Entry Management</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Manage, recalculate, and lock EPF filings for employees.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Month & Year</span>
            <input
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
            />
          </div>
        </div>
      </div>

      {isLocked && (
        <div 
          className="card" 
          style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem 1.5rem', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center', 
            borderLeft: '4px solid var(--color-success)',
            background: 'rgba(16, 185, 129, 0.05)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Lock size={20} style={{ color: 'var(--color-success)' }} />
            <div>
              <span style={{ fontWeight: 600, display: 'block' }}>Verified & Locked</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Locked by {lockedBy} on {formatDate(lockedOn)}</span>
            </div>
          </div>
          {isSuperAdmin && (
            <button className="btn btn-secondary" onClick={handleUnlock} disabled={locking} style={{ display: 'flex', gap: '0.5rem' }}>
              <Unlock size={14} />
              Unlock Sheet
            </button>
          )}
        </div>
      )}

      {message.text && (
        <div 
          className="card" 
          style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            borderLeft: `4px solid ${message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            background: 'var(--color-bg-surface)'
          }}
        >
          {message.type === 'success' ? (
            <ShieldCheck size={24} style={{ color: 'var(--color-success)' }} />
          ) : (
            <AlertCircle size={24} style={{ color: 'var(--color-danger)' }} />
          )}
          <span style={{ fontWeight: 500 }}>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-scrollable" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('permanent')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'permanent' ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
            color: activeTab === 'permanent' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap'
          }}
        >
          Permanent Employees
        </button>
        <button
          onClick={() => setActiveTab('daily_wage')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'daily_wage' ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
            color: activeTab === 'daily_wage' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            whiteSpace: 'nowrap'
          }}
        >
          Daily Wage Employees
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
          <Loader2 className="animate-spin" size={40} style={{ color: 'var(--color-accent-primary)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading EPF data...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Coins size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
          <h3>No EPF Entries</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            No paybill entries with EPF deductions were found for {formatMonthYear(monthYear)} ({activeTab === 'permanent' ? 'Permanent' : 'Daily Wage'}).
            Please make sure paybills have been generated and approved for this month first.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Dashboard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02))' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', tracking: '1px' }}>EE Contribution</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--color-accent-primary)' }}>₹{totalEEContribution.toLocaleString('en-IN')}</h2>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(99, 102, 241, 0.02))' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', tracking: '1px' }}>ER Contribution</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--color-accent-secondary)' }}>₹{totalERContribution.toLocaleString('en-IN')}</h2>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.02))' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', tracking: '1px' }}>Total EDLI</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--color-success)' }}>₹{totalEDLI.toLocaleString('en-IN')}</h2>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(245, 158, 11, 0.02))' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', tracking: '1px' }}>Admin Charges</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--color-warning)' }}>₹{totalAdminCharges.toLocaleString('en-IN')}</h2>
            </div>
          </div>

          {/* Table Grid */}
          <div className="table-container" style={{ marginBottom: '1.5rem', overflowY: 'visible' }}>
            <table className="table" style={{ minWidth: '1300px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem' }}>Emp ID</th>
                  <th>Name</th>
                  <th style={{ width: '150px' }}>UAN No.</th>
                  <th style={{ textAlign: 'right', width: '110px' }}>Wages</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>EPF Wage</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>EPS Wage</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>EDLI</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>EE Contrib</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>ER Contrib</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>Admin Charges</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>Reset</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row, idx) => (
                  <tr key={row.emp_id} className={row.is_active === 0 ? 'inactive-row' : ''} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: row.is_active === 0 ? 'rgba(249, 115, 22, 0.08)' : '' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: row.is_active === 0 ? '#fb923c' : 'var(--color-text-secondary)' }}>{row.emp_id}</td>
                    <td style={{ fontWeight: 500 }}>
                      <div 
                        style={{ cursor: 'pointer', textDecoration: 'underline', color: row.is_active === 0 ? '#f97316' : 'var(--color-accent-primary)' }}
                        onClick={() => openModal(row, idx)}
                      >
                        {row.name}{row.is_active === 0 ? ' [Inactive]' : ''}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: row.is_active === 0 ? '#fb923c' : 'var(--color-text-muted)' }}>Joined: {row.date_of_joining || 'N/A'}</div>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.uan || ''}
                        disabled={isLocked}
                        onChange={(e) => handleInputChange(idx, 'uan', e.target.value)}
                        className="form-control"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                        placeholder="UAN No."
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{row.wages?.toLocaleString('en-IN')}</td>
                    <td>
                      <input
                        type="number"
                        value={row.epf_wage || 0}
                        disabled={isLocked}
                        onChange={(e) => handleInputChange(idx, 'epf_wage', e.target.value)}
                        className="form-control"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', textAlign: 'right' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.eps_wage || 0}
                        disabled={isLocked}
                        onChange={(e) => handleInputChange(idx, 'eps_wage', e.target.value)}
                        className="form-control"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', textAlign: 'right' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.edli || 0}
                        disabled={isLocked}
                        onChange={(e) => handleInputChange(idx, 'edli', e.target.value)}
                        className="form-control"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', textAlign: 'right' }}
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{row.employee_contribution?.toLocaleString('en-IN')}</td>
                    <td>
                      <input
                        type="number"
                        value={row.employer_contribution || 0}
                        disabled={isLocked}
                        onChange={(e) => handleInputChange(idx, 'employer_contribution', e.target.value)}
                        className="form-control"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', textAlign: 'right' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.admin_charges || 0}
                        disabled={isLocked}
                        onChange={(e) => handleInputChange(idx, 'admin_charges', e.target.value)}
                        className="form-control"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', textAlign: 'right' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => handleRecalculateRow(idx)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        title="Recalculate from formulas"
                      >
                        Reset
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', fontWeight: 'bold' }}>
                  <td colSpan="3" style={{ padding: '1rem', textAlign: 'left' }}>Total ({entries.length} Employees)</td>
                  <td style={{ textAlign: 'right' }}>₹{totalWages.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalEPFWages.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalEPSWages.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalEDLI.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalEEContribution.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalERContribution.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalAdminCharges.toLocaleString('en-IN')}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <button
                onClick={() => setShowFullPreview(true)}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', gap: '0.5rem' }}
              >
                <Eye size={16} />
                Preview Full Sheet
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleSave}
                disabled={saving || isLocked}
                className="btn btn-secondary"
                style={{ minWidth: '140px' }}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save EPF Entries
                  </>
                )}
              </button>
              
              <button
                onClick={handleLock}
                disabled={locking || isLocked}
                className="btn btn-primary"
                style={{ minWidth: '140px', backgroundColor: 'var(--color-success)', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
              >
                {locking ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Locking...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Verify & Lock
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Data Entry Modal */}
      {modalOpen && modalEmp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, 
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: 'min(95vw, 600px)', maxHeight: '90vh', overflowY: 'auto', padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Data Entry: {modalEmp.name} ({modalEmp.emp_id})</h2>
              <button className="btn" style={{ padding: '0.3rem', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Employee ID</label>
                <input type="text" value={modalEmp.emp_id} disabled className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Employee Name</label>
                <input type="text" value={modalEmp.name} disabled className="form-control" />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>UAN No.</label>
                <input 
                  type="text" 
                  value={modalEmp.uan || ''} 
                  disabled={isLocked}
                  onChange={(e) => handleModalInputChange('uan', e.target.value)} 
                  className="form-control" 
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Wages (Basic + DA)</label>
                <input type="text" value={`₹${modalEmp.wages?.toLocaleString('en-IN')}`} disabled className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>EPF Wage</label>
                <input 
                  type="number" 
                  value={modalEmp.epf_wage || 0} 
                  disabled={isLocked}
                  onChange={(e) => handleModalInputChange('epf_wage', e.target.value)} 
                  className="form-control" 
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>EPS Wage</label>
                <input 
                  type="number" 
                  value={modalEmp.eps_wage || 0} 
                  disabled={isLocked}
                  onChange={(e) => handleModalInputChange('eps_wage', e.target.value)} 
                  className="form-control" 
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>EDLI</label>
                <input 
                  type="number" 
                  value={modalEmp.edli || 0} 
                  disabled={isLocked}
                  onChange={(e) => handleModalInputChange('edli', e.target.value)} 
                  className="form-control" 
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>EPF Employee Contribution</label>
                <input type="text" value={`₹${modalEmp.employee_contribution?.toLocaleString('en-IN')}`} disabled className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>EPF Employer Contribution</label>
                <input 
                  type="number" 
                  value={modalEmp.employer_contribution || 0} 
                  disabled={isLocked}
                  onChange={(e) => handleModalInputChange('employer_contribution', e.target.value)} 
                  className="form-control" 
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Administrative Charges</label>
                <input 
                  type="number" 
                  value={modalEmp.admin_charges || 0} 
                  disabled={isLocked}
                  onChange={(e) => handleModalInputChange('admin_charges', e.target.value)} 
                  className="form-control" 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveModalData} disabled={isLocked}>OK</button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Full Sheet Preview Overlay */}
      {showFullPreview && (
        <div className="epf-preview-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'var(--color-bg-primary)', zIndex: 2000, 
          padding: '2rem', overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>EPF Statement Summary - {formatMonthYear(monthYear)}</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Category: {activeTab === 'permanent' ? 'Permanent Employees' : 'Daily Wage Employees'}</p>
            </div>
            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', gap: '0.5rem' }}>
                Print EPF Sheet
              </button>
              <button className="btn btn-primary" onClick={() => setShowFullPreview(false)} style={{ backgroundColor: '#000', color: '#fff', display: 'flex', gap: '0.5rem' }}>
                <X size={16} />
                Close Preview
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total EE Contribution</span>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>₹{totalEEContribution.toLocaleString('en-IN')}</h3>
            </div>
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total ER Contribution</span>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>₹{totalERContribution.toLocaleString('en-IN')}</h3>
            </div>
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total EDLI</span>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>₹{totalEDLI.toLocaleString('en-IN')}</h3>
            </div>
            <div className="card">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total Admin Charges</span>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>₹{totalAdminCharges.toLocaleString('en-IN')}</h3>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ padding: '1rem' }}>Emp ID</th>
                  <th>Name</th>
                  <th>UAN No.</th>
                  <th style={{ textAlign: 'right' }}>Wages</th>
                  <th style={{ textAlign: 'right' }}>EPF Wage</th>
                  <th style={{ textAlign: 'right' }}>EPS Wage</th>
                  <th style={{ textAlign: 'right' }}>EDLI</th>
                  <th style={{ textAlign: 'right' }}>EE Contrib</th>
                  <th style={{ textAlign: 'right' }}>ER Contrib</th>
                  <th style={{ textAlign: 'right' }}>Admin Charges</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row) => (
                  <tr key={row.emp_id} className={row.is_active === 0 ? 'inactive-row' : ''} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: row.is_active === 0 ? '#fff7ed' : '' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>{row.emp_id}</td>
                    <td style={{ color: row.is_active === 0 ? '#c2410c' : 'inherit' }}>{row.name}{row.is_active === 0 ? ' [Inactive]' : ''}</td>
                    <td>{row.uan || 'N/A'}</td>
                    <td style={{ textAlign: 'right' }}>₹{row.wages?.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{row.epf_wage?.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{row.eps_wage?.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{row.edli?.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{row.employee_contribution?.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{row.employer_contribution?.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{row.admin_charges?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
                <tr style={{ background: 'rgba(255, 255, 255, 0.05)', fontWeight: 'bold' }}>
                  <td colSpan="3" style={{ padding: '1rem' }}>Total</td>
                  <td style={{ textAlign: 'right' }}>₹{totalWages.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalEPFWages.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalEPSWages.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalEDLI.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalEEContribution.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalERContribution.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{totalAdminCharges.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPFEntry;
