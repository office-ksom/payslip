import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck, Copy, Trash2, Calendar, FileText, Check, XCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const fmt = (v) => (parseFloat(v) || 0).toFixed(2);

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

const ArrearBill = (props) => {
  const { user: contextUser } = useOutletContext() || {};
  const user = props.user || contextUser;

  if (user?.role === 'viewer') {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>;
  }

  // Configuration states
  const [arrearType, setArrearType] = useState('DA Arrears');
  const [arrearTypeOther, setArrearTypeOther] = useState('');
  const [staffCategory, setStaffCategory] = useState('state'); // 'state' or 'ugc/csir'
  
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Bulk-fill tool states
  const [bulkAmount, setBulkAmount] = useState('');
  const [bulkIT, setBulkIT] = useState('');
  const [bulkDate, setBulkDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [bulkDesc, setBulkDesc] = useState('');

  // Approval state
  const [isApproved, setIsApproved] = useState(false);
  const [approvalInfo, setApprovalInfo] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [isOverrideActive, setIsOverrideActive] = useState(false);

  // Selected employees for bulk actions
  const [selectedEmps, setSelectedEmps] = useState(new Set());
  const [requireApproval, setRequireApproval] = useState(true);

  // Load employees and arrear data when monthYear, category, or type changes
  useEffect(() => {
    if (monthYear && staffCategory) {
      loadArrearData(monthYear, staffCategory);
    }
  }, [monthYear, staffCategory, arrearType]);

  const loadArrearData = async (targetMonth, category) => {
    setLoading(true);
    try {
      try {
        const sysRes = await fetch('/api/settings/system');
        if (sysRes.ok) {
          const sysData = await sysRes.json();
          setRequireApproval(sysData.require_approval !== '0');
        }
      } catch (e) {
        console.error("Failed to load system settings", e);
      }
      const res = await fetch(`/api/arrears/${targetMonth}?type=${arrearType}`);
      const data = await res.json();
 
      // Combine employees of the selected category with their existing arrear records if available
      // The filter matches category case-insensitively
      const filtered = data.filter(emp => {
        const catMatch = emp.category?.toLowerCase() === category.toLowerCase();
        // Keep employee if they are active OR if they have an existing arrear bill saved in this month
        const hasBill = emp.bill_id !== null && emp.arrear_type === arrearType;
        return catMatch && (emp.is_active === 1 || hasBill);
      });
 
      // Map to form state structure
      const gridData = filtered.map(emp => {
        const isMatchedRecord = emp.arrear_type === arrearType;
        return {
          ...emp,
          arrear_amount: isMatchedRecord ? (emp.arrear_amount || 0) : 0,
          income_tax: isMatchedRecord ? (emp.income_tax || 0) : 0,
          net_amount: isMatchedRecord ? (emp.net_amount || 0) : 0,
          bill_date: isMatchedRecord ? (emp.bill_date || bulkDate) : bulkDate,
          description: isMatchedRecord ? (emp.description || '') : '',
          has_saved_bill: isMatchedRecord && emp.bill_id !== null
        };
      });
 
      setEmployees(gridData);
      setSelectedEmps(new Set());
 
      // Check approval status
      const approvalRes = await fetch(`/api/arrears/approve/${targetMonth}?type=${arrearType}`);
      if (approvalRes.ok) {
        const approvalData = await approvalRes.json();
        setIsApproved(approvalData.is_approved === 1);
        setApprovalInfo(approvalData.is_approved === 1 ? approvalData : null);
      } else {
        setIsApproved(false);
        setApprovalInfo(null);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to load arrear bills.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (empId, date, type) => {
    if (!window.confirm("Are you sure you want to delete this arrear bill?")) return;
    try {
      const payload = {
        records: [{
          emp_id: empId,
          bill_date: date,
          arrear_type: type,
          arrear_amount: 0 // setting to 0 triggers deletion in backend
        }]
      };

      const res = await fetch(`/api/arrears/${monthYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Arrear bill deleted successfully.");
        loadArrearData(monthYear, staffCategory);
      } else {
        const err = await res.json();
        alert("Deletion failed: " + err.error);
      }
    } catch (e) {
      alert("Network error.");
    }
  };

  const handleInputChange = (emp_id, field, value) => {

    setEmployees(prev => prev.map(emp => {
      if (emp.emp_id === emp_id) {
        const updated = { ...emp, [field]: value };
        if (field === 'arrear_amount' || field === 'income_tax') {
          const amt = parseFloat(field === 'arrear_amount' ? value : emp.arrear_amount) || 0;
          const tax = parseFloat(field === 'income_tax' ? value : emp.income_tax) || 0;
          updated.net_amount = amt - tax;
        }
        return updated;
      }
      return emp;
    }));
  };

  // Bulk Apply to selected or all employees
  const handleBulkApply = () => {
    if (selectedEmps.size === 0) {
      if (!window.confirm("No employees checked. Apply bulk settings to ALL listed employees?")) {
        return;
      }
    }

    setEmployees(prev => prev.map(emp => {
      const isSelected = selectedEmps.has(emp.emp_id);
      const shouldApply = selectedEmps.size === 0 || isSelected;

      if (shouldApply) {
        const amt = bulkAmount !== '' ? parseFloat(bulkAmount) || 0 : emp.arrear_amount;
        const tax = bulkIT !== '' ? parseFloat(bulkIT) || 0 : emp.income_tax;
        return {
          ...emp,
          arrear_amount: amt,
          income_tax: tax,
          net_amount: amt - tax,
          bill_date: bulkDate || emp.bill_date,
          description: bulkDesc !== '' ? bulkDesc : emp.description
        };
      }
      return emp;
    }));
  };

  const handleToggleSelect = (emp_id) => {
    setSelectedEmps(prev => {
      const next = new Set(prev);
      if (next.has(emp_id)) next.delete(emp_id);
      else next.add(emp_id);
      return next;
    });
  };

  const handleToggleAllSelect = () => {
    const list = user?.role === 'approver' ? filteredEmployees : employees;
    if (selectedEmps.size === list.length) {
      setSelectedEmps(new Set());
    } else {
      setSelectedEmps(new Set(list.map(e => e.emp_id)));
    }
  };

  const handleSave = async () => {
    // Only save employees who have non-zero arrear amounts
    const validRecords = employees.map(emp => ({
      emp_id: emp.emp_id,
      arrear_type: arrearType,
      arrear_type_other: arrearType === 'Others' ? arrearTypeOther : null,
      category: staffCategory,
      arrear_amount: emp.arrear_amount,
      income_tax: emp.income_tax,
      net_amount: emp.net_amount,
      bill_date: emp.bill_date || bulkDate,
      description: emp.description
    }));

    setSaving(true);
    try {
      const res = await fetch(`/api/arrears/${monthYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: validRecords })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Arrear Bills Saved Successfully!");
        loadArrearData(monthYear, staffCategory);
      } else {
        alert("Failed to save: " + data.error);
      }
    } catch (e) {
      alert("Error saving arrear bills.");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (selectedEmps.size === 0) {
      alert("Please check/select the employees in the grid you want to approve.");
      return;
    }

    const confirmMessage = `OFFICIAL CONFIRMATION REQUIRED:\n\n` +
      `You are about to APPROVE the Arrear bills for ${selectedEmps.size} selected employee(s) in ${formatMonthYear(monthYear)}.\n\n` +
      `By clicking OK, you verify that all calculations are correct.\n` +
      `This action will PERMANENTLY LOCK their records.\n\n` +
      `Proceed with approval?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setApproving(true);
    try {
      const res = await fetch(`/api/arrears/approve/${monthYear}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emp_ids: Array.from(selectedEmps), arrear_type: arrearType })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Selected arrear bills approved successfully!');
        loadArrearData(monthYear, staffCategory);
      } else {
        alert('Failed to approve: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (selectedEmps.size === 0) {
      alert("Please check/select the employees in the grid you want to reject.");
      return;
    }

    const confirmMessage = `CONFIRM REJECTION:\n\n` +
      `You are about to REJECT the Arrear bills for ${selectedEmps.size} selected employee(s) in ${formatMonthYear(monthYear)}.\n\n` +
      `By clicking OK, these bills will be unlocked and returned to the admin for corrections.\n\n` +
      `Proceed with rejection?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setRejecting(true);
    try {
      const res = await fetch(`/api/arrears/approve/${monthYear}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emp_ids: Array.from(selectedEmps), arrear_type: arrearType, action: 'reject' })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Selected arrear bills rejected successfully!');
        setSelectedEmps(new Set());
        loadArrearData(monthYear, staffCategory);
      } else {
        alert('Failed to reject: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setRejecting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => user?.role !== 'approver' || emp.is_approved === 2);
  const approvedCount = employees.filter(e => e.is_approved === 1).length;
  const totalCount = employees.filter(e => e.arrear_amount > 0 || e.has_saved_bill).length;
  const hasApprovedBills = employees.some(e => e.is_approved === 1);

  const isReadOnly = user?.role === 'approver';

  // Totals
  const totalArrearsSum = filteredEmployees.reduce((s, e) => s + (e.arrear_amount || 0), 0);
  const totalITSum = filteredEmployees.reduce((s, e) => s + (e.income_tax || 0), 0);
  const totalNetSum = filteredEmployees.reduce((s, e) => s + (e.net_amount || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Arrear Bill Generation</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Generate arrears for Pay Revision, DA, or other types for multiple employees.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Select Month:</label>
          <input type="month" className="form-control" value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)} style={{ width: '150px' }} disabled={saving || approving} />
        </div>
      </div>

      {hasApprovedBills && (
        <div style={{ 
          marginBottom: '2rem', padding: '1.5rem', borderRadius: '12px', 
          backgroundColor: user?.role === 'approver' ? '#fef9c3' : 'rgba(16, 185, 129, 0.1)', 
          border: user?.role === 'approver' ? '1px solid #fde047' : '1px solid rgba(16, 185, 129, 0.2)',
          display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <ShieldCheck size={32} style={{ color: user?.role === 'approver' ? '#a16207' : 'var(--color-success)' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', color: user?.role === 'approver' ? '#713f12' : 'var(--color-success)', margin: 0 }}>
              {approvedCount === totalCount ? 'ALL ARREARS VERIFIED & SEALED' : 'SOME ARREARS VERIFIED & SEALED'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: user?.role === 'approver' ? '#854d0e' : 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
              <strong>{approvedCount}</strong> out of <strong>{totalCount}</strong> active arrear bills in {formatMonthYear(monthYear)} ({arrearType}) are verified and locked.
              {user?.role === 'super_admin' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => setIsOverrideActive(!isOverrideActive)}
                    style={{ 
                      backgroundColor: isOverrideActive ? '#ef4444' : '#3b82f6', 
                      color: '#fff',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {isOverrideActive ? 'Lock Month' : 'Unlock Month for Editing'}
                  </button>
                </div>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Configuration filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {/* Arrear Type */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Type of Arrears</label>
            <select 
              className="form-control" 
              value={arrearType} 
              onChange={(e) => setArrearType(e.target.value)}
              disabled={saving || approving}
            >
              <option value="Pay revision">Pay revision</option>
              <option value="DA Arrears">DA Arrears</option>
              <option value="Others">Others (specify below)</option>
            </select>
            {arrearType === 'Others' && (
              <input 
                type="text" 
                placeholder="Specify type..." 
                className="form-control" 
                value={arrearTypeOther}
                onChange={(e) => setArrearTypeOther(e.target.value)}
                style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
                disabled={saving || approving}
                required
              />
            )}
          </div>
 
          {/* Category of Staff */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category of Staff</label>
            <select 
              className="form-control" 
              value={staffCategory} 
              onChange={(e) => setStaffCategory(e.target.value)}
              disabled={saving || approving}
            >
              <option value="state">State</option>
              <option value="ugc/csir">UGC / CSIR</option>
            </select>
          </div>
        </div>
      </div>
 
      {/* Bulk-fill utility card (Only Admins / Super Admins, and not approved/locked) */}
      {(user?.role === 'admin' || user?.role === 'super_admin') && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px dashed var(--color-accent-primary)' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', fontWeight: 700 }}>
            Bulk Fill Utility
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Default Arrear Amount (₹)</label>
              <input type="number" className="form-control" value={bulkAmount} onChange={(e) => setBulkAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Default IT Deduction (₹)</label>
              <input type="number" className="form-control" value={bulkIT} onChange={(e) => setBulkIT(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Default Bill Date</label>
              <input type="date" className="form-control" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Default Description</label>
              <input type="text" className="form-control" value={bulkDesc} onChange={(e) => setBulkDesc(e.target.value)} placeholder="e.g. 7th Pay Revision" />
            </div>
            <div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleBulkApply} 
                style={{ width: '100%', border: '1px solid var(--color-accent-primary)', color: 'var(--color-accent-primary)' }}
              >
                <Copy size={16} /> Apply to {selectedEmps.size > 0 ? `${selectedEmps.size} Selected` : 'All'}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Main Grid Card */}
      <div className={`card ${hasApprovedBills ? 'approved-state' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Staff Arrear Grid ({staffCategory?.toUpperCase()})</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
              Fill in arrear details below. Checked rows will be affected by bulk-fill actions.
            </p>
          </div>
 
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {((user?.role === 'admin' && approvedCount < totalCount) || (user?.role === 'super_admin')) && (
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || approving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Arrear Grid'}
              </button>
            )}
             {(user?.role === 'approver' || (!requireApproval && (user?.role === 'admin' || user?.role === 'super_admin'))) && filteredEmployees.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleApprove} 
                  disabled={approving || rejecting || selectedEmps.size === 0} 
                  style={{ 
                    backgroundColor: 'var(--color-success)', 
                    border: 'none',
                    padding: '0.6rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <ShieldCheck size={18} /> {approving ? 'Finalizing...' : (user?.role === 'approver' ? `APPROVE SELECTED (${selectedEmps.size})` : `Verify & Lock (${selectedEmps.size})`)}
                </button>
                {user?.role === 'approver' && (
                  <button 
                    className="btn btn-danger" 
                    onClick={handleReject} 
                    disabled={approving || rejecting || selectedEmps.size === 0} 
                    style={{ 
                      backgroundColor: 'var(--color-danger)', 
                      border: 'none',
                      padding: '0.6rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      boxShadow: 'var(--shadow-lg)',
                      color: '#fff'
                    }}
                  >
                    <XCircle size={18} /> {rejecting ? 'Rejecting...' : `REJECT SELECTED (${selectedEmps.size})`}
                  </button>
                )}
              </div>
            )}
            {((user?.role === 'approver' && filteredEmployees.length === 0 && approvedCount > 0) || (user?.role !== 'approver' && approvedCount > 0 && approvedCount === totalCount)) && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                color: 'var(--color-success)', fontWeight: 800, fontSize: '0.9rem',
                padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(16,185,129,0.1)'
              }}>
                <ShieldCheck size={18} /> ALL APPROVED & LOCKED
              </div>
            )}
          </div>
        </div>
 
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>Loading grid...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={filteredEmployees.length > 0 && filteredEmployees.every(e => e.is_approved === 1 || selectedEmps.has(e.emp_id))}
                      onChange={handleToggleAllSelect}
                      disabled={saving || approving}
                    />
                  </th>
                  <th>Employee Info</th>
                  <th>Arrear Amount (₹)</th>
                  <th>IT Deduction (₹)</th>
                  <th>Net Arrear (₹)</th>
                  <th>Bill Date</th>
                  <th>Description</th>
                  {(user?.role === 'admin' || user?.role === 'super_admin') && <th style={{ width: '80px' }}>Action</th>}
                </tr>

              </thead>
              <tbody>
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={(user?.role === 'admin' || user?.role === 'super_admin') ? 8 : 7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      No employees found in category: {staffCategory?.toUpperCase()}.
                    </td>
                  </tr>

                )}
                {filteredEmployees.map(emp => {
                  const isRowApproved = emp.is_approved === 1;
                  const isRowLocked = isRowApproved && (user?.role !== 'super_admin' || !isOverrideActive);
                  const isRowEditable = !isRowLocked && user?.role !== 'approver';
                  const rowBg = selectedEmps.has(emp.emp_id) ? 'rgba(59, 130, 246, 0.03)' : 'transparent';
                  const rowColor = emp.is_approved === 3 ? '#ef4444' : (emp.is_approved === 2 ? '#d97706' : 'inherit');
                  return (
                    <tr key={emp.emp_id} style={{ 
                      backgroundColor: rowBg,
                      color: rowColor
                    }}>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedEmps.has(emp.emp_id) || isRowApproved}
                          onChange={() => handleToggleSelect(emp.emp_id)}
                          disabled={isRowApproved || saving || approving}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: emp.is_approved === 3 ? '#ef4444' : (emp.is_approved === 2 ? '#d97706' : 'var(--color-primary)'), display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {emp.title ? `${emp.title} ` : ''}{emp.name}
                          {isRowApproved && (
                            <span style={{ 
                              backgroundColor: '#10b981', 
                              color: '#fff', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '0.65rem', 
                              fontWeight: 'bold',
                              display: 'inline-block'
                            }}>
                              APPROVED
                            </span>
                          )}
                          {emp.is_approved === 3 && (
                            <span style={{ 
                              backgroundColor: '#fee2e2', 
                              color: '#ef4444', 
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '0.65rem', 
                              fontWeight: 'bold',
                              display: 'inline-block'
                            }}>
                              Rejected by approver
                            </span>
                          )}
                          {emp.is_approved === 2 && (
                            <span style={{ 
                              backgroundColor: '#f97316', 
                              color: '#fff', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '0.65rem', 
                              fontWeight: 'bold',
                              display: 'inline-block'
                            }}>
                              SUBMITTED
                            </span>
                          )}
                          {user?.role === 'approver' && emp.is_approved === 2 && (
                            <span style={{ 
                              backgroundColor: '#fee2e2', 
                              color: '#991b1b', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '0.65rem', 
                              fontWeight: 'bold' 
                            }}>
                              DRAFT
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: emp.is_approved === 3 ? '#ef4444' : (emp.is_approved === 2 ? '#d97706' : 'var(--color-text-secondary)') }}>{emp.emp_id}</div>
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={emp.arrear_amount || ''} 
                          onChange={(e) => handleInputChange(emp.emp_id, 'arrear_amount', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          disabled={!isRowEditable}
                          style={{ width: '130px', textAlign: 'right', fontWeight: '600', color: emp.is_approved === 3 ? '#ef4444' : (emp.is_approved === 2 ? '#d97706' : 'inherit') }}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={emp.income_tax || ''} 
                          onChange={(e) => handleInputChange(emp.emp_id, 'income_tax', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          disabled={!isRowEditable}
                          style={{ width: '110px', textAlign: 'right', color: emp.is_approved === 3 ? '#ef4444' : (emp.is_approved === 2 ? '#d97706' : 'inherit') }}
                        />
                      </td>
                      <td style={{ fontWeight: 'bold', color: emp.is_approved === 3 ? '#ef4444' : (emp.is_approved === 2 ? '#d97706' : (isRowApproved ? 'var(--color-success)' : 'inherit')), width: '130px', paddingLeft: '1.5rem' }}>
                        ₹ {fmt(emp.net_amount)}
                      </td>
                      <td>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={emp.bill_date} 
                          onChange={(e) => handleInputChange(emp.emp_id, 'bill_date', e.target.value)}
                          disabled={!isRowEditable}
                          style={{ width: '150px', color: emp.is_approved === 3 ? '#ef4444' : (emp.is_approved === 2 ? '#d97706' : 'inherit') }}
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={emp.description} 
                          onChange={(e) => handleInputChange(emp.emp_id, 'description', e.target.value)}
                          placeholder="e.g. DA Jan-Mar 2026"
                          disabled={!isRowEditable}
                          style={{ color: emp.is_approved === 3 ? '#ef4444' : (emp.is_approved === 2 ? '#d97706' : 'inherit') }}
                        />
                      </td>
                      {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <td>
                          {emp.has_saved_bill && !isRowLocked && (
                            <button 
                              className="btn btn-danger" 
                              onClick={() => handleDelete(emp.emp_id, emp.bill_date, arrearType)}
                              style={{ padding: '0.3rem 0.5rem', borderRadius: '4px' }}
                              title="Delete Bill"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>

                  );
                })}
              </tbody>
              {filteredEmployees.length > 0 && (
                <tfoot style={{ borderTop: '2px solid var(--color-border)', fontWeight: 'bold' }}>
                  <tr>
                    <td></td>
                    <td style={{ textAlign: 'right', paddingRight: '1rem' }}>TOTALS:</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-text-primary)', padding: '1rem 0.5rem' }}>
                      ₹ {totalArrearsSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--color-danger)', padding: '1rem 0.5rem' }}>
                      ₹ {totalITSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: 'var(--color-success)', padding: '1rem 1.5rem' }}>
                      ₹ {totalNetSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                    <td></td>
                    {(user?.role === 'admin' || user?.role === 'super_admin') && <td></td>}
                  </tr>

                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArrearBill;
