import React, { useState, useEffect } from 'react';
import { Download, Upload, Mail, Shield, AlertTriangle, CheckCircle, Save } from 'lucide-react';

const Backup = (props) => {
  if (props.user && props.user.role === 'viewer') {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>;
  }
  const [settings, setSettings] = useState({ backup_email: '', frequency: 'weekly', is_enabled: 0 });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [restoreFile, setRestoreFile] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/backup');
      if (res.ok) setSettings(await res.json());
    } catch (err) {
      console.error('Failed to fetch backup settings', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) setStatus({ type: 'success', text: 'Backup settings saved.' });
      else setStatus({ type: 'error', text: 'Failed to save settings.' });
    } catch (err) {
      setStatus({ type: 'error', text: 'Error communicating with server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backup');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ksom_backup_${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setStatus({ type: 'success', text: 'Backup downloaded successfully.' });
      } else {
        setStatus({ type: 'error', text: 'Failed to generate backup.' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Backup failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    if (!window.confirm("WARNING: This will overwrite ALL current data in the database. Are you sure you want to proceed?")) return;

    setLoading(true);
    setStatus({ type: 'info', text: 'Restoring data... Please do not close the window.' });
    
    try {
      const sql = await restoreFile.text();
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      
      if (res.ok) {
        setStatus({ type: 'success', text: 'Database restored successfully!' });
        setRestoreFile(null);
      } else {
        const err = await res.json();
        setStatus({ type: 'error', text: `Restore failed: ${err.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Error during restore process.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailBackup = async () => {
    if (!settings.backup_email) {
      setStatus({ type: 'error', text: 'Please configure a backup email first.' });
      return;
    }
    
    setLoading(true);
    setStatus({ type: 'info', text: 'Generating and sending backup email...' });
    
    try {
      // 1. Get SQL
      const resBackup = await fetch('/api/backup');
      const sql = await resBackup.text();
      
      // 2. Send via Email API
      const resEmail = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: settings.backup_email,
          subject: `KSoM Payslip Backup - ${new Date().toLocaleDateString()}`,
          text: `Please find attached the SQL backup for the KSoM Payslip Portal generated on ${new Date().toLocaleString()}.`,
          attachments: [
            {
              filename: `backup_${new Date().toISOString().split('T')[0]}.sql`,
              content: btoa(sql) // Base64 encode the SQL text
            }
          ]
        })
      });
      
      if (resEmail.ok) {
        setStatus({ type: 'success', text: `Backup emailed successfully to ${settings.backup_email}` });
      } else {
        const err = await resEmail.json();
        setStatus({ type: 'error', text: `Email failed: ${err.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Failed to send email backup.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Backup & Restore</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Manage your database safety and recover data from backups.</p>
      </div>

      {status && (
        <div style={{
          padding: '1rem', marginBottom: '2rem', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          color: status.type === 'success' ? 'var(--color-success)' : status.type === 'error' ? 'var(--color-danger)' : 'var(--color-primary)',
          borderLeft: `4px solid ${status.type === 'success' ? 'var(--color-success)' : status.type === 'error' ? 'var(--color-danger)' : 'var(--color-primary)'}`
        }}>
          {status.type === 'success' ? <CheckCircle size={20} /> : status.type === 'error' ? <AlertTriangle size={20} /> : <Shield size={20} />}
          <span style={{ fontWeight: 500 }}>{status.text}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Manual Backup & Restore */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--color-primary)" /> Manual Operations
          </h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Download a complete SQL snapshot of your database to your local machine.</p>
            <button className="btn btn-primary" onClick={handleDownloadBackup} disabled={loading} style={{ width: '100%' }}>
              <Download size={18} /> Download SQL Backup
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-danger)' }}>Restore Data</h4>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>Upload a previously downloaded SQL file to restore the entire database.</p>
            
            <input 
              type="file" 
              accept=".sql" 
              onChange={(e) => setRestoreFile(e.target.files[0])}
              style={{ marginBottom: '1rem', display: 'block', width: '100%', fontSize: '0.875rem' }}
            />
            
            <button 
              className="btn" 
              onClick={handleRestore} 
              disabled={loading || !restoreFile}
              style={{ 
                width: '100%', 
                backgroundColor: !restoreFile ? 'var(--color-bg-secondary)' : 'var(--color-danger)',
                color: !restoreFile ? 'var(--color-text-muted)' : 'white'
              }}
            >
              <Upload size={18} /> Restore from File
            </button>
            <p style={{ fontSize: '0.75rem', marginTop: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              <AlertTriangle size={12} /> This will overwrite all current data.
            </p>
          </div>
        </div>

        {/* Scheduled & Email Backup */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={20} color="var(--color-accent-primary)" /> Automated Backups
          </h3>
          
          <form onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label className="form-label">Backup Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="backup@example.com"
                value={settings.backup_email || ''}
                onChange={(e) => setSettings({...settings, backup_email: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Backup Frequency</label>
              <select 
                className="form-control"
                value={settings.frequency}
                onChange={(e) => setSettings({...settings, frequency: e.target.value})}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={settings.is_enabled === 1}
                  onChange={(e) => setSettings({...settings, is_enabled: e.target.checked ? 1 : 0})}
                />
                <span style={{ fontSize: '0.875rem' }}>Enable Automated Email Backups</span>
              </label>
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }} disabled={loading}>
              <Save size={18} /> Save Settings
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Test your configuration by sending a backup immediately.</p>
            <button className="btn btn-secondary" onClick={handleEmailBackup} disabled={loading} style={{ width: '100%' }}>
              <Mail size={18} /> Send Backup to Email Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;
