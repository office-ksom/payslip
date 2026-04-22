import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Pencil, X, Check } from 'lucide-react';

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
  is_active: 1
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/employees');
      if (res.ok) setEmployees(await res.json());
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddForm = () => {
    setFormData(emptyForm);
    setIsEditMode(false);
    setShowForm(true);
    setMessage(null);
  };

  const openEditForm = (emp) => {
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
      is_active: typeof emp.is_active !== 'undefined' ? emp.is_active : 1
    });
    setIsEditMode(true);
    setShowForm(true);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditMode(false);
    setFormData(emptyForm);
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const res = await fetch('/api/employees', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: isEditMode ? 'Employee updated successfully!' : 'Employee added successfully!' });
        setShowForm(false);
        setIsEditMode(false);
        setFormData(emptyForm);
        fetchEmployees();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to save.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error communicating with server.' });
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    (emp.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (emp.emp_id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Employee Directory</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Manage staff profiles, pay scales, and employment categories.
          </p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={openAddForm}>
            <UserPlus size={18} /> Add Employee
          </button>
        )}
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
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Employee ID *</label>
                <input required type="text" name="emp_id" value={formData.emp_id} onChange={handleInputChange}
                  className="form-control" placeholder="e.g., KSM001"
                  disabled={isEditMode} style={isEditMode ? { opacity: 0.6, cursor: 'not-allowed' } : {}} />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange}
                  className="form-control" placeholder="Full Name" />
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
                  <option value="ugc">UGC</option>
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
                <label className="form-label">Status</label>
                <select name="is_active" value={formData.is_active} onChange={handleInputChange} className="form-control">
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>All Employees ({filteredEmployees.length})</h3>
          <div style={{ position: 'relative', width: '260px' }}>
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
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      {employees.length === 0 ? 'No employees yet. Click "Add Employee" to get started.' : 'No matches found.'}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp.emp_id}>
                      <td style={{ fontWeight: 600 }}>{emp.emp_id}</td>
                      <td>{emp.name}</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{emp.designation || '—'}</td>
                      <td>
                        <span className={`badge badge-${emp.category}`}>{emp.category || '—'}</span>
                        <div style={{ marginTop: '0.25rem' }}>
                          <span className={`badge badge-${emp.is_active ? 'success' : 'danger'}`} style={{ fontSize: '0.7rem' }}>
                            {emp.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{emp.scale_of_pay || '—'}</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{emp.mob_no || '—'}</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{emp.email_id || '—'}</td>
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
  );
};

export default Employees;
