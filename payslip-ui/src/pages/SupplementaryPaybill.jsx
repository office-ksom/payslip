import React, { useState, useEffect } from 'react';
import { Calculator, Save, Copy, X, ShieldCheck, Search, ShieldAlert, XCircle, Trash2, UserPlus, Eye, EyeOff } from 'lucide-react';
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

const getDaysInMonth = (monthYearStr) => {
  if (!monthYearStr) return 30;
  const [year, month] = monthYearStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

const SupplementaryPaybill = (props) => {
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
  const [allEmployeesList, setAllEmployeesList] = useState([]);
  const [selectedAddEmpId, setSelectedAddEmpId] = useState('');
  const [globalSettingsList, setGlobalSettingsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Approval state
  const [isApproved, setIsApproved] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [approvalInfo, setApprovalInfo] = useState(null);
  const [approving, setApproving] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
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
      .catch(err => console.error("Failed to load users in SupplementaryPaybill", err));

    fetch('/api/employees')
      .then(res => res.json())
      .then(data => setAllEmployeesList(Array.isArray(data) ? data.filter(e => e.is_active === 1) : []))
      .catch(err => console.error("Failed to load employees list", err));
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
      try {
        const sysRes = await fetch('/api/settings/system');
        if (sysRes.ok) {
          const sysData = await sysRes.json();
          setRequireApproval(sysData.require_approval !== '0');
        }
      } catch (e) {
        console.error("Failed to load system settings", e);
      }

      const settingsRes = await fetch('/api/settings');
      if (!settingsRes.ok) {
        const err = await settingsRes.json();
        throw new Error(err.error || "Failed to load settings");
      }
      const settingsData = await settingsRes.json();
      setGlobalSettingsList(settingsData);

      const suppRes = await fetch(`/api/supplementary/${targetMonth}`);
      if (!suppRes.ok) {
        const err = await suppRes.json();
        throw new Error(err.error || "Failed to load supplementary paybill");
      }
      const suppData = await suppRes.json();

      try {
        const approvalRes = await fetch(`/api/supplementary/approve/${targetMonth}`);
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

      const combined = suppData.map(empEarn => {
        return {
          ...empEarn,
          num_days: empEarn.num_days || 0,
          regular_basic: empEarn.regular_basic || 0,
          basic_pay: empEarn.basic_pay || 0,
          dp_gp: empEarn.dp_gp || 0,
          spl_pay: empEarn.spl_pay || 0,
          tr_allow: empEarn.tr_allow || 0,
          spl_allow: empEarn.spl_allow || 0,
          fest_allow: empEarn.fest_allow || 0,
          epf: empEarn.epf || 0,
          cpf: empEarn.cpf || 0,
          professional_tax: empEarn.professional_tax || 0,
          income_tax: empEarn.income_tax || 0,
          sli: empEarn.sli || 0,
          lic: empEarn.lic || 0,
          gis: empEarn.gis || 0,
          onam_advance: empEarn.onam_advance || 0,
          hra_recovery: empEarn.hra_recovery || 0,
          other_deductions: empEarn.other_deductions || 0,
          other_earnings_breakdown: empEarn.other_earnings_breakdown ? JSON.parse(empEarn.other_earnings_breakdown) : [],
          other_deductions_breakdown: empEarn.other_deductions_breakdown ? JSON.parse(empEarn.other_deductions_breakdown) : [],
          has_saved_bill: true
        };
      });

      setEmployees(combined);
    } catch (err) {
      console.error(err);
      alert('Failed to load supplementary paybill data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!selectedAddEmpId) return;
    if (employees.some(e => e.emp_id === selectedAddEmpId)) {
      alert("Employee is already added to this supplementary paybill.");
      return;
    }
    const fullEmp = allEmployeesList.find(e => e.emp_id === selectedAddEmpId);
    if (!fullEmp) return;

    let defaultBasic = 0;
    try {
      // 1. Check current month's regular paybill
      const currRes = await fetch(`/api/earnings/${monthYear}`);
      if (currRes.ok) {
        const currData = await currRes.json();
        const found = currData.find(x => x.emp_id === selectedAddEmpId);
        if (found && found.basic_pay) {
          defaultBasic = found.basic_pay;
        }
      }
      
      // 2. Check previous month's regular paybill if not found in current
      if (defaultBasic === 0) {
        const [year, month] = monthYear.split('-');
        let py = parseInt(year);
        let pm = parseInt(month) - 1;
        if (pm === 0) { pm = 12; py -= 1; }
        const prevMonth = `${py}-${String(pm).padStart(2, '0')}`;
        const prevRes = await fetch(`/api/earnings/${prevMonth}`);
        if (prevRes.ok) {
          const prevData = await prevRes.json();
          const found = prevData.find(x => x.emp_id === selectedAddEmpId);
          if (found && found.basic_pay) {
            defaultBasic = found.basic_pay;
          }
        }
      }
    } catch (e) {
      console.error("Failed to auto-fetch reference basic pay", e);
    }

    const newRow = {
      ...fullEmp,
      num_days: 0,
      regular_basic: defaultBasic,
      basic_pay: 0,
      dp_gp: 0,
      da_state: 0,
      da_ugc: 0,
      hra_state: 0,
      hra_ugc: 0,
      cca: 0,
      other_earnings: 0,
      spl_pay: 0,
      tr_allow: 0,
      spl_allow: 0,
      fest_allow: 0,
      epf: 0,
      cpf: 0,
      professional_tax: 0,
      sli: 0,
      gis: 0,
      lic: 0,
      income_tax: 0,
      onam_advance: 0,
      hra_recovery: 0,
      other_deductions: 0,
      other_earnings_breakdown: [],
      other_deductions_breakdown: [],
      is_approved: 0,
      has_saved_bill: false
    };

    setEmployees(prev => [...prev, newRow]);
    setSelectedAddEmpId('');
  };

  const handleInputChange = (emp_id, field, value) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.emp_id !== emp_id) return emp;
      const updated = { ...emp, [field]: parseFloat(value) || 0 };

      if (field === 'num_days' || field === 'regular_basic') {
        const numDays = field === 'num_days' ? parseInt(value) || 0 : emp.num_days || 0;
        const regBasic = field === 'regular_basic' ? parseFloat(value) || 0 : emp.regular_basic || 0;
        const daysInMonth = getDaysInMonth(monthYear);
        updated.basic_pay = Math.round(numDays * (regBasic / daysInMonth));

        // Auto calculate DA & HRA based on new basic pay
        const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {};
        const isState = emp.category === 'state';
        const isUGC = emp.category === 'ugc/csir' || emp.category === 'ugc';
        const da_pct = isState ? (activeRule.da_state_percentage || 0) : isUGC ? (activeRule.da_ugc_percentage || 0) : 0;
        const hra_pct = isState ? (activeRule.hra_state_percentage || 0) : isUGC ? (activeRule.hra_ugc_percentage || 0) : 0;
        const base = updated.basic_pay + (updated.dp_gp || 0);
        const da = Math.round((base * da_pct) / 100);
        const hra = Math.round((base * hra_pct) / 100);

        updated.da_state = isState ? da : 0;
        updated.da_ugc = isUGC ? da : 0;
        updated.hra_state = isState ? hra : 0;
        updated.hra_ugc = isUGC ? hra : 0;
      }

      return updated;
    }));
  };

  const applyCalculations = () => {
    const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {};
    setEmployees(prev => prev.map(emp => {
      const isState = emp.category === 'state';
      const isUGC = emp.category === 'ugc/csir' || emp.category === 'ugc';
      const da_pct = isState ? (activeRule.da_state_percentage || 0) : isUGC ? (activeRule.da_ugc_percentage || 0) : 0;
      const hra_pct = isState ? (activeRule.hra_state_percentage || 0) : isUGC ? (activeRule.hra_ugc_percentage || 0) : 0;
      const base = emp.basic_pay + (emp.dp_gp || 0);
      const da = Math.round((base * da_pct) / 100);
      const hra = Math.round((base * hra_pct) / 100);
      return {
        ...emp,
        da_state: isState ? da : 0,
        da_ugc: isUGC ? da : 0,
        hra_state: isState ? hra : 0,
        hra_ugc: isUGC ? hra : 0,
      };
    }));
  };

  const calculateEmp = (empId) => {
    const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {};
    setEmployees(prev => prev.map(emp => {
      if (emp.emp_id !== empId) return emp;
      const isState = emp.category === 'state';
      const isUGC = emp.category === 'ugc/csir' || emp.category === 'ugc';
      const da_pct = isState ? (activeRule.da_state_percentage || 0) : isUGC ? (activeRule.da_ugc_percentage || 0) : 0;
      const hra_pct = isState ? (activeRule.hra_state_percentage || 0) : isUGC ? (activeRule.hra_ugc_percentage || 0) : 0;
      const base = emp.basic_pay + (emp.dp_gp || 0);
      const da = Math.round((base * da_pct) / 100);
      const hra = Math.round((base * hra_pct) / 100);
      return {
        ...emp,
        da_state: isState ? da : 0,
        da_ugc: isUGC ? da : 0,
        hra_state: isState ? hra : 0,
        hra_ugc: isUGC ? hra : 0,
      };
    }));
  };

  const handleDelete = async (empId) => {
    if (!window.confirm("Are you sure you want to delete the supplementary paybill record for this employee?")) return;
    try {
      const res = await fetch(`/api/supplementary/${monthYear}?emp_id=${empId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Supplementary paybill record deleted successfully.");
        loadDataForMonth(monthYear);
      } else {
        const err = await res.json();
        alert("Deletion failed: " + err.error);
      }
    } catch (e) {
      alert("Network error.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = employees.map(emp => ({
        emp_id: emp.emp_id,
        num_days: emp.num_days,
        regular_basic: emp.regular_basic,
        basic_pay: emp.basic_pay,
        dp_gp: emp.dp_gp,
        da_state: emp.da_state,
        da_ugc: emp.da_ugc,
        hra_state: emp.hra_state,
        hra_ugc: emp.hra_ugc,
        cca: emp.cca,
        other_earnings: emp.other_earnings,
        spl_pay: emp.spl_pay,
        tr_allow: emp.tr_allow,
        spl_allow: emp.spl_allow,
        fest_allow: emp.fest_allow,
        other_earnings_breakdown: emp.other_earnings_breakdown,
        epf: emp.epf,
        cpf: emp.cpf,
        professional_tax: emp.professional_tax,
        sli: emp.sli,
        gis: emp.gis,
        lic: emp.lic,
        income_tax: emp.income_tax,
        onam_advance: emp.onam_advance,
        hra_recovery: emp.hra_recovery,
        other_deductions: emp.other_deductions,
        other_deductions_breakdown: emp.other_deductions_breakdown
      }));

      const res = await fetch(`/api/supplementary/${monthYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: payload })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save supplementary paybill');
      }

      alert('Supplementary Paybill Saved Successfully!');
      loadDataForMonth(monthYear);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    const confirmMessage = `OFFICIAL CONFIRMATION REQUIRED:\n\n` +
      `You are about to APPROVE the supplementary paybill for ${formatMonthYear(monthYear)}.\n\n` +
      `By clicking OK, you verify that all earnings and deductions for the listed employees are correct.\n` +
      `This action will PERMANENTLY LOCK the records for this month.\n\n` +
      `Proceed with approval?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setApproving(true);
    try {
      const res = await fetch(`/api/supplementary/approve/${monthYear}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Supplementary paybill approved successfully!');
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
      `Are you sure you want to SUBMIT the supplementary paybill for ${formatMonthYear(monthYear)} for approval?`;
    if (!window.confirm(confirmMessage)) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/supplementary/approve/${monthYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit' })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Supplementary paybill submitted for approval successfully!');
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
      `You are about to REJECT the supplementary paybill for ${formatMonthYear(monthYear)}.\n\n` +
      `Proceed with rejection?`;
    if (!window.confirm(confirmMessage)) return;
    
    setApproving(true);
    try {
      const res = await fetch(`/api/supplementary/approve/${monthYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Supplementary paybill rejected successfully!');
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

  const inputStyle = { padding: '0.2rem 0.3rem', width: '70px' };

  const [yr, mn] = (monthYear || '').split('-');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthDisplay = mn ? `${monthNames[parseInt(mn)-1]} ${yr}` : monthYear;


  if (user?.role === 'approver' && !isSubmitted && !isApproved) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Supplementary Paybill</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              Verify earnings and deductions, then approve or reject the submitted supplementary paybill.
            </p>
          </div>
          <input type="month" className="form-control" value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)} />
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert size={48} style={{ color: '#d97706' }} />
          <h2 style={{ fontSize: '1.5rem', color: '#854d0e', margin: 0 }}>No Supplementary Paybill Submitted</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: 0 }}>
            The supplementary salary paybill for {monthDisplay} has not been submitted for approval yet. Once submitted by the Admin or Super Admin, it will appear here for your review and approval.
          </p>
        </div>
      </div>
    );
  }

  const isReadOnly = isApproved && (!isOverrideActive || user?.role !== 'super_admin');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Supplementary Paybill Generation</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Generate supplementary salary paybills for employees for a certain number of days.
          </p>
          {globalSettingsList.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', background: 'rgba(59,130,246,0.1)', padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'inline-block' }}>
              <strong>Active Rules for {formatMonthYear(monthYear)}:</strong> State (DA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).da_state_percentage || 0}%, HRA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).hra_state_percentage || 0}%) | UGC/CSIR (DA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).da_ugc_percentage || 0}%, HRA: {(globalSettingsList.find(r => r.effective_from <= monthYear) || {}).hra_ugc_percentage || 0}%)
            </div>
          )}
        </div>
        <input type="month" className="form-control" value={monthYear}
          onChange={(e) => setMonthYear(e.target.value)} style={{ width: '150px' }} />
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
              This supplementary paybill was rejected by the approver. Please make corrections, save, and submit for approval again.
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

      {/* Dropdown utility to add employees dynamically */}
      {!isReadOnly && user?.role !== 'approver' && !showFullPreview && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px dashed var(--color-accent-primary)', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', fontWeight: 700 }}>
            Add Employee dynamically
          </h4>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '250px' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Staff Member</label>
              <select className="form-control" value={selectedAddEmpId} onChange={(e) => setSelectedAddEmpId(e.target.value)}>
                <option value="">-- Choose Employee --</option>
                {allEmployeesList.map(emp => (
                  <option key={emp.emp_id} value={emp.emp_id}>
                    {emp.name} ({emp.emp_id}) - {emp.designation}
                  </option>
                ))}
              </select>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleAddEmployee} 
              disabled={!selectedAddEmpId}
              style={{ border: '1px solid var(--color-accent-primary)', color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UserPlus size={16} /> Add to Bill
            </button>
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
              <button className="btn btn-secondary" onClick={applyCalculations} disabled={isReadOnly}>
                <Calculator size={18} /> Auto Calculate DA & HRA
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setShowFullPreview(true)}
              >
                <Search size={18} /> Preview Full Sheet
              </button>
            )}
            {((user?.role === 'admin' && !isApproved) || (user?.role === 'super_admin' && (!isApproved || isOverrideActive))) && (
              <>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || isReadOnly}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Paybill'}
                </button>
                {!requireApproval ? (
                  <button 
                    className="btn" 
                    onClick={handleApprove} 
                    disabled={saving || approving || isReadOnly}
                    style={{ 
                      backgroundColor: 'var(--color-success)', 
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
                    <ShieldCheck size={18} /> {approving ? 'Locking...' : 'Verify & Lock'}
                  </button>
                ) : (
                  !isSubmitted && (
                    <button 
                      className="btn" 
                      onClick={handleSubmit} 
                      disabled={saving || isReadOnly}
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
                  )
                )}
              </>
            )}
            {isSubmitted && !isApproved && requireApproval && (
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
                  type="button" 
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
            <table className="table" style={{ fontSize: '0.78rem', minWidth: '2000px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-bg-secondary)', zIndex: 1, boxShadow: '0 1px 0 var(--color-border)' }}>
                <tr>
                  <th style={{ minWidth: '130px' }}>Employee</th>
                  <th style={{ minWidth: '70px', background: 'rgba(59,130,246,0.02)' }}>Days</th>
                  <th style={{ minWidth: '95px', background: 'rgba(59,130,246,0.02)' }}>Reg. Basic</th>
                  <th style={{ background: 'rgba(59,130,246,0.06)', textAlign:'center', padding:'0.5rem 0' }} colSpan="11">
                    ── EARNINGS ──
                  </th>
                  <th style={{ background: 'rgba(239,68,68,0.06)', textAlign:'center', padding:'0.5rem 0' }} colSpan="10">
                    ── DEDUCTIONS ──
                  </th>
                  <th>Net Pay</th>
                  {(user?.role === 'admin' || user?.role === 'super_admin') && <th style={{ minWidth: '80px' }}>Action</th>}
                </tr>
                <tr>
                  <th style={{ top: '30px' }}>Name / ID / Scale</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.02)' }}>Days Worked</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.02)' }}>Reference Basic</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.06)' }}>Basic Pay</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.04)' }}>DP/GP</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.04)' }}>DA (State)</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.04)' }}>DA (UGC)</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.04)' }}>HRA (State)</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.04)' }}>HRA (UGC)</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.04)' }}>CCA</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.04)' }}>Spl Pay</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.04)' }}>Tr Allow</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.04)' }}>Spl Allow</th>
                  <th style={{ top: '30px', background: 'rgba(59,130,246,0.04)' }}>Other Earn</th>
                  <th style={{ top: '30px', background: 'rgba(239,68,68,0.04)' }}>EPF</th>
                  <th style={{ top: '30px', background: 'rgba(239,68,68,0.04)' }}>CPF</th>
                  <th style={{ top: '30px', background: 'rgba(239,68,68,0.04)' }}>Prof Tax</th>
                  <th style={{ top: '30px', background: 'rgba(239,68,68,0.04)' }}>Income Tax</th>
                  <th style={{ top: '30px', background: 'rgba(239,68,68,0.04)' }}>SLI</th>
                  <th style={{ top: '30px', background: 'rgba(239,68,68,0.04)' }}>GIS</th>
                  <th style={{ top: '30px', background: 'rgba(239,68,68,0.04)' }}>LIC</th>
                  <th style={{ top: '30px', background: 'rgba(239,68,68,0.04)' }}>Onam Adv</th>
                  <th style={{ top: '30px', background: 'rgba(239,68,68,0.04)' }}>HRA Rec</th>
                  <th style={{ top: '30px', background: 'rgba(239,68,68,0.04)' }}>Other Ded</th>
                  <th style={{ top: '30px' }}>Net Pay Amount</th>
                  {(user?.role === 'admin' || user?.role === 'super_admin') && <th style={{ top: '30px' }}></th>}
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={27} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      No employees added to this supplementary paybill yet. Use the dropdown above to add employees.
                    </td>
                  </tr>
                )}
                {employees.map(emp => {
                  const da = (parseFloat(emp.da_state) || 0) + (parseFloat(emp.da_ugc) || 0);
                  const hra = (parseFloat(emp.hra_state) || 0) + (parseFloat(emp.hra_ugc) || 0);
                  const gross = Math.round((emp.basic_pay||0)+(emp.dp_gp||0)+da+hra+(emp.cca||0)+(emp.spl_pay||0)+(emp.tr_allow||0)+(emp.spl_allow||0)+(emp.fest_allow||0)+(emp.other_earnings||0));
                  const dedux = Math.round((emp.epf||0)+(emp.cpf||0)+(emp.professional_tax||0)+(emp.income_tax||0)+(emp.sli||0)+(emp.gis||0)+(emp.lic||0)+(emp.onam_advance||0)+(emp.hra_recovery||0)+(emp.other_deductions||0));
                  const net = gross - dedux;

                  const inp = (field, type = 'number') => (
                    <input
                      type={type}
                      value={emp[field] || ''}
                      onChange={(e) => handleInputChange(emp.emp_id, field, e.target.value)}
                      disabled={isReadOnly || user?.role === 'approver'}
                      style={{
                        ...inputStyle,
                        border: emp[field] > 0 ? '1px solid #10b981' : '1px solid var(--color-border)'
                      }}
                    />
                  );

                  return (
                    <tr key={emp.emp_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                          {emp.title ? `${emp.title} ` : ''}{emp.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>ID: {emp.emp_id}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                          {emp.category === 'ugc/csir' ? 'UGC' : emp.category} | {emp.designation}
                        </div>
                      </td>
                      <td style={{ background: 'rgba(59,130,246,0.02)' }}>
                        <input
                          type="number"
                          value={emp.num_days || ''}
                          onChange={(e) => handleInputChange(emp.emp_id, 'num_days', parseInt(e.target.value) || 0)}
                          disabled={isReadOnly || user?.role === 'approver'}
                          style={{
                            ...inputStyle,
                            width: '55px',
                            fontWeight: 'bold',
                            border: '1px solid var(--color-accent-primary)'
                          }}
                        />
                      </td>
                      <td style={{ background: 'rgba(59,130,246,0.02)' }}>
                        <input
                          type="number"
                          value={emp.regular_basic || ''}
                          onChange={(e) => handleInputChange(emp.emp_id, 'regular_basic', parseFloat(e.target.value) || 0)}
                          disabled={isReadOnly || user?.role === 'approver'}
                          style={{
                            ...inputStyle,
                            width: '80px',
                            fontWeight: 'bold',
                            border: '1px solid var(--color-accent-primary)'
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={emp.basic_pay || ''}
                          disabled
                          style={{
                            ...inputStyle,
                            background: '#f3f4f6',
                            fontWeight: 'bold'
                          }}
                        />
                      </td>
                      <td>{inp('dp_gp')}</td>
                      <td>{inp('da_state')}</td>
                      <td>{inp('da_ugc')}</td>
                      <td>{inp('hra_state')}</td>
                      <td>{inp('hra_ugc')}</td>
                      <td>{inp('cca')}</td>
                      <td>{inp('spl_pay')}</td>
                      <td>{inp('tr_allow')}</td>
                      <td>{inp('spl_allow')}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-secondary" 
                          onClick={() => openModal(emp)}
                          style={{ padding: '0.2rem 0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                        >
                          Details (₹{Math.round(emp.other_earnings)})
                        </button>
                      </td>
                      <td>{inp('epf')}</td>
                      <td>{inp('cpf')}</td>
                      <td>{inp('professional_tax')}</td>
                      <td>{inp('income_tax')}</td>
                      <td>{inp('sli')}</td>
                      <td>{inp('gis')}</td>
                      <td>{inp('lic')}</td>
                      <td>{inp('onam_advance')}</td>
                      <td>{inp('hra_recovery')}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-secondary" 
                          onClick={() => openModal(emp)}
                          style={{ padding: '0.2rem 0.5rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}
                        >
                          Details (₹{Math.round(emp.other_deductions)})
                        </button>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--color-success)' }}>
                        ₹ {net.toLocaleString('en-IN')}
                      </td>
                      {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <td>
                          <button 
                            className="btn btn-danger btn-sm" 
                            disabled={isReadOnly}
                            onClick={() => {
                              if (emp.has_saved_bill) {
                                handleDelete(emp.emp_id);
                              } else {
                                setEmployees(prev => prev.filter(x => x.emp_id !== emp.emp_id));
                              }
                            }}
                            style={{ padding: '0.3rem 0.5rem', borderRadius: '4px' }}
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* Breakdown Details Modal */}
      {modalOpen && modalEmp && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{modalEmp.name} - Custom Breakdowns</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Enter custom items that roll up to other earnings or deductions.</p>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Earnings Breakdown */}
              <div>
                <h4 style={{ color: 'var(--color-success)', marginBottom: '1rem', fontWeight: 'bold' }}>Other Earnings (Total: ₹{Math.round(modalEmp.other_earnings)})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(modalEmp.other_earnings_breakdown || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Description" 
                        value={item.desc || ''} 
                        onChange={(e) => updateBreakdownItem('earnings', idx, 'desc', e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                      />
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Amount" 
                        value={item.amount || ''} 
                        onChange={(e) => updateBreakdownItem('earnings', idx, 'amount', e.target.value)}
                        style={{ width: '90px', fontSize: '0.85rem', padding: '0.4rem', textAlign: 'right' }}
                      />
                      <button className="btn btn-danger btn-sm" onClick={() => removeBreakdownItem('earnings', idx)} style={{ padding: '0.4rem' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={() => addBreakdownItem('earnings')} style={{ marginTop: '0.5rem' }}>
                    + Add Item
                  </button>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div>
                <h4 style={{ color: 'var(--color-danger)', marginBottom: '1rem', fontWeight: 'bold' }}>Other Deductions (Total: ₹{Math.round(modalEmp.other_deductions)})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(modalEmp.other_deductions_breakdown || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Description" 
                        value={item.desc || ''} 
                        onChange={(e) => updateBreakdownItem('deductions', idx, 'desc', e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.4rem' }}
                      />
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Amount" 
                        value={item.amount || ''} 
                        onChange={(e) => updateBreakdownItem('deductions', idx, 'amount', e.target.value)}
                        style={{ width: '90px', fontSize: '0.85rem', padding: '0.4rem', textAlign: 'right' }}
                      />
                      <button className="btn btn-danger btn-sm" onClick={() => removeBreakdownItem('deductions', idx)} style={{ padding: '0.4rem' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-secondary btn-sm" onClick={() => addBreakdownItem('deductions')} style={{ marginTop: '0.5rem' }}>
                    + Add Item
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={commitModalSave}>Apply & Close</button>
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
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#000' }}>Supplementary Salary Verification Sheet</h1>
              <p style={{ margin: 0, color: '#333', fontWeight: 'bold' }}>Month: {formatMonthYear(monthYear)} | Status: {isApproved ? 'Approved & Locked' : isSubmitted ? 'Pending Approval' : 'Draft'}</p>
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
                { key: 'da', label: 'DA', calc: (e) => (e.category === 'ugc/csir' || e.category === 'ugc') ? (e.da_ugc || 0) : (e.da_state || 0) },
                { key: 'hra', label: 'HRA', calc: (e) => (e.category === 'ugc/csir' || e.category === 'ugc') ? (e.hra_ugc || 0) : (e.hra_state || 0) },
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
                      <th rowSpan="2" style={{ border: '1px solid #000', padding: '12px 8px', textAlign: 'center' }}>Days</th>
                      <th rowSpan="2" style={{ border: '1px solid #000', padding: '12px 8px', textAlign: 'right' }}>Ref. Basic</th>
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
                      const da = (emp.category === 'ugc/csir' || emp.category === 'ugc') ? (emp.da_ugc || 0) : (emp.da_state || 0);
                      const hra = (emp.category === 'ugc/csir' || emp.category === 'ugc') ? (emp.hra_ugc || 0) : (emp.hra_state || 0);
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
                          <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', color: '#000' }}>{emp.num_days}</td>
                          <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', color: '#000' }}>{Math.round(emp.regular_basic).toFixed(2)}</td>
                          {earnCols.map(c => (
                            <td key={c.key} style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', color: '#000', fontWeight: c.isBold ? 'bold' : 'normal' }}>
                              {Math.round(getVal(c)).toFixed(2)}
                            </td>
                          ))}
                          {deduxCols.map(c => (
                            <td key={c.key} style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', color: '#000' }}>
                              {Math.round(getVal(c)).toFixed(2)}
                            </td>
                          ))}
                          <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>₹{Math.round(net).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    {/* Grand Total Row */}
                    <tr style={{ backgroundColor: '#e5e7eb', fontWeight: 'bold', borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                      <td style={{ border: '1px solid #000', padding: '10px 8px', color: '#000' }}>Grand Total</td>
                      <td style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'center', color: '#000' }}>
                        {employees.reduce((sum, emp) => sum + (emp.num_days || 0), 0)}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'right', color: '#000' }}>
                        {Math.round(employees.reduce((sum, emp) => sum + (emp.regular_basic || 0), 0)).toFixed(2)}
                      </td>
                      {earnCols.map(c => {
                        const total = employees.reduce((sum, emp) => {
                          const da = (emp.category === 'ugc/csir' || emp.category === 'ugc') ? (emp.da_ugc || 0) : (emp.da_state || 0);
                          const hra = (emp.category === 'ugc/csir' || emp.category === 'ugc') ? (emp.hra_ugc || 0) : (emp.hra_state || 0);
                          const gross = (emp.basic_pay||0)+(emp.dp_gp||0)+da+hra+(emp.cca||0)+(emp.spl_pay||0)+(emp.tr_allow||0)+(emp.spl_allow||0)+(emp.fest_allow||0)+(emp.other_earnings||0);
                          
                          if (c.key === 'da') return sum + da;
                          if (c.key === 'hra') return sum + hra;
                          if (c.key === 'gross') return sum + gross;
                          return sum + (emp[c.key] || 0);
                        }, 0);
                        return (
                          <td key={c.key} style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', color: '#000' }}>
                            {Math.round(total).toFixed(2)}
                          </td>
                        );
                      })}
                      {deduxCols.map(c => {
                        const total = employees.reduce((sum, emp) => {
                          return sum + (emp[c.key] || 0);
                        }, 0);
                        return (
                          <td key={c.key} style={{ border: '1px solid #000', padding: '6px', textAlign: 'right', color: '#000' }}>
                            {Math.round(total).toFixed(2)}
                          </td>
                        );
                      })}
                      <td style={{ border: '1px solid #000', padding: '10px 8px', textAlign: 'right', color: '#000' }}>
                        ₹{Math.round(employees.reduce((sum, emp) => {
                          const da = (emp.category === 'ugc/csir' || emp.category === 'ugc') ? (emp.da_ugc || 0) : (emp.da_state || 0);
                          const hra = (emp.category === 'ugc/csir' || emp.category === 'ugc') ? (emp.hra_ugc || 0) : (emp.hra_state || 0);
                          const gross = (emp.basic_pay||0)+(emp.dp_gp||0)+da+hra+(emp.cca||0)+(emp.spl_pay||0)+(emp.tr_allow||0)+(emp.spl_allow||0)+(emp.fest_allow||0)+(emp.other_earnings||0);
                          const dedux = (emp.epf||0)+(emp.cpf||0)+(emp.professional_tax||0)+(emp.income_tax||0)+(emp.sli||0)+(emp.gis||0)+(emp.lic||0)+(emp.onam_advance||0)+(emp.hra_recovery||0)+(emp.other_deductions||0);
                          return sum + (gross - dedux);
                        }, 0)).toFixed(2)}
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

export default SupplementaryPaybill;
