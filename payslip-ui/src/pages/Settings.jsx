import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Calendar, Pencil, ShieldCheck, RefreshCw, Terminal, Download as DownloadIcon } from 'lucide-react';

const Settings = (props) => {
  if (props.user && props.user.role === 'viewer') {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>;
  }
  const [settingsList, setSettingsList] = useState([]);
  const [requireApproval, setRequireApproval] = useState(true);
  const [savingSystem, setSavingSystem] = useState(false);
  const isSuperAdmin = props.user && props.user.role === 'super_admin';
  
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

  // States for system logs
  const [activeTab, setActiveTab] = useState('allowances');
  const [logs, setLogs] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsSearch, setLogsSearch] = useState('');
  const [logsError, setLogsError] = useState(null);
  const [logsSynced, setLogsSynced] = useState(true);

  const fetchLogs = async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const res = await fetch('/api/settings/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || '');
        setLogsSynced(data.synced !== false);
      } else {
        const errData = await res.json();
        setLogsError(errData.error || 'Failed to fetch logs.');
      }
    } catch (err) {
      setLogsError('Failed to fetch logs from server.');
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  useEffect(() => {
    Promise.all([fetchSettings(), fetchSystemSettings()]).finally(() => setLoading(false));
  }, []);

  const fetchSystemSettings = async () => {
    try {
      const res = await fetch('/api/settings/system');
      if (res.ok) {
        const data = await res.json();
        setRequireApproval(data.require_approval !== '0');
      }
    } catch (err) {
      console.error("Failed to fetch system settings", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettingsList(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const handleSaveSystemSettings = async () => {
    setSavingSystem(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ require_approval: requireApproval ? '1' : '0' })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Workflow settings updated successfully!' });
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.error || 'Failed to update workflow settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error communicating with server.' });
    } finally {
      setSavingSystem(false);
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

  const handleDownloadLogs = () => {
    const blob = new Blob([logs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'log.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseLogLine = (line, idx) => {
    if (!line.trim()) return null;
    
    const regex = /^\[(.*?)\]\s+\[(.*?)\]\s+Action:\s+(.*?)\s+-\s+Description:\s+(.*)$/;
    const match = line.match(regex);
    
    if (match) {
      const [, timestamp, email, action, description] = match;
      
      let actionColor = '#3b82f6'; // default blue
      if (action.includes('Delete') || action.includes('Reject') || action.includes('Removed')) {
        actionColor = '#ef4444'; // red
      } else if (action.includes('Approve') || action.includes('Lock') || action.includes('Verify') || action.includes('Save')) {
        actionColor = '#10b981'; // green
      } else if (action.includes('Login')) {
        actionColor = '#8b5cf6'; // purple
      }
      
      return (
        <div key={idx} style={{ 
          padding: '0.4rem 0.5rem', 
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          fontFamily: '"Fira Code", Monaco, Consolas, "Ubuntu Mono", monospace'
        }}>
          <span style={{ color: '#64748b', marginRight: '0.5rem' }}>[{timestamp}]</span>
          <span style={{ color: '#60a5fa', fontWeight: 500, marginRight: '0.5rem' }}>{email}</span>
          <span style={{ 
            backgroundColor: actionColor + '1a', 
            color: actionColor, 
            padding: '0.1rem 0.4rem', 
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            marginRight: '0.5rem',
            display: 'inline-block'
          }}>{action}</span>
          <span style={{ color: '#cbd5e1', wordBreak: 'break-word' }}>{description}</span>
        </div>
      );
    }
    
    return (
      <div key={idx} style={{ 
        padding: '0.4rem 0.5rem', 
        color: '#cbd5e1', 
        fontSize: '0.85rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)' 
      }}>
        {line}
      </div>
    );
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading settings...</div>;
  }

  const logLines = logs.split('\n').reverse();
  const filteredLines = logLines.filter(line => {
    if (!logsSearch) return true;
    return line.toLowerCase().includes(logsSearch.toLowerCase());
  });

  return (
    <div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Tab bar for Super Admin */}
      {isSuperAdmin && (
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('allowances')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'allowances' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'allowances' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            Allowance & Workflow Settings
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'logs' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'logs' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            System Activity Logs
          </button>
        </div>
      )}

      {activeTab === 'allowances' ? (
        <>
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

          {/* Workflow Settings Card */}
          {isSuperAdmin && (
            <div className="card" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} /> System Workflow Settings
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Configure approval requirements for instituting pay and allowance bills.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={requireApproval} 
                    disabled={savingSystem}
                    onChange={(e) => setRequireApproval(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  Require Approval from competent Authority
                </label>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveSystemSettings}
                  disabled={savingSystem}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Save size={16} /> {savingSystem ? 'Saving...' : 'Save Workflow Settings'}
                </button>
              </div>
            </div>
          )}

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
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No rules configured.</td>
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
        </>
      ) : (
        /* System Activity Logs Tab view */
        <div className="card" style={{ maxWidth: '1000px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={22} style={{ color: 'var(--color-primary)' }} />
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.1rem' }}>System Activity Logs</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  Auditing operations and configurations executed on the paybill application.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={logsSearch} 
                onChange={(e) => setLogsSearch(e.target.value)}
                className="form-control"
                style={{ width: '220px', fontSize: '0.875rem', padding: '0.4rem 0.8rem' }}
              />
              <button 
                onClick={fetchLogs} 
                disabled={logsLoading} 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                title="Refresh Logs"
              >
                <RefreshCw size={16} className={logsLoading ? 'spin-animation' : ''} />
              </button>
              <button 
                onClick={handleDownloadLogs} 
                className="btn btn-primary" 
                style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
              >
                <DownloadIcon size={16} /> Download
              </button>
            </div>
          </div>

          {logsError && (
            <div style={{ 
              padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)',
              fontSize: '0.875rem'
            }}>
              {logsError}
            </div>
          )}

          {!logsSynced && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              color: '#f59e0b',
              fontSize: '0.875rem',
              lineHeight: '1.4'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Local Log Sync Offline:</strong> The background logging helper server is not running on port 8089. Logs are safely stored in the database but are not synchronized to your local log file (<code>logfile/log.txt</code>). To fix this, please start the development environment using <code>npm run dev</code>.
              </div>
            </div>
          )}

          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            border: '1px solid #1e293b',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '0.5rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #334155'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'logfile/log.txt' : 'Cloudflare D1 Database'}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                {filteredLines.filter(Boolean).length} entries
              </span>
            </div>
            
            <div style={{
              maxHeight: '600px',
              minHeight: '300px',
              overflowY: 'auto',
              padding: '0.75rem',
              fontFamily: '"Fira Code", Monaco, Consolas, "Ubuntu Mono", monospace',
              backgroundColor: '#090d16',
              scrollbarWidth: 'thin'
            }}>
              {logsLoading ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '4rem', fontSize: '0.9rem' }}>
                  <RefreshCw size={24} className="spin-animation" style={{ marginBottom: '0.5rem' }} />
                  <div>Loading activity log entries...</div>
                </div>
              ) : filteredLines.filter(Boolean).length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '4rem', fontSize: '0.9rem' }}>
                  No log entries matched your search.
                </div>
              ) : (
                filteredLines.map((line, idx) => parseLogLine(line, idx))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
