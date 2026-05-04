import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Calendar, Pencil } from 'lucide-react';

const Settings = (props) => {
  if (props.user && props.user.role === 'viewer') {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>;
  }
  const [settingsList, setSettingsList] = useState([]);
  
  const [formData, setFormData] = useState({
    effective_from: '',
    da_state_percentage: 0,
    da_ugc_percentage: 0,
    hra_state_percentage: 0,
    hra_ugc_percentage: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettingsList(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setFormData({
      effective_from: rule.effective_from,
      da_state_percentage: rule.da_state_percentage || 0,
      da_ugc_percentage: rule.da_ugc_percentage || 0,
      hra_state_percentage: rule.hra_state_percentage || 0,
      hra_ugc_percentage: rule.hra_ugc_percentage || 0
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'effective_from' ? value : (parseFloat(value) || 0)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        setShowAddForm(false);
        fetchSettings();
      } else {
        setMessage({ type: 'error', text: 'Failed to update settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error communicating with server.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading settings...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Global Allowances</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Configure and track historical percentages for DA and HRA automatically adopted during paybill runs.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : <><Plus size={18} /> New Rule</>}
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', 
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          maxWidth: '800px'
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message.text}</span>
        </div>
      )}

      {showAddForm && (
        <div className="card" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ maxWidth: '300px' }}>
              <label className="form-label">Effective From Month *</label>
              <input 
                type="month" name="effective_from" required
                value={formData.effective_from} onChange={handleChange} 
                className="form-control" 
              />
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Dearness Allowance (DA) %
              </h3>
              <div className="form-row">
                <div>
                  <label className="form-label">State Category</label>
                  <input type="number" step="0.01" name="da_state_percentage" value={formData.da_state_percentage} onChange={handleChange} className="form-control" />
                </div>
                <div>
                  <label className="form-label">UGC Category</label>
                  <input type="number" step="0.01" name="da_ugc_percentage" value={formData.da_ugc_percentage} onChange={handleChange} className="form-control" />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                House Rent Allowance (HRA) %
              </h3>
              <div className="form-row">
                <div>
                  <label className="form-label">State Category</label>
                  <input type="number" step="0.01" name="hra_state_percentage" value={formData.hra_state_percentage} onChange={handleChange} className="form-control" />
                </div>
                <div>
                  <label className="form-label">UGC Category</label>
                  <input type="number" step="0.01" name="hra_ugc_percentage" value={formData.hra_ugc_percentage} onChange={handleChange} className="form-control" />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Settings Rule'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ maxWidth: '800px' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} /> Historically Tracked Rules
        </h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Effective Month</th>
                <th>DA (State / UGC)</th>
                <th>HRA (State / UGC)</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {settingsList.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No rules configured.</td>
                </tr>
              ) : (
                settingsList.map((rule, idx) => (
                  <tr key={rule.id}>
                    <td style={{ fontWeight: 600 }}>{rule.effective_from} {idx === 0 && <span className="badge badge-contract" style={{marginLeft: '0.5rem'}}>Active</span>}</td>
                    <td>{rule.da_state_percentage}% / {rule.da_ugc_percentage}%</td>
                    <td>{rule.hra_state_percentage}% / {rule.hra_ugc_percentage}%</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
                        onClick={() => handleEdit(rule)}>
                        <Pencil size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
