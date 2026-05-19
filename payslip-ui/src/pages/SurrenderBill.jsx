import React, { useState, useEffect } from 'react';
import { Calculator, Save, ShieldCheck, Search, Trash2, Calendar, FileText, AlertTriangle, XCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const getFinancialYear = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const y = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  if (m >= 4) {
    return `${y}-${y + 1}`;
  } else {
    return `${y - 1}-${y}`;
  }
};

const fmt = (v) => (parseFloat(v) || 0).toFixed(2);

const SurrenderBill = (props) => {
  const { user: contextUser } = useOutletContext() || {};
  const user = props.user || contextUser;

  if (user?.role === 'viewer') {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>;
  }

  const [employees, setEmployees] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [globalSettingsList, setGlobalSettingsList] = useState([]);
  
  // Selection & form states
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [billDate, setBillDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [basicPay, setBasicPay] = useState(0);
  const [da, setDa] = useState(0);
  const [hra, setHra] = useState(0);
  const [numEls, setNumEls] = useState(30);
  const [totalAmount, setTotalAmount] = useState(0);

  // Validation/FY states
  const [cumulativeSurrendered, setCumulativeSurrendered] = useState(0);
  const [loadingCumulative, setLoadingCumulative] = useState(false);

  // Month-year for grouping / displaying existing bills
  const [monthYear, setMonthYear] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [viewType, setViewType] = useState('month'); // 'month' or 'year'

  const [existingBills, setExistingBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [saving, setSaving] = useState(false);

  // Approval state
  const [isApproved, setIsApproved] = useState(false);
  const [approvalInfo, setApprovalInfo] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [isOverrideActive, setIsOverrideActive] = useState(false);
  
  // Selected employee IDs for selective approval
  const [selectedEmpIds, setSelectedEmpIds] = useState(new Set());

  // Dropdown search term
  const [searchTerm, setSearchTerm] = useState('');

  // Update month-year when bill date changes
  useEffect(() => {
    if (billDate && viewType === 'month') {
      setMonthYear(billDate.substring(0, 7));
    }
  }, [billDate, viewType]);

  // Load employee list and global settings
  useEffect(() => {
    loadBaseData();
  }, []);

  // Load monthly bills and approval status when monthYear changes
  useEffect(() => {
    if (monthYear) {
      loadBillsForMonth(monthYear);
    }
  }, [monthYear]);

  // Handle employee selection and pre-populate Basic / compute DA
  useEffect(() => {
    if (selectedEmpId && employees.length > 0) {
      const emp = employees.find(e => e.emp_id === selectedEmpId);
      if (emp) {
        // Pre-fill existing bill's details if one exists this month
        const existingBill = existingBills.find(b => b.emp_id === selectedEmpId);
        if (existingBill) {
          setBasicPay(existingBill.basic_pay || 0);
          setDa(existingBill.da || 0);
          setHra(existingBill.hra || 0);
          setNumEls(existingBill.num_els || 30);
          if (existingBill.bill_date) {
            setBillDate(existingBill.bill_date);
          }
          fetchCumulativeLeaves(emp.emp_id, existingBill.bill_date || billDate);
        } else {
          // Prepopulate basic pay from last saved earnings if available, or 0
          fetchLastEarning(emp.emp_id);
          fetchCumulativeLeaves(emp.emp_id, billDate);
        }
      }
    } else {
      setBasicPay(0);
      setDa(0);
      setHra(0);
      setCumulativeSurrendered(0);
    }
  }, [selectedEmpId, employees, existingBills]);

  // Recheck cumulative leaves if bill date changes
  useEffect(() => {
    if (selectedEmpId && billDate) {
      fetchCumulativeLeaves(selectedEmpId, billDate);
    }
  }, [billDate]);

  // Auto-calculate DA when basic pay or selected employee changes
  useEffect(() => {
    calculateDAAndTotal();
  }, [basicPay, selectedEmpId, numEls, hra]);

  const loadBaseData = async () => {
    try {
      const [empRes, settingsRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/settings')
      ]);
      const empData = await empRes.json();
      const settingsData = await settingsRes.json();

      setEmployees(empData);
      setActiveEmployees(empData.filter(e => e.is_active === 1));
      setGlobalSettingsList(settingsData);
    } catch (e) {
      console.error("Failed to load base data", e);
    }
  };

  const loadBillsForMonth = async (targetMonth) => {
    setLoadingBills(true);
    try {
      const res = await fetch(`/api/surrender/${targetMonth}`);
      const data = await res.json();
      // Filter out only employees that actually have saved surrender bills
      const savedBills = data.filter(e => e.bill_id !== null);
      setExistingBills(savedBills);
      setSelectedEmpIds(new Set());

      // Fetch approval status
      const approvalRes = await fetch(`/api/surrender/approve/${targetMonth}`);
      if (approvalRes.ok) {
        const approvalData = await approvalRes.json();
        setIsApproved(approvalData.is_approved === 1);
        setApprovalInfo(approvalData.is_approved === 1 ? approvalData : null);
      } else {
        setIsApproved(false);
        setApprovalInfo(null);
      }
    } catch (e) {
      console.error("Failed to load monthly surrender bills", e);
    } finally {
      setLoadingBills(false);
    }
  };

  const fetchLastEarning = async (empId) => {
    try {
      // Find basic pay from the current month or previous month earnings
      const res = await fetch(`/api/earnings/${monthYear}`);
      const data = await res.json();
      const match = data.find(e => e.emp_id === empId);
      if (match && match.basic_pay) {
        setBasicPay(match.basic_pay);
      } else {
        // Try previous month
        const [yr, mn] = monthYear.split('-');
        let prevM = parseInt(mn) - 1;
        let prevY = parseInt(yr);
        if (prevM === 0) { prevM = 12; prevY -= 1; }
        const prevMonthStr = `${prevY}-${String(prevM).padStart(2, '0')}`;
        
        const prevRes = await fetch(`/api/earnings/${prevMonthStr}`);
        const prevData = await prevRes.json();
        const prevMatch = prevData.find(e => e.emp_id === empId);
        if (prevMatch && prevMatch.basic_pay) {
          setBasicPay(prevMatch.basic_pay);
        } else {
          setBasicPay(0);
        }
      }
    } catch (e) {
      setBasicPay(0);
    }
  };

  const fetchCumulativeLeaves = async (empId, dateStr) => {
    if (!empId || !dateStr) return;
    setLoadingCumulative(true);
    try {
      const fy = getFinancialYear(dateStr);
      const res = await fetch(`/api/surrender/cumulative?emp_id=${empId}&financial_year=${fy}`);
      const data = await res.json();
      setCumulativeSurrendered(data.total_surrendered || 0);
    } catch (e) {
      console.error(e);
      setCumulativeSurrendered(0);
    } finally {
      setLoadingCumulative(false);
    }
  };

  const calculateDAAndTotal = () => {
    if (!selectedEmpId) return;
    const emp = employees.find(e => e.emp_id === selectedEmpId);
    if (!emp) return;

    const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {};
    const isState = emp.category === 'state';
    const isUGC = emp.category === 'ugc/csir';
    const da_pct = isState ? (activeRule.da_state_percentage || 0) : isUGC ? (activeRule.da_ugc_percentage || 0) : 0;

    const calculatedDa = (basicPay * da_pct) / 100;
    setDa(calculatedDa);

    const base = basicPay + calculatedDa + hra;
    const total = Math.round((base / 30) * numEls);
    setTotalAmount(total);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) {
      alert("Please select an employee.");
      return;
    }
    if (numEls <= 0 || numEls > 30) {
      alert("Number of ELs must be between 1 and 30.");
      return;
    }

    const fy = getFinancialYear(billDate);
    const futureTotalLeaves = cumulativeSurrendered + numEls;

    // Check if employee already has a bill on this date (which would be an update, so we subtract current bill's leaves)
    const existingBillForEmpThisMonth = existingBills.find(b => b.emp_id === selectedEmpId);
    const alreadyCountedLeaves = existingBillForEmpThisMonth ? existingBillForEmpThisMonth.num_els : 0;
    const netFutureLeaves = futureTotalLeaves - alreadyCountedLeaves;

    if (netFutureLeaves > 30) {
      alert(`VALIDATION ERROR:\n\nThis employee has already surrendered ${cumulativeSurrendered} Earned Leaves in the Financial Year ${fy}.\n` +
            `Surrendering ${numEls} more leaves would exceed the yearly maximum limit of 30 leaves (Total would be ${netFutureLeaves}).\n\n` +
            `Please adjust the number of leaves.`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        records: [{
          emp_id: selectedEmpId,
          bill_date: billDate,
          financial_year: fy,
          basic_pay: basicPay,
          da: da,
          hra: hra,
          num_els: numEls,
          total_amount: totalAmount
        }]
      };

      const res = await fetch(`/api/surrender/${monthYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok) {
        alert("Surrender Bill Saved Successfully!");
        // Reset form
        setSelectedEmpId('');
        setSearchTerm('');
        setBasicPay(0);
        setDa(0);
        setHra(0);
        setNumEls(30);
        // Refresh monthly grid
        loadBillsForMonth(monthYear);
      } else {
        alert("Failed to save: " + result.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (empId, date) => {
    if (!window.confirm("Are you sure you want to delete this surrender bill?")) return;
    try {
      const payload = {
        records: [{
          emp_id: empId,
          bill_date: date,
          num_els: 0 // setting to 0 triggers deletion in backend
        }]
      };

      const res = await fetch(`/api/surrender/${monthYear}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Surrender bill deleted successfully.");
        loadBillsForMonth(monthYear);
      } else {
        const err = await res.json();
        alert("Deletion failed: " + err.error);
      }
    } catch (e) {
      alert("Network error.");
    }
  };

  const handleApprove = async () => {
    if (selectedEmpIds.size === 0) {
      alert("Please check/select the employee bills you want to approve.");
      return;
    }

    const confirmMessage = `OFFICIAL CONFIRMATION REQUIRED:\n\n` +
      `You are about to APPROVE and LOCK the Earned Leave Surrender bills for ${selectedEmpIds.size} selected employee(s) in ${monthYear}.\n\n` +
      `By clicking OK, you verify that their calculations are correct.\n` +
      `This action will PERMANENTLY LOCK their records.\n\n` +
      `Proceed with approval?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setApproving(true);
    try {
      const res = await fetch(`/api/surrender/approve/${monthYear}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emp_ids: Array.from(selectedEmpIds) })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Selected surrender bills approved successfully!');
        loadBillsForMonth(monthYear);
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
    if (selectedEmpIds.size === 0) {
      alert("Please check/select the employee bills you want to reject.");
      return;
    }

    const confirmMessage = `CONFIRM REJECTION:\n\n` +
      `You are about to REJECT the Earned Leave Surrender bills for ${selectedEmpIds.size} selected employee(s) in ${monthYear}.\n\n` +
      `By clicking OK, these bills will be unlocked and returned to the admin for corrections.\n\n` +
      `Proceed with rejection?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    setRejecting(true);
    try {
      const res = await fetch(`/api/surrender/approve/${monthYear}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emp_ids: Array.from(selectedEmpIds), action: 'reject' })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Selected surrender bills rejected successfully!');
        setSelectedEmpIds(new Set());
        loadBillsForMonth(monthYear);
      } else {
        alert('Failed to reject: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setRejecting(false);
    }
  };

  const filteredEmployees = activeEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedBill = existingBills.find(b => b.emp_id === selectedEmpId);
  const isSelectedApproved = selectedBill?.is_approved === 1;
  const isApprovedAndLocked = isSelectedApproved && (user?.role !== 'super_admin' || !isOverrideActive);
  const isReadOnly = user?.role === 'approver' || isApprovedAndLocked;
  const isSelectDisabled = user?.role === 'approver';

  const approvedCount = existingBills.filter(b => b.is_approved === 1).length;
  const totalCount = existingBills.length;
  const hasApprovedBills = approvedCount > 0;
  const filteredBills = existingBills.filter(bill => user?.role !== 'approver' || bill.is_approved !== 1);

  const fyYear = getFinancialYear(billDate);
  const activeRule = globalSettingsList.find(rule => rule.effective_from <= monthYear) || {};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Earned Leave Surrender Bill</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Generate Earned Leave surrender bill for a single employee (max 30 days per financial year).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select 
            className="form-control" 
            value={viewType} 
            onChange={(e) => {
              const type = e.target.value;
              setViewType(type);
              const today = new Date();
              if (type === 'year') {
                setMonthYear(`${today.getFullYear()}`);
              } else {
                setMonthYear(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
              }
            }} 
            style={{ width: '120px' }}
          >
            <option value="month">View Month</option>
            <option value="year">View Year</option>
          </select>

          {viewType === 'month' ? (
            <input 
              type="month" 
              className="form-control" 
              value={monthYear.includes('-') ? monthYear : `${new Date().getFullYear()}-01`}
              onChange={(e) => setMonthYear(e.target.value)} 
              style={{ width: '140px' }} 
            />
          ) : (
            <select
              className="form-control"
              value={monthYear.includes('-') ? monthYear.split('-')[0] : monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              style={{ width: '110px' }}
            >
              {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
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
              {approvedCount === totalCount ? 'ALL SURRENDER BILLS SEALED' : 'SOME SURRENDER BILLS SEALED'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: user?.role === 'approver' ? '#854d0e' : 'var(--color-text-secondary)', margin: '0.25rem 0 0 0' }}>
              <strong>{approvedCount}</strong> out of <strong>{totalCount}</strong> surrender bills in {monthYear} are verified and locked.
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

      {/* Bill Generation Section (Only Admins / Super Admins, and not approved/locked) */}
      {(user?.role === 'admin' || user?.role === 'super_admin') && (
        <div className="card" style={{ marginBottom: '2.5rem', opacity: isReadOnly ? 0.7 : 1 }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} className="text-primary" />
            Generate New Surrender Slip
          </h2>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Employee Selection */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Select Employee</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    className="form-control" 
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    disabled={isSelectDisabled}
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {filteredEmployees.map(emp => (
                      <option key={emp.emp_id} value={emp.emp_id}>
                        {emp.title ? `${emp.title} ` : ''}{emp.name} ({emp.emp_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--color-text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search name/ID..." 
                    className="form-control" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ fontSize: '0.8rem', paddingLeft: '2rem', height: '30px' }}
                    disabled={isSelectDisabled}
                  />
                </div>
              </div>

              {/* Bill Date */}
              <div className="form-group">
                <label className="form-label">Bill Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  disabled={isReadOnly}
                  required 
                />
              </div>

              {/* Basic Pay */}
              <div className="form-group">
                <label className="form-label">Basic Pay (₹)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={basicPay || ''} 
                  onChange={(e) => setBasicPay(parseFloat(e.target.value) || 0)}
                  disabled={isReadOnly}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* DA (Auto calculated but overrideable) */}
              <div className="form-group">
                <label className="form-label">
                  DA (₹) 
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-primary)', marginLeft: '0.5rem' }}>
                    Auto-computed
                  </span>
                </label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={da ? parseFloat(da.toFixed(2)) : ''} 
                  onChange={(e) => setDa(parseFloat(e.target.value) || 0)}
                  disabled={isReadOnly}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* HRA */}
              <div className="form-group">
                <label className="form-label">HRA (₹)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={hra || ''} 
                  onChange={(e) => setHra(parseFloat(e.target.value) || 0)}
                  disabled={isReadOnly}
                  placeholder="0.00"
                />
              </div>

              {/* Leaves Surrendered */}
              <div className="form-group">
                <label className="form-label">Number of ELs to Surrender</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={numEls} 
                  onChange={(e) => setNumEls(Math.min(30, Math.max(1, parseInt(e.target.value) || 0)))}
                  disabled={isReadOnly}
                  min="1"
                  max="30"
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Max 30 leaves</span>
              </div>
            </div>

            {/* Validation Display */}
            {selectedEmpId && (
              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid var(--color-border)',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={20} style={{ color: 'var(--color-accent-primary)' }} />
                  <div>
                    <span style={{ fontWeight: 600 }}>Financial Year: {fyYear}</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Cumulative Surrendered Leaves in {fyYear}: <strong>{cumulativeSurrendered} days</strong>
                    </div>
                  </div>
                </div>

                {loadingCumulative ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Checking FY cap...</span>
                ) : cumulativeSurrendered + numEls > 30 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    <AlertTriangle size={18} />
                    Exceeds 30-day limit! (Total: {cumulativeSurrendered + numEls} days)
                  </div>
                ) : (
                  <div style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.85rem' }}>
                    ✓ Within limit (Remaining: {30 - (cumulativeSurrendered + numEls)} days)
                  </div>
                )}
              </div>
            )}

            {/* Premium Dynamic Preview Box */}
            {selectedEmpId && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 700 }}>
                  Calculation Preview
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                    Formula: <code style={{ backgroundColor: 'var(--color-bg-surface)', padding: '0.2rem 0.4rem', borderRadius: '4px', color: 'var(--color-accent-primary)' }}>(Basic + DA + HRA) / 30 * ELs</code>
                    <div style={{ marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: 600 }}>
                      (₹{fmt(basicPay)} + ₹{fmt(da)} + ₹{fmt(hra)}) / 30 × {numEls} days
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Net Payable Amount</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-success)' }}>
                      ₹ {totalAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setSelectedEmpId('');
                  setSearchTerm('');
                  setBasicPay(0);
                  setDa(0);
                  setHra(0);
                  setNumEls(30);
                }}
                disabled={isReadOnly}
              >
                Clear
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving || isReadOnly || cumulativeSurrendered + numEls > 30}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Surrender Bill"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Monthly Bills Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.20rem', marginBottom: '0.25rem' }}>Saved Bills for {monthYear}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
              {filteredBills.length} records found in this month.
            </p>
          </div>

          <div>
            {user?.role === 'approver' && filteredBills.length > 0 && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleApprove} 
                  disabled={approving || rejecting || selectedEmpIds.size === 0} 
                  style={{ 
                    backgroundColor: 'var(--color-success)', 
                    border: 'none',
                    padding: '0.6rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <ShieldCheck size={18} /> {approving ? 'Finalizing...' : `APPROVE SELECTED (${selectedEmpIds.size})`}
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleReject} 
                  disabled={approving || rejecting || selectedEmpIds.size === 0} 
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
                  <XCircle size={18} /> {rejecting ? 'Rejecting...' : `REJECT SELECTED (${selectedEmpIds.size})`}
                </button>
              </div>
            )}
            {user?.role === 'approver' && filteredBills.length === 0 && (
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

        {loadingBills ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>Loading bills...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  {user?.role === 'approver' && (
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        checked={filteredBills.length > 0 && filteredBills.every(b => b.is_approved === 1 || selectedEmpIds.has(b.emp_id))}
                        onChange={() => {
                          const allUnapproved = filteredBills.filter(b => b.is_approved !== 1);
                          if (selectedEmpIds.size === allUnapproved.length) {
                            setSelectedEmpIds(new Set());
                          } else {
                            setSelectedEmpIds(new Set(allUnapproved.map(b => b.emp_id)));
                          }
                        }}
                      />
                    </th>
                  )}
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Bill Date</th>
                  <th>Basic Pay</th>
                  <th>DA</th>
                  <th>HRA</th>
                  <th>ELs Surrendered</th>
                  <th>FY</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  {(user?.role === 'admin' || user?.role === 'super_admin') && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan={(user?.role === 'admin' || user?.role === 'super_admin') ? 11 : (user?.role === 'approver' ? 11 : 10)} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      No surrender bills generated for this month yet.
                    </td>
                  </tr>
                )}
                {filteredBills.map(bill => {
                  const isRowLocked = bill.is_approved === 1 && (user?.role !== 'super_admin' || !isOverrideActive);
                  const rowBg = 'transparent';
                  const isPending = bill.is_approved === 2 || bill.is_approved === 0 || bill.is_approved === null;
                  const rowColor = isPending ? '#d97706' : 'inherit';
                  return (
                    <tr key={bill.emp_id} style={{ backgroundColor: rowBg, color: rowColor }}>
                      {user?.role === 'approver' && (
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="checkbox" 
                            checked={bill.is_approved === 1 || selectedEmpIds.has(bill.emp_id)}
                            disabled={bill.is_approved === 1}
                            onChange={() => {
                              setSelectedEmpIds(prev => {
                                const next = new Set(prev);
                                if (next.has(bill.emp_id)) next.delete(bill.emp_id);
                                else next.add(bill.emp_id);
                                return next;
                              });
                            }}
                          />
                        </td>
                      )}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ fontWeight: 600, color: isPending ? '#d97706' : 'var(--color-primary)' }}>
                            {bill.title ? `${bill.title} ` : ''}{bill.name}
                          </div>
                          {user?.role === 'approver' && isPending && (
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
                        <div style={{ fontSize: '0.75rem', color: isPending ? '#d97706' : 'var(--color-text-secondary)' }}>{bill.emp_id}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${bill.category === 'ugc/csir' ? 'ugc' : bill.category}`}>
                          {bill.category?.toUpperCase()}
                        </span>
                      </td>
                      <td>{bill.bill_date}</td>
                      <td>₹ {fmt(bill.basic_pay)}</td>
                      <td>₹ {fmt(bill.da)}</td>
                      <td>₹ {fmt(bill.hra)}</td>
                      <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{bill.num_els} days</td>
                      <td>{bill.financial_year}</td>
                      <td style={{ fontWeight: 'bold', color: isPending ? '#d97706' : (bill.is_approved === 1 ? 'var(--color-success)' : 'inherit') }}>
                        ₹ {bill.total_amount?.toLocaleString('en-IN')}
                      </td>
                      <td>
                        {bill.is_approved === 1 ? (
                          <span style={{ 
                            backgroundColor: '#10b981', 
                            color: '#fff', 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.7rem', 
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}>
                            APPROVED
                          </span>
                        ) : isPending ? (
                          <span style={{ 
                            backgroundColor: '#f97316', 
                            color: '#fff', 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.7rem', 
                            fontWeight: 'bold',
                            display: 'inline-block'
                          }}>
                            SUBMITTED
                          </span>
                        ) : (
                          <span style={{ 
                            fontSize: '0.75rem', fontWeight: 600, 
                            color: 'var(--color-warning)'
                          }}>
                            DRAFT
                          </span>
                        )}
                      </td>
                      {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <td>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => handleDelete(bill.emp_id, bill.bill_date)}
                            disabled={isRowLocked}
                            style={{ padding: '0.3rem 0.5rem', borderRadius: '4px' }}
                            title="Delete Bill"
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
    </div>
  );
};

export default SurrenderBill;
