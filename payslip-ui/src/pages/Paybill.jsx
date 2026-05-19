import React, { useState, useEffect } from 'react';
import { Calculator, Save, Copy, X, ShieldCheck, Search, ShieldAlert, XCircle } from 'lucide-react';
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

const Paybill = (props) => {
  const { user: contextUser } = useOutletContext() || {};
  const user = props.user || contextUser;

  if (user?.role === 'viewer') {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>;
  }
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [employees, setEmployees] = useState([]);
  const [globalSettingsList, setGlobalSettingsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Approval state
  const [isApproved, setIsApproved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [approvalInfo, setApprovalInfo] = useState(null);
  const [approving, setApproving] = useState(false);
  const [usersList, setUsersList] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEmp, setModalEmp] = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isOverrideActive, setIsOverrideActive] = useState(false);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsersList(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to load users in Paybill", err));
  }, []);

  useEffect(() => {
    setIsOverrideActive(false);
  }, [monthYear]);

  useEffect(() => { 
    if (user) {
      loadDataForMonth(monthYear); 
    }
  }, [monthYear, user]);

  const loadDataForMonth = async (targetMonth) => {
    setLoading(true);
    try {
      const settingsRes = await fetch('/api/settings');
      if (!settingsRes.ok) {
        const err = await settingsRes.json();
        throw new Error(err.error || "Failed to load settings");
      }
      setGlobalSettingsList(await settingsRes.json());

      const earnRes = await fetch(`/api/earnings/${targetMonth}`);
      if (!earnRes.ok) {
        const err = await earnRes.json();
        throw new Error(err.error || "Failed to load earnings");
      }
      const earnData = await earnRes.json();

      const deduxRes = await fetch(`/api/deductions/${targetMonth}`);
      if (!deduxRes.ok) {
        const err = await deduxRes.json();
        throw new Error(err.error || "Failed to load deductions");
      }
      const deduxData = await deduxRes.json();

      try {
        const approvalRes = await fetch(`/api/approve/${targetMonth}`);
        if (approvalRes.ok) {
          const approvalData = await approvalRes.json();
          setIsApproved(approvalData.is_approved === 1);
          setIsSubmitted(approvalData.is_approved === 2);
          setIsRejected(approvalData.is_approved === 3);
          setApprovalInfo(approvalData.is_approved === 1 ? approvalData : null);
        } else {
          setIsApproved(false);
          setIsSubmitted(false);
          setIsRejected(false);
          setApprovalInfo(null);
        }
      } catch (e) {
        console.error("Approval status fetch failed", e);
        setIsApproved(false);
        setIsSubmitted(false);
        setIsRejected(false);
        setApprovalInfo(null);
      }

      const combined = earnData.map(empEarn => {
        const d = deduxData.find(x => x.emp_id === empEarn.emp_id) || {};
        return {
          ...empEarn,
          basic_pay: empEarn.basic_pay || 0,
          dp_gp: empEarn.dp_gp || 0,
          spl_pay: empEarn.spl_pay || 0,
          tr_allow: empEarn.tr_allow || 0,
          spl_allow: empEarn.spl_allow || 0,
          fest_allow: empEarn.fest_allow || 0,
          epf: d.epf || 0,
          cpf: d.cpf || 0,
          professional_tax: d.professional_tax || 0,
          income_tax: d.income_tax || 0,
          sli: d.sli || 0,
          lic: d.lic || 0,
          gis: d.gis || 0,
          onam_advance: d.onam_advance || 0,
          hra_recovery: d.hra_recovery || 0,
          other_deductions: d.other_deductions || 0,
          other_earnings_breakdown: empEarn.other_earnings_breakdown ? JSON.parse(empEarn.other_earnings_breakdown) : [],
          other_deductions_breakdown: d.other_deductions_breakdown ? JSON.parse(d.other_deductions_breakdown) : [],
        };
      });

      setEmployees(combined.filter(e => {
        // Temporarily disabled filter to debug visibility
        /*
        if (e.date_of_joining && e.date_of_joining.length >= 7) {
          const dojMonth = e.date_of_joining.substring(0, 7);
          if (dojMonth > targetMonth) return false;
        }
        */
        // Be very permissive: only hide if explicitly inactive (0) and no data
        if (e.is_active === 0 && e.earnings_id == null) return false;
        return true;
      }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
    } catch (err) {
      console.error(err);
      alert('Failed to load paybill data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (emp_id, field, value) => {
    setEmployees(prev => prev.map(emp =>
      emp.emp_id === emp_id ? { ...emp, [field]: parseFloat(value) || 0 } : emp
    ));
  };

  const applyCalculations = () => {
    const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {};
    setEmployees(prev => prev.map(emp => {
      const isState = emp.category === 'state';
      const isUGC = emp.category === 'ugc/csir';
      const da_pct = isState ? (activeRule.da_state_percentage || 0) : isUGC ? (activeRule.da_ugc_percentage || 0) : 0;
      const hra_pct = isState ? (activeRule.hra_state_percentage || 0) : isUGC ? (activeRule.hra_ugc_percentage || 0) : 0;
      const base = emp.basic_pay + (emp.dp_gp || 0);
      const da = (base * da_pct) / 100;
      const hra = (base * hra_pct) / 100;
      return {
        ...emp,
        da_state: isState ? da : 0,
        da_ugc: isUGC ? da : 0,
        hra_state: isState ? hra : 0,
        hra_ugc: isUGC ? hra : 0,
      };
    }));
  };
  
  const handleCopyPreviousMonth = async () => {
    const [year, month] = monthYear.split('-');
    let py = parseInt(year);
    let pm = parseInt(month) - 1;
    if (pm === 0) { pm = 12; py -= 1; }
    const prevMonth = `${py}-${String(pm).padStart(2, '0')}`;
    
    if (!window.confirm(`Are you sure you want to pull data from ${prevMonth} and overwrite current unsaved grid data?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const earnRes = await fetch(`/api/earnings/${prevMonth}`);
      const earnData = await earnRes.json();
      const deduxRes = await fetch(`/api/deductions/${prevMonth}`);
      const deduxData = await deduxRes.json();
      
      setEmployees(prev => prev.map(emp => {
        const prevE = earnData.find(e => e.emp_id === emp.emp_id) || {};
        const prevD = deduxData.find(d => d.emp_id === emp.emp_id) || {};
        return {
          ...emp,
          basic_pay: prevE.basic_pay || 0,
          dp_gp: prevE.dp_gp || 0,
          da_state: prevE.da_state || 0,
          da_ugc: prevE.da_ugc || 0,
          hra_state: prevE.hra_state || 0,
          hra_ugc: prevE.hra_ugc || 0,
          cca: prevE.cca || 0,
          spl_pay: prevE.spl_pay || 0,
          tr_allow: prevE.tr_allow || 0,
          spl_allow: prevE.spl_allow || 0,
          fest_allow: prevE.fest_allow || 0,
          other_earnings: prevE.other_earnings || 0,
          epf: prevD.epf || 0,
          cpf: prevD.cpf || 0,
          professional_tax: prevD.professional_tax || 0,
          income_tax: prevD.income_tax || 0,
          sli: prevD.sli || 0,
          gis: prevD.gis || 0,
          lic: prevD.lic || 0,
          onam_advance: prevD.onam_advance || 0,
          hra_recovery: prevD.hra_recovery || 0,
          other_deductions: prevD.other_deductions || 0,
          other_earnings_breakdown: prevE.other_earnings_breakdown ? JSON.parse(prevE.other_earnings_breakdown) : [],
          other_deductions_breakdown: prevD.other_deductions_breakdown ? JSON.parse(prevD.other_deductions_breakdown) : [],
        };
      }));
    } catch(err) {
      console.error(err);
      alert('Failed to pull previous month data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const earningsPayload = employees.map(emp => ({
        emp_id: emp.emp_id, basic_pay: emp.basic_pay, dp_gp: emp.dp_gp,
        da_state: emp.da_state, da_ugc: emp.da_ugc,
        hra_state: emp.hra_state, hra_ugc: emp.hra_ugc,
        cca: emp.cca, other_earnings: emp.other_earnings,
        spl_pay: emp.spl_pay, tr_allow: emp.tr_allow,
        spl_allow: emp.spl_allow, fest_allow: emp.fest_allow,
        other_earnings_breakdown: emp.other_earnings_breakdown
      }));

      const deductionsPayload = employees.map(emp => ({
        emp_id: emp.emp_id, epf: emp.epf, cpf: emp.cpf,
        professional_tax: emp.professional_tax,
        sli: emp.sli, gis: emp.gis, lic: emp.lic,
        income_tax: emp.income_tax,
        onam_advance: emp.onam_advance, hra_recovery: emp.hra_recovery,
        other_deductions: emp.other_deductions,
        other_deductions_breakdown: emp.other_deductions_breakdown
      }));

      const earnRes = await fetch(`/api/earnings/${monthYear}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: earningsPayload })
      });
      if (!earnRes.ok) {
        const err = await earnRes.json();
        throw new Error(err.error || 'Failed to save earnings');
      }

      const deduxRes = await fetch(`/api/deductions/${monthYear}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: deductionsPayload })
      });
      if (!deduxRes.ok) {
        const err = await deduxRes.json();
        throw new Error(err.error || 'Failed to save deductions');
      }

      alert('Paybill Saved Successfully!');
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    const confirmMessage = `OFFICIAL CONFIRMATION REQUIRED:\n\n` +
      `You are about to APPROVE the paybill for ${formatMonthYear(monthYear)}.\n\n` +
      `By clicking OK, you verify that all earnings and deductions for all employees are correct.\n` +
      `This action will PERMANENTLY LOCK the records for this month.\n\n` +
      `Proceed with approval?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setApproving(true);
    try {
      const res = await fetch(`/api/approve/${monthYear}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Paybill approved successfully!');
        setIsApproved(true);
        setApprovalInfo(data);
      } else {
        alert('Failed to approve: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleSubmit = async () => {
    const confirmMessage = `CONFIRM SUBMISSION:\n\n` +
      `Are you sure you want to SUBMIT the paybill for ${formatMonthYear(monthYear)} for approval?`;
    if (!window.confirm(confirmMessage)) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/approve/${monthYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit' })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Paybill submitted for approval successfully!');
        setIsSubmitted(true);
      } else {
        alert('Failed to submit: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    const confirmMessage = `CONFIRM REJECTION:\n\n` +
      `You are about to REJECT the paybill for ${formatMonthYear(monthYear)}.\n\n` +
      `Proceed with rejection?`;
    if (!window.confirm(confirmMessage)) return;
    
    setApproving(true);
    try {
      const res = await fetch(`/api/approve/${monthYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Paybill rejected successfully!');
        setIsSubmitted(false);
        setIsApproved(false);
      } else {
        alert('Failed to reject: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setApproving(false);
    }
  };
  
  // -- Modal logic --
  const openModal = (emp) => {
    setModalEmp({ ...emp });
    setModalOpen(true);
  };
  
  const handleModalInput = (e) => {
    const { name, value } = e.target;
    setModalEmp(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const addBreakdownItem = (type) => {
    setModalEmp(prev => {
      const field = type === 'earnings' ? 'other_earnings_breakdown' : 'other_deductions_breakdown';
      const arr = prev[field] || [];
      return { ...prev, [field]: [...arr, { desc: '', amount: 0 }] };
    });
  };

  const updateBreakdownItem = (type, index, key, value) => {
    setModalEmp(prev => {
      const field = type === 'earnings' ? 'other_earnings_breakdown' : 'other_deductions_breakdown';
      const sumField = type === 'earnings' ? 'other_earnings' : 'other_deductions';
      const arr = [...(prev[field] || [])];
      if (key === 'amount') arr[index][key] = parseFloat(value) || 0;
      else arr[index][key] = value;
      
      const total = arr.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      return { ...prev, [field]: arr, [sumField]: total };
    });
  };

  const removeBreakdownItem = (type, index) => {
    setModalEmp(prev => {
      const field = type === 'earnings' ? 'other_earnings_breakdown' : 'other_deductions_breakdown';
      const sumField = type === 'earnings' ? 'other_earnings' : 'other_deductions';
      const arr = [...(prev[field] || [])];
      arr.splice(index, 1);
      const total = arr.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      return { ...prev, [field]: arr, [sumField]: total };
    });
  };

  const commitModalSave = () => {
    setEmployees(prev => prev.map(e => e.emp_id === modalEmp.emp_id ? modalEmp : e));
    setModalOpen(false);
    setModalEmp(null);
  };

  const inputStyle = { padding: '0.2rem 0.3rem', width: '65px' };

  const [yr, mn] = (monthYear || '').split('-');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthDisplay = mn ? `${monthNames[parseInt(mn)-1]} ${yr}` : monthYear;

  if (user?.role === 'approver' && !isSubmitted && !isApproved) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Paybill Generation</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              Verify earnings and deductions, then approve or reject the submitted paybill.
            </p>
          </div>
          <input type="month" className="form-control" value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)} />
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert size={48} style={{ color: '#d97706' }} />
          <h2 style={{ fontSize: '1.5rem', color: '#854d0e', margin: 0 }}>No Paybill Submitted</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: 0 }}>
            The regular salary paybill for {monthDisplay} has not been submitted for approval yet. Once submitted by the Admin or Super Admin, it will appear here for your review and approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Paybill Generation</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Enter earnings and deductions, auto-calculate DA & HRA, then save.
          </p>
          {globalSettingsList.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', background: 'rgba(59,130,246,0.1)', padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'inline-block' }}>
              <strong>Active Rules for {formatMonthYear(monthYear)}:</strong> State (DA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).da_state_percentage || 0}%, HRA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).hra_state_percentage || 0}%) | UGC/CSIR (DA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).da_ugc_percentage || 0}%, HRA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).hra_ugc_percentage || 0}%)
            </div>
          )}
        </div>
        <input type="month" className="form-control" value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)} />
      </div>
      {isRejected && (
        <div style={{ 
          marginBottom: '2rem', padding: '1.5rem', borderRadius: '12px', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <XCircle size={32} style={{ color: '#ef4444' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#ef4444', margin: 0 }}>
              REJECTED BY APPROVER
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
              This paybill was rejected by the approver. Please make corrections, save, and submit for approval again.
            </p>
          </div>
        </div>
      )}

      {isApproved && (
        <div style={{ 
          marginBottom: '2rem', padding: '1.5rem', borderRadius: '12px', 
          backgroundColor: user?.role === 'approver' ? '#fef9c3' : 'rgba(16, 185, 129, 0.1)', 
          border: user?.role === 'approver' ? '1px solid #fde047' : '1px solid rgba(16, 185, 129, 0.2)',
          display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <ShieldCheck size={32} style={{ color: user?.role === 'approver' ? '#a16207' : 'var(--color-success)' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', color: user?.role === 'approver' ? '#713f12' : 'var(--color-success)', margin: 0 }}>
              {user?.role === 'approver' ? 'VERIFIED & SEALED' : 'APPROVED & LOCKED'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: user?.role === 'approver' ? '#854d0e' : 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
              Verified by <strong>{(() => {
                if (!approvalInfo || !approvalInfo.approved_by) return 'Unknown';
                const approvedUser = usersList.find(u => u.email && u.email.toLowerCase() === approvalInfo.approved_by.toLowerCase());
                return approvedUser && approvedUser.name
                  ? (approvedUser.designation ? `${approvedUser.name}, ${approvedUser.designation}, KSoM` : `${approvedUser.name}, KSoM`)
                  : approvalInfo.approved_by;
              })()}</strong> on <strong>{approvalInfo?.approved_on ? new Date(approvalInfo.approved_on).toLocaleString() : 'N/A'}</strong>.
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
                    {isOverrideActive ? <X size={14} /> : <Save size={14} />}
                    {isOverrideActive ? 'Cancel Editing (Lock)' : 'Unlock for Editing'}
                  </button>
                </div>
              )}
              {user?.role !== 'super_admin' && (isApproved ? ' Records are finalized.' : '')}
            </p>
          </div>
        </div>
      )}

      <div className={`card ${isApproved ? 'approved-state' : ''}`} style={{
        backgroundColor: isApproved ? 'rgba(240, 253, 244, 0.5)' : '',
        borderColor: isApproved ? 'var(--color-success)' : '',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <>
                <button className="btn btn-secondary" onClick={handleCopyPreviousMonth} disabled={isApproved && (!isOverrideActive || user?.role !== 'super_admin')}>
                  <Copy size={18} /> Copy Previous Month
                </button>
                <button className="btn btn-secondary" onClick={applyCalculations} disabled={isApproved && (!isOverrideActive || user?.role !== 'super_admin')}>
                  <Calculator size={18} /> Auto Calculate DA & HRA
                </button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowFullPreview(true)}
              >
                <Search size={18} /> Preview Full Sheet
              </button>
            )}
            {((user?.role === 'admin' && !isApproved) || (user?.role === 'super_admin' && (!isApproved || isOverrideActive))) && (
              <>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || (isApproved && !isOverrideActive)}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Paybill'}
                </button>
                {!isSubmitted && (
                  <button 
                    className="btn" 
                    onClick={handleSubmit} 
                    disabled={saving || (isApproved && !isOverrideActive)}
                    style={{ 
                      backgroundColor: '#f97316', 
                      color: '#fff', 
                      border: 'none',
                      padding: '0.6rem 1.2rem',
                      fontWeight: 'bold',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <ShieldCheck size={18} /> Submit for Approval
                  </button>
                )}
              </>
            )}
            {isSubmitted && !isApproved && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                color: '#f97316', fontWeight: 800, fontSize: '0.9rem',
                padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(249,115,22,0.1)'
              }}>
                SUBMITTED FOR APPROVAL
              </div>
            )}
            {user?.role === 'approver' && isSubmitted && !isApproved && (
              <>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowFullPreview(true)}
                  style={{ marginRight: '0.5rem' }}
                >
                  <Search size={18} /> Preview Full Sheet
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleReject} 
                  disabled={approving || employees.length === 0}
                  style={{ 
                    marginRight: '0.5rem',
                    backgroundColor: '#ef4444', 
                    border: 'none',
                    padding: '0.6rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#fff',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <XCircle size={20} /> {approving ? 'Rejecting...' : 'REJECT'}
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleApprove} 
                  disabled={approving || employees.length === 0} 
                  style={{ 
                    backgroundColor: 'var(--color-success)', 
                    border: 'none',
                    padding: '0.6rem 1.5rem',
                    fontSize: '1rem',
                    fontWeight: 800,
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <ShieldCheck size={20} /> {approving ? 'Finalizing Approval...' : 'APPROVE & LOCK PAYBILL'}
                </button>
              </>
            )}
            {isApproved && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                color: 'var(--color-success)', fontWeight: 800, fontSize: '0.9rem',
                padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(16,185,129,0.1)'
              }}>
                <ShieldCheck size={20} /> VERIFIED & SEALED
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: '0.78rem', minWidth: '1800px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-bg-secondary)', zIndex: 1, boxShadow: '0 1px 0 var(--color-border)' }}>
                <tr>
                  <th style={{ minWidth: '140px' }}>Employee</th>
                  <th style={{ background: 'rgba(59,130,246,0.06)', textAlign:'center', padding:'0.5rem 0' }} colSpan="10">
                    ── EARNINGS ──
                  </th>
                  <th style={{ background: 'rgba(239,68,68,0.06)', textAlign:'center', padding:'0.5rem 0' }} colSpan="10">
                    ── DEDUCTIONS ──
                  </th>
                  <th>Net Pay</th>
                </tr>
                <tr>
                  <th></th>
                  {/* Earnings sub-headers */}
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Basic</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>DP/GP</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>DA</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>HRA</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>CCA</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Spl.Pay</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Tr.Allow</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Spl.Allow</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Fest.Allow</th>
                  <th style={{ background: 'rgba(59,130,246,0.04)' }}>Others</th>
                  {/* Deductions sub-headers */}
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>EPF</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>CPF</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>PT</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>IT</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>SLI</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>GIS</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>LIC</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>Onam</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>HRA Rec.</th>
                  <th style={{ background: 'rgba(239,68,68,0.04)' }}>Others</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 && (
                  <tr><td colSpan="22" style={{ textAlign: 'center', padding: '2rem' }}>Add employees first.</td></tr>
                )}
                {employees.map(emp => {
                  const da = (emp.da_state || 0) + (emp.da_ugc || 0);
                  const hra = (emp.hra_state || 0) + (emp.hra_ugc || 0);
                  const gross = (emp.basic_pay||0)+(emp.dp_gp||0)+da+hra+(emp.cca||0)+(emp.spl_pay||0)+(emp.tr_allow||0)+(emp.spl_allow||0)+(emp.fest_allow||0)+(emp.other_earnings||0);
                  const dedux = (emp.epf||0)+(emp.cpf||0)+(emp.professional_tax||0)+(emp.income_tax||0)+(emp.sli||0)+(emp.gis||0)+(emp.lic||0)+(emp.onam_advance||0)+(emp.hra_recovery||0)+(emp.other_deductions||0);
                  const net = gross - dedux;
                  const isReadOnly = user?.role === 'approver' || user?.role === 'viewer' || (isApproved && user?.role === 'admin') || (isApproved && user?.role === 'super_admin' && !isOverrideActive);
                  const isRowGrey = isSubmitted && (user?.role === 'admin' || user?.role === 'super_admin');
                  const inp = (field) => (
                    <input type="number" className="form-control" 
                      style={{ 
                        ...inputStyle, 
                        backgroundColor: isReadOnly ? 'transparent' : (isRowGrey ? 'rgba(229,231,235,0.2)' : ''), 
                        border: isReadOnly ? 'none' : '',
                        textAlign: 'right',
                        fontWeight: isReadOnly ? '600' : 'normal',
                        color: isRowGrey ? '#9ca3af' : ((user?.role === 'approver' && !isApproved) ? '#000' : (isReadOnly ? '#fff' : 'var(--color-text-primary)'))
                      }}
                      value={emp[field] || ''} placeholder="0"
                      disabled={isReadOnly}
                      onChange={(e) => handleInputChange(emp.emp_id, field, e.target.value)} />
                  );
                  return (
                    <tr key={emp.emp_id} style={{ 
                      backgroundColor: isRowGrey 
                        ? 'rgba(229, 231, 235, 0.05)'
                        : (user?.role === 'approver' 
                            ? (!isApproved ? '#fefce8' : 'var(--color-bg-secondary)') 
                            : 'var(--color-bg-secondary)'),
                      color: isRowGrey ? '#9ca3af' : ''
                    }}>
                      <td>
                        <div 
                          style={{ 
                            fontWeight: 600, 
                            color: isRowGrey 
                              ? '#9ca3af' 
                              : ((user?.role === 'approver' && !isApproved) ? '#713f12' : (isReadOnly ? '#fff' : 'var(--color-primary)')), 
                            cursor: isReadOnly ? 'default' : 'pointer', 
                            textDecoration: isReadOnly ? 'none' : 'underline' 
                          }} 
                          onClick={() => !isReadOnly && openModal(emp)}
                        >
                          {emp.title ? `${emp.title} ` : ''}{emp.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: isRowGrey ? '#9ca3af' : ((user?.role === 'approver' && !isApproved) ? '#a16207' : 'var(--color-text-secondary)') }}>{emp.emp_id}</div>
                      </td>
                      <td>{inp('basic_pay')}</td>
                      <td>{inp('dp_gp')}</td>
                      <td><div style={{ padding: '0.2rem', fontWeight: isReadOnly ? 'bold' : 'normal', color: isRowGrey ? '#9ca3af' : ((user?.role === 'approver' && !isApproved) ? '#000' : (isReadOnly ? '#fff' : '')) }}>{da.toFixed(2)}</div></td>
                      <td><div style={{ padding: '0.2rem', fontWeight: isReadOnly ? 'bold' : 'normal', color: isRowGrey ? '#9ca3af' : ((user?.role === 'approver' && !isApproved) ? '#000' : (isReadOnly ? '#fff' : '')) }}>{hra.toFixed(2)}</div></td>
                      <td>{inp('cca')}</td>
                      <td>{inp('spl_pay')}</td>
                      <td>{inp('tr_allow')}</td>
                      <td>{inp('spl_allow')}</td>
                      <td>{inp('fest_allow')}</td>
                      <td>{inp('other_earnings')}</td>
                      <td style={{ fontWeight: 'bold', minWidth: '120px', color: isRowGrey ? '#9ca3af' : ((user?.role === 'approver' && !isApproved) ? '#000' : (isReadOnly ? '#fff' : '')) }}>
                        ₹{gross.toFixed(2)}
                      </td>
                      <td>{inp('epf')}</td>
                      <td>{inp('cpf')}</td>
                      <td>{inp('professional_tax')}</td>
                      <td>{inp('income_tax')}</td>
                      <td>{inp('sli')}</td>
                      <td>{inp('gis')}</td>
                      <td>{inp('lic')}</td>
                      <td>{emp.onam_advance ? inp('onam_advance') : (Math.round(emp.onam_advance||0))}</td>
                      <td>{inp('hra_recovery')}</td>
                      <td>{inp('other_deductions')}</td>
                      <td style={{ fontWeight: 'bold', minWidth: '100px', color: isRowGrey ? '#9ca3af' : ((user?.role === 'approver' && !isApproved) ? '#000' : (isReadOnly ? '#fff' : (net >= 0 ? 'var(--color-success)' : 'var(--color-danger)'))) }}>
                        ₹{net.toFixed(2)}
                      </td>
                      {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-secondary" onClick={() => calculateEmp(emp.emp_id)} title="Auto-calculate DA & HRA" style={{ padding: '0.25rem 0.5rem' }}>
                              <Calculator size={14} />
                            </button>
                            <button className="btn btn-secondary" onClick={() => copyFromPrevious(emp.emp_id)} title="Copy from Previous" style={{ padding: '0.25rem 0.5rem' }}>
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual Employee Modal */}
      {modalOpen && modalEmp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Data Entry: {modalEmp.title ? `${modalEmp.title} ` : ''}{modalEmp.name} ({modalEmp.emp_id})</h2>
              <button className="btn" style={{ padding: '0.3rem', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
              {/* Earnings Column */}
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(59,130,246,1)' }}>EARNINGS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Basic Pay</label>
                    <input type="number" name="basic_pay" value={modalEmp.basic_pay || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>DP/GP</label>
                    <input type="number" name="dp_gp" value={modalEmp.dp_gp || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>CCA</label>
                    <input type="number" name="cca" value={modalEmp.cca || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Special Pay</label>
                    <input type="number" name="spl_pay" value={modalEmp.spl_pay || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Travel Allow.</label>
                    <input type="number" name="tr_allow" value={modalEmp.tr_allow || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Special Allow.</label>
                    <input type="number" name="spl_allow" value={modalEmp.spl_allow || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Festival Allow.</label>
                    <input type="number" name="fest_allow" value={modalEmp.fest_allow || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Other Earnings Breakdown</span>
                      <button type="button" onClick={() => addBreakdownItem('earnings')} className="btn" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', backgroundColor: 'var(--color-success)', color: '#fff' }}>+ Add Item</button>
                    </label>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '0.5rem', paddingRight: '4px' }}>
                      {(modalEmp.other_earnings_breakdown || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input type="text" placeholder="Description" value={item.desc} onChange={(e) => updateBreakdownItem('earnings', idx, 'desc', e.target.value)} className="form-control" style={{ flex: 2, padding: '0.25rem 0.5rem' }} />
                          <input type="number" placeholder="Amount" value={item.amount || ''} onChange={(e) => updateBreakdownItem('earnings', idx, 'amount', e.target.value)} className="form-control" style={{ flex: 1, padding: '0.25rem 0.5rem' }} />
                          <button type="button" onClick={() => removeBreakdownItem('earnings', idx)} style={{ color: 'var(--color-danger)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.2rem' }}>&times;</button>
                        </div>
                      ))}
                      {(!modalEmp.other_earnings_breakdown || modalEmp.other_earnings_breakdown.length === 0) && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', padding: '0.25rem 0' }}>No specific items added.</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Total Other Earnings:</span>
                      <input type="number" name="other_earnings" value={modalEmp.other_earnings || ''} onChange={handleModalInput} className="form-control" style={{ width: '80px', padding: '0.2rem 0.4rem' }} disabled={(modalEmp.other_earnings_breakdown || []).length > 0} title={(modalEmp.other_earnings_breakdown || []).length > 0 ? "Calculated from breakdown" : "Manual entry"} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Deductions Column */}
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'rgba(239,68,68,1)' }}>DEDUCTIONS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>EPF</label>
                    <input type="number" name="epf" value={modalEmp.epf || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>CPF</label>
                    <input type="number" name="cpf" value={modalEmp.cpf || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Professional Tax</label>
                    <input type="number" name="professional_tax" value={modalEmp.professional_tax || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Income Tax</label>
                    <input type="number" name="income_tax" value={modalEmp.income_tax || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>SLI</label>
                    <input type="number" name="sli" value={modalEmp.sli || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>GIS</label>
                    <input type="number" name="gis" value={modalEmp.gis || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>LIC</label>
                    <input type="number" name="lic" value={modalEmp.lic || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Onam Advance</label>
                    <input type="number" name="onam_advance" value={modalEmp.onam_advance || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>HRA Recovery</label>
                    <input type="number" name="hra_recovery" value={modalEmp.hra_recovery || ''} onChange={handleModalInput} className="form-control" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Other Deductions Breakdown</span>
                      <button type="button" onClick={() => addBreakdownItem('deductions')} className="btn" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', backgroundColor: 'var(--color-success)', color: '#fff' }}>+ Add Item</button>
                    </label>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '0.5rem', paddingRight: '4px' }}>
                      {(modalEmp.other_deductions_breakdown || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <input type="text" placeholder="Description" value={item.desc} onChange={(e) => updateBreakdownItem('deductions', idx, 'desc', e.target.value)} className="form-control" style={{ flex: 2, padding: '0.25rem 0.5rem' }} />
                          <input type="number" placeholder="Amount" value={item.amount || ''} onChange={(e) => updateBreakdownItem('deductions', idx, 'amount', e.target.value)} className="form-control" style={{ flex: 1, padding: '0.25rem 0.5rem' }} />
                          <button type="button" onClick={() => removeBreakdownItem('deductions', idx)} style={{ color: 'var(--color-danger)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.2rem' }}>&times;</button>
                        </div>
                      ))}
                      {(!modalEmp.other_deductions_breakdown || modalEmp.other_deductions_breakdown.length === 0) && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', padding: '0.25rem 0' }}>No specific items added.</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Total Other Deductions:</span>
                      <input type="number" name="other_deductions" value={modalEmp.other_deductions || ''} onChange={handleModalInput} className="form-control" style={{ width: '80px', padding: '0.2rem 0.4rem' }} disabled={(modalEmp.other_deductions_breakdown || []).length > 0} title={(modalEmp.other_deductions_breakdown || []).length > 0 ? "Calculated from breakdown" : "Manual entry"} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              {(user?.role === 'admin' || user?.role === 'super_admin') && !(isApproved && user?.role !== 'super_admin') && (
                <button className="btn btn-primary" onClick={commitModalSave} style={{ width: '120px' }}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Full Screen Preview Overlay */}
      {showFullPreview && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: '#fff', zIndex: 9999, overflow: 'auto', padding: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #333', paddingBottom: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#000' }}>Monthly Paybill Verification Sheet</h1>
              <p style={{ margin: 0, color: '#333', fontWeight: 'bold' }}>Month: {formatMonthYear(monthYear)} | Status: Pending Approval</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowFullPreview(false)} style={{ backgroundColor: '#000', color: '#fff' }}>
              <X size={20} /> Close Preview
            </button>
          </div>
          
          <div style={{ overflowX: 'auto', backgroundColor: '#fff', width: '100%' }}>
            {(() => {
              const columns = [
                { key: 'basic_pay', label: 'Basic' },
                { key: 'dp_gp', label: 'DP/GP' },
                { key: 'da', label: 'DA', calc: (e) => e.category === 'ugc/csir' ? (e.da_ugc || 0) : (e.da_state || 0) },
                { key: 'hra', label: 'HRA', calc: (e) => e.category === 'ugc/csir' ? (e.hra_ugc || 0) : (e.hra_state || 0) },
                { key: 'cca', label: 'CCA' },
                { key: 'spl_pay', label: 'Spl.P' },
                { key: 'tr_allow', label: 'Tr.A' },
                { key: 'spl_allow', label: 'Spl.A' },
                { key: 'fest_allow', label: 'Fest.' },
                { key: 'other_earnings', label: 'Other' },
                { key: 'gross', label: 'Gross', isBold: true },
                { key: 'epf', label: 'EPF' },
                { key: 'cpf', label: 'CPF' },
                { key: 'professional_tax', label: 'Prof.T' },
                { key: 'income_tax', label: 'Inc.T' },
                { key: 'sli', label: 'SLI' },
                { key: 'gis', label: 'GIS' },
                { key: 'lic', label: 'LIC' },
                { key: 'onam_advance', label: 'Onam' },
                { key: 'hra_recovery', label: 'HRA.R' },
                { key: 'other_deductions', label: 'Other Ded' },
                { key: 'net', label: 'Net Pay', isBold: true }
              ];

              const activeCols = columns.filter(col => {
                if (col.key === 'basic_pay' || col.key === 'gross' || col.key === 'net') return true;
                return employees.some(emp => {
                  const val = col.calc ? col.calc(emp) : (emp[col.key] || 0);
                  return Math.abs(val) > 0.01;
                });
              });

              const earnCols = activeCols.filter(c => ['basic_pay', 'dp_gp', 'da', 'hra', 'cca', 'spl_pay', 'tr_allow', 'spl_allow', 'fest_allow', 'other_earnings', 'gross'].includes(c.key));
              const deduxCols = activeCols.filter(c => ['epf', 'cpf', 'professional_tax', 'income_tax', 'sli', 'gis', 'lic', 'onam_advance', 'hra_recovery', 'other_deductions'].includes(c.key));

              return (
                <table style={{ 
                  fontSize: '0.85rem', 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  border: '2px solid #000',
                  color: '#000'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e5e7eb', borderBottom: '2px solid #000' }}>
                      <th rowSpan="2" style={{ border: '1px solid #000', padding: '12px 8px', textAlign: 'left' }}>Employee Name</th>
                      <th colSpan={earnCols.length} style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>EARNINGS</th>
                      <th colSpan={deduxCols.length} style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>DEDUCTIONS</th>
                      <th rowSpan="2" style={{ border: '1px solid #000', padding: '12px 8px' }}>Net Pay</th>
                    </tr>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      {earnCols.map(c => (
                        <th key={c.key} style={{ border: '1px solid #000', padding: '6px', fontWeight: c.isBold ? 'bold' : '600' }}>{c.label}</th>
                      ))}
                      {deduxCols.map(c => (
                        <th key={c.key} style={{ border: '1px solid #000', padding: '6px' }}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, idx) => {
                      const da = (emp.category === 'ugc/csir' ? (emp.da_ugc || 0) : (emp.da_state || 0));
                      const hra = (emp.category === 'ugc/csir' ? (emp.hra_ugc || 0) : (emp.hra_state || 0));
                      const gross = (emp.basic_pay||0)+(emp.dp_gp||0)+da+hra+(emp.cca||0)+(emp.spl_pay||0)+(emp.tr_allow||0)+(emp.spl_allow||0)+(emp.fest_allow||0)+(emp.other_earnings||0);
                      const dedux = (emp.epf||0)+(emp.cpf||0)+(emp.professional_tax||0)+(emp.income_tax||0)+(emp.sli||0)+(emp.gis||0)+(emp.lic||0)+(emp.onam_advance||0)+(emp.hra_recovery||0)+(emp.other_deductions||0);
                      const net = gross - dedux;
                      
                      const getVal = (col) => {
                        if (col.key === 'da') return da;
                        if (col.key === 'hra') return hra;
                        if (col.key === 'gross') return gross;
                        if (col.key === 'net') return net;
                        return emp[col.key] || 0;
                      };

                      return (
                        <tr key={emp.emp_id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                          <td style={{ fontWeight: 'bold', border: '1px solid #000', padding: '8px', color: '#000' }}>{emp.name}</td>
                          {earnCols.map(c => (
                            <td key={c.key} style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', color: '#000', fontWeight: c.isBold ? 'bold' : 'normal' }}>
                              {Math.round(getVal(c))}
                            </td>
                          ))}
                          {deduxCols.map(c => (
                            <td key={c.key} style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', color: '#000' }}>
                              {Math.round(getVal(c))}
                            </td>
                          ))}
                          <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>₹{Math.round(net)}</td>
                        </tr>
                      );
                    })}
                    {/* Grand Total Row */}
                    <tr style={{ backgroundColor: '#e5e7eb', fontWeight: 'bold', borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                      <td style={{ border: '1px solid #000', padding: '10px 8px', color: '#000' }}>Grand Total</td>
                      {earnCols.map(c => {
                        const total = employees.reduce((sum, emp) => {
                          const da = (emp.category === 'ugc/csir' ? (emp.da_ugc || 0) : (emp.da_state || 0));
                          const hra = (emp.category === 'ugc/csir' ? (emp.hra_ugc || 0) : (emp.hra_state || 0));
                          const gross = (emp.basic_pay||0)+(emp.dp_gp||0)+da+hra+(emp.cca||0)+(emp.spl_pay||0)+(emp.tr_allow||0)+(emp.spl_allow||0)+(emp.fest_allow||0)+(emp.other_earnings||0);
                          
                          if (c.key === 'da') return sum + da;
                          if (c.key === 'hra') return sum + hra;
                          if (c.key === 'gross') return sum + gross;
                          return sum + (emp[c.key] || 0);
                        }, 0);
                        return (
                          <td key={c.key} style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', color: '#000' }}>
                            {Math.round(total)}
                          </td>
                        );
                      })}
                      {deduxCols.map(c => {
                        const total = employees.reduce((sum, emp) => {
                          return sum + (emp[c.key] || 0);
                        }, 0);
                        return (
                          <td key={c.key} style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', color: '#000' }}>
                            {Math.round(total)}
                          </td>
                        );
                      })}
                      <td style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'right', color: '#000' }}>
                        ₹{Math.round(employees.reduce((sum, emp) => {
                          const da = (emp.category === 'ugc/csir' ? (emp.da_ugc || 0) : (emp.da_state || 0));
                          const hra = (emp.category === 'ugc/csir' ? (emp.hra_ugc || 0) : (emp.hra_state || 0));
                          const gross = (emp.basic_pay||0)+(emp.dp_gp||0)+da+hra+(emp.cca||0)+(emp.spl_pay||0)+(emp.tr_allow||0)+(emp.spl_allow||0)+(emp.fest_allow||0)+(emp.other_earnings||0);
                          const dedux = (emp.epf||0)+(emp.cpf||0)+(emp.professional_tax||0)+(emp.income_tax||0)+(emp.sli||0)+(emp.gis||0)+(emp.lic||0)+(emp.onam_advance||0)+(emp.hra_recovery||0)+(emp.other_deductions||0);
                          return sum + (gross - dedux);
                        }, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Paybill;
