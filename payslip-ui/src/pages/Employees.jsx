import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Pencil, X, Check } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const emptyForm = {
  emp_id: '',
  name: '',
  designation: '',
  date_of_birth: '',
  date_of_joining: '',
  scale_of_pay: '',
  category: 'state',
  email_id: '',
  mob_no: '',
  epf_uan: '',
  is_active: 1,
  title: 'Mr.',
  sort_order: 0,
  appointment_type: 'Permanent'
};

const emptyVisitingForm = {
  emp_id: '',
  title: 'Dr.',
  name: '',
  sort_order: 0,
  designation: 'Visiting Professor',
  pay_type: 'Honorarium',
  pay: '',
  date_of_birth: '',
  date_of_joining: '',
  mob_no: '',
  email_id: '',
  is_active: 1
};

const emptyContractForm = {
  emp_id: '',
  title: 'Mr.',
  name: '',
  sort_order: 0,
  designation: 'Maintenance Engineer',
  pay_type: 'Consolidated Salary',
  pay: '',
  date_of_birth: '',
  date_of_joining: '',
  mob_no: '',
  email_id: '',
  is_active: 1
};

const emptyDailyWageForm = {
  emp_id: '',
  title: 'Mr.',
  name: '',
  sort_order: 0,
  designation: 'Electrician',
  pay_type: 'Consolidated Salary',
  pay: '',
  date_of_birth: '',
  date_of_joining: '',
  mob_no: '',
  email_id: '',
  is_active: 1
};

const Employees = () => {
  const { user } = useOutletContext();
  const [activeTab, setActiveTab] = useState('permanent'); // 'permanent', 'visiting', 'contract', 'daily_wage'
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'permanent' ? '/api/employees' 
                     : activeTab === 'visiting' ? '/api/employees/visiting'
                     : activeTab === 'contract' ? '/api/employees/contract'
                     : '/api/employees/daily_wage';
      const res = await fetch(endpoint);
      if (res.ok) setEmployees(await res.json());
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (user && user.role === 'viewer') {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getEmptyFormForTab = (tab) => {
    if (tab === 'permanent') return emptyForm;
    if (tab === 'visiting') return emptyVisitingForm;
    if (tab === 'contract') return emptyContractForm;
    return emptyDailyWageForm;
  };

  const openAddForm = () => {
    setFormData(getEmptyFormForTab(activeTab));
    setIsEditMode(false);
    setShowForm(true);
    setMessage(null);
  };

  const openEditForm = (emp) => {
    if (activeTab === 'permanent') {
      setFormData({
        emp_id: emp.emp_id || '',
        name: emp.name || '',
        designation: emp.designation || '',
        date_of_birth: emp.date_of_birth || '',
        date_of_joining: emp.date_of_joining || '',
        scale_of_pay: emp.scale_of_pay || '',
        category: emp.category || 'state',
        email_id: emp.email_id || '',
        mob_no: emp.mob_no || '',
        epf_uan: emp.epf_uan || '',
        is_active: typeof emp.is_active !== 'undefined' ? emp.is_active : 1,
        title: emp.title || 'Mr.',
        sort_order: emp.sort_order || 0,
        appointment_type: emp.appointment_type || 'Permanent'
      });
    } else {
      setFormData({
        emp_id: emp.emp_id || '',
        title: emp.title || (activeTab === 'visiting' ? 'Dr.' : 'Mr.'),
        name: emp.name || '',
        sort_order: emp.sort_order || 0,
        designation: emp.designation || (activeTab === 'visiting' ? 'Visiting Professor' : activeTab === 'contract' ? 'Maintenance Engineer' : 'Electrician'),
        pay_type: emp.pay_type || (activeTab === 'visiting' ? 'Honorarium' : 'Consolidated Salary'),
        pay: emp.pay || '',
        date_of_birth: emp.date_of_birth || '',
        date_of_joining: emp.date_of_joining || '',
        mob_no: emp.mob_no || '',
        email_id: emp.email_id || '',
        is_active: typeof emp.is_active !== 'undefined' ? emp.is_active : 1
      });
    }
    setIsEditMode(true);
    setShowForm(true);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditMode(false);
    setFormData(getEmptyFormForTab(activeTab));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const endpoint = activeTab === 'permanent' ? '/api/employees' 
                     : activeTab === 'visiting' ? '/api/employees/visiting'
                     : activeTab === 'contract' ? '/api/employees/contract'
                     : '/api/employees/daily_wage';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: isEditMode ? 'Employee updated successfully!' : 'Employee added successfully!' });
        setShowForm(false);
        setIsEditMode(false);
        setFormData(getEmptyFormForTab(activeTab));
        fetchEmployees();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to save.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error communicating with server.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees
    .filter(emp =>
      (emp.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (emp.emp_id || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aActive = a.is_active !== undefined ? Number(a.is_active) : 1;
      const bActive = b.is_active !== undefined ? Number(b.is_active) : 1;
      if (aActive !== bActive) return bActive - aActive;
      const sortDiff = (a.sort_order || 0) - (b.sort_order || 0);
      if (sortDiff !== 0) return sortDiff;
      return (a.name || '').localeCompare(b.name || '');
    });

  return (
    <div>
      <div className="employees-main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Employee Directory</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              Manage staff profiles, pay scales, and employment categories.
            </p>
          </div>
          {!showForm && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setShowFullPreview(true)}>
                Preview Full Sheet
              </button>
              <button className="btn btn-primary" onClick={openAddForm}>
                <UserPlus size={18} /> Add Employee
              </button>
            </div>
          )}
        </div>

      {/* Tabs */}
      <div className="tabs-scrollable" style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => { setActiveTab('permanent'); setShowForm(false); }}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'permanent' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'permanent' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          Permanent Employees
        </button>
        <button 
          onClick={() => { setActiveTab('visiting'); setShowForm(false); }}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'visiting' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'visiting' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          Visiting Faculty
        </button>
        <button 
          onClick={() => { setActiveTab('contract'); setShowForm(false); }}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'contract' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'contract' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          Contract Staff
        </button>
        <button 
          onClick={() => { setActiveTab('daily_wage'); setShowForm(false); }}
          style={{
            padding: '0.75rem 1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'daily_wage' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'daily_wage' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          Daily Wage Staff
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div style={{
          padding: '0.875rem 1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          borderLeft: `3px solid ${message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`
        }}>
          {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message.text}</span>
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: `4px solid ${isEditMode ? 'var(--color-warning)' : 'var(--color-accent-primary)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>
              {isEditMode ? `Editing: ${formData.name}` : 'New Employee Profile'}
            </h3>
            <button className="btn btn-secondary" onClick={handleCancel} style={{ padding: '0.4rem 0.75rem' }}>
              <X size={16} /> Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {activeTab === 'permanent' ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Employee ID *</label>
                    <input required type="text" name="emp_id" value={formData.emp_id} onChange={handleInputChange}
                      className="form-control" placeholder="e.g., KSM001"
                      disabled={isEditMode} style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : {}} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <select name="title" value={formData.title} onChange={handleInputChange} className="form-control">
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange}
                      className="form-control" placeholder="Full Name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Order (for sorting)</label>
                    <input type="number" name="sort_order" value={formData.sort_order} onChange={handleInputChange}
                      className="form-control" placeholder="0" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input type="text" name="designation" value={formData.designation} onChange={handleInputChange}
                      className="form-control" placeholder="e.g., Assistant Professor" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="form-control">
                      <option value="state">State</option>
                      <option value="ugc/csir">UGC/CSIR</option>
                      <option value="temporary">Temporary</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange}
                      className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Joining</label>
                    <input type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleInputChange}
                      className="form-control" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Scale of Pay</label>
                    <input type="text" name="scale_of_pay" value={formData.scale_of_pay} onChange={handleInputChange}
                      className="form-control" placeholder="e.g., 57700-182400" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input type="tel" name="mob_no" value={formData.mob_no} onChange={handleInputChange}
                      className="form-control" placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email ID</label>
                    <input type="email" name="email_id" value={formData.email_id} onChange={handleInputChange}
                      className="form-control" placeholder="employee@example.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">EPF UAN</label>
                    <input type="text" name="epf_uan" value={formData.epf_uan} onChange={handleInputChange}
                      className="form-control" placeholder="12-digit UAN" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select name="is_active" value={formData.is_active} onChange={handleInputChange} className="form-control">
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Appointment Type</label>
                    <select name="appointment_type" value={formData.appointment_type} onChange={handleInputChange} className="form-control">
                      <option value="Permanent">Permanent</option>
                      <option value="Deputation">Deputation</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Employee ID *</label>
                    <input required type="text" name="emp_id" value={formData.emp_id} onChange={handleInputChange}
                      className="form-control" placeholder={activeTab === 'visiting' ? "e.g., V001" : activeTab === 'contract' ? "e.g., C001" : "e.g., D001"}
                      disabled={isEditMode} style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : {}} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <select name="title" value={formData.title} onChange={handleInputChange} className="form-control">
                      {activeTab === 'visiting' ? (
                        <>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                        </>
                      ) : (
                        <>
                          <option value="Mr.">Mr.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Dr.">Dr.</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange}
                      className="form-control" placeholder="Full Name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Order (for sorting)</label>
                    <input type="number" name="sort_order" value={formData.sort_order} onChange={handleInputChange}
                      className="form-control" placeholder="0" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <select name="designation" value={formData.designation} onChange={handleInputChange} className="form-control">
                      {activeTab === 'visiting' && (
                        <>
                          <option value="Visiting Professor">Visiting Professor</option>
                          <option value="Visiting Assistant Professor">Visiting Assistant Professor</option>
                        </>
                      )}
                      {activeTab === 'contract' && (
                        <>
                          <option value="Maintenance Engineer">Maintenance Engineer</option>
                          <option value="Technical Assistant">Technical Assistant</option>
                        </>
                      )}
                      {activeTab === 'daily_wage' && (
                        <>
                          <option value="Electrician">Electrician</option>
                          <option value="Clerical Assistant">Clerical Assistant</option>
                          <option value="Gardner">Gardner</option>
                          <option value="Helper">Helper</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pay Type</label>
                    <select name="pay_type" value={formData.pay_type} onChange={handleInputChange} className="form-control">
                      {activeTab === 'visiting' ? (
                        <>
                          <option value="Honorarium">Honorarium</option>
                          <option value="Consolidated Salary">Consolidated Salary</option>
                        </>
                      ) : (
                        <>
                          <option value="Consolidated Salary">Consolidated Salary</option>
                          <option value="Daily Wage">Daily Wage</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Pay *</label>
                    <input required type="number" name="pay" value={formData.pay} onChange={handleInputChange}
                      className="form-control" placeholder="Amount in Rs." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange}
                      className="form-control" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date of Joining</label>
                    <input type="date" name="date_of_joining" value={formData.date_of_joining} onChange={handleInputChange}
                      className="form-control" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input type="tel" name="mob_no" value={formData.mob_no} onChange={handleInputChange}
                      className="form-control" placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email ID</label>
                    <input type="email" name="email_id" value={formData.email_id} onChange={handleInputChange}
                      className="form-control" placeholder="employee@example.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select name="is_active" value={formData.is_active} onChange={handleInputChange} className="form-control">
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : isEditMode ? 'Update Employee' : 'Save Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employees Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>
            {activeTab === 'permanent' ? 'All Permanent Employees' 
             : activeTab === 'visiting' ? 'All Visiting Faculty' 
             : activeTab === 'contract' ? 'All Contract Staff' 
             : 'All Daily Wage Staff'} ({filteredEmployees.length})
          </h3>
          <div style={{ position: 'relative', width: 'min(100%, 280px)' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input type="text" placeholder="Search by name or ID..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="form-control"
              style={{ paddingLeft: '2.25rem' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                {activeTab === 'permanent' ? (
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Category</th>
                    <th>Pay Scale</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Pay Type</th>
                    <th>Pay</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'permanent' ? "8" : "9"} style={{ textAlign: 'center', padding: '2rem' }}>
                      {employees.length === 0 ? 'No employees yet. Click "Add Employee" to get started.' : 'No matches found.'}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp.emp_id} className={emp.is_active === 0 ? 'inactive-row' : ''}>
                      <td style={{ fontWeight: 600 }}>{emp.emp_id}</td>
                      <td>{emp.title ? `${emp.title} ` : ''}{emp.name}</td>
                      <td style={{ color: emp.is_active === 0 ? 'inherit' : 'var(--color-text-secondary)' }}>{emp.designation || '—'}</td>
                      
                      {activeTab === 'permanent' ? (
                        <>
                          <td>
                            <span className={`badge badge-${emp.category}`}>
                              {emp.category === 'ugc/csir' ? 'UGC/CSIR' : (emp.category ? emp.category.charAt(0).toUpperCase() + emp.category.slice(1) : '—')}
                            </span>
                            {emp.appointment_type && emp.appointment_type !== 'Permanent' && (
                              <div style={{ marginTop: '0.25rem' }}>
                                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                                  {emp.appointment_type}
                                </span>
                              </div>
                            )}
                            <div style={{ marginTop: '0.25rem' }}>
                              <span className={`badge badge-${emp.is_active ? 'success' : 'inactive'}`} style={{ fontSize: '0.7rem' }}>
                                {emp.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td style={{ color: emp.is_active === 0 ? 'inherit' : 'var(--color-text-secondary)' }}>{emp.scale_of_pay || '—'}</td>
                        </>
                      ) : (
                        <>
                          <td>
                            <span className="badge badge-contract">
                              {emp.pay_type || '—'}
                            </span>
                          </td>
                          <td style={{ color: emp.is_active === 0 ? 'inherit' : 'var(--color-text-secondary)' }}>₹{emp.pay ? parseFloat(emp.pay).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</td>
                        </>
                      )}
                      
                      <td style={{ color: emp.is_active === 0 ? 'inherit' : 'var(--color-text-secondary)' }}>{emp.mob_no || '—'}</td>
                      <td style={{ color: emp.is_active === 0 ? 'inherit' : 'var(--color-text-secondary)' }}>{emp.email_id || '—'}</td>
                      
                      {activeTab !== 'permanent' && (
                        <td>
                          <span className={`badge badge-${emp.is_active ? 'success' : 'inactive'}`}>
                            {emp.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      )}
                      
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                          onClick={() => openEditForm(emp)}>
                          <Pencil size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {/* Full Screen Preview Overlay */}
      {showFullPreview && (
        <div className="employees-preview-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: '#fff', zIndex: 9999, overflow: 'auto', padding: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #333', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#000' }}>
                Employee Directory - {activeTab === 'permanent' ? 'Permanent Staff' : activeTab === 'visiting' ? 'Visiting Faculty' : activeTab === 'contract' ? 'Contract Staff' : 'Daily Wage Staff'}
              </h1>
              <p style={{ margin: 0, color: '#333', fontWeight: 'bold' }}>Total Records: {filteredEmployees.length}</p>
            </div>
            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', gap: '0.5rem', border: '1px solid #ccc' }}>
                Print Sheet
              </button>
              <button className="btn btn-primary" onClick={() => setShowFullPreview(false)} style={{ backgroundColor: '#000', color: '#fff' }}>
                <X size={20} /> Close Preview
              </button>
            </div>
          </div>
          
          <div className="table-container" style={{ backgroundColor: '#fff', width: '100%' }}>
            <table className="table">
              <thead>
                {activeTab === 'permanent' ? (
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Category</th>
                    <th>Pay Scale</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>EPF UAN</th>
                    <th>Appointment Type</th>
                    <th>Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Pay Type</th>
                    <th>Pay</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.emp_id} className={emp.is_active === 0 ? 'inactive-row' : ''}>
                    <td style={{ fontWeight: 600 }}>{emp.emp_id}</td>
                    <td>{emp.title ? `${emp.title} ` : ''}{emp.name}</td>
                    <td>{emp.designation || '—'}</td>
                    {activeTab === 'permanent' ? (
                      <>
                        <td>{emp.category === 'ugc/csir' ? 'UGC/CSIR' : (emp.category ? emp.category.charAt(0).toUpperCase() + emp.category.slice(1) : '—')}</td>
                        <td>{emp.scale_of_pay || '—'}</td>
                      </>
                    ) : (
                      <>
                        <td>{emp.pay_type || '—'}</td>
                        <td>₹{emp.pay ? parseFloat(emp.pay).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</td>
                      </>
                    )}
                    <td>{emp.mob_no || '—'}</td>
                    <td>{emp.email_id || '—'}</td>
                    {activeTab === 'permanent' ? (
                      <>
                        <td>{emp.epf_uan || '—'}</td>
                        <td>{emp.appointment_type || 'Permanent'}</td>
                      </>
                    ) : null}
                    <td style={{ fontWeight: emp.is_active === 0 ? 'bold' : 'normal' }}>{emp.is_active ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
