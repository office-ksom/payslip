import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, User, Trash2, CheckCircle, XCircle, Mail, Key } from 'lucide-react';

const UserManagement = (props) => {
  if (props.user && props.user.role === 'viewer') {
    return <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>;
  }
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'viewer', status: 'active' });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setStatus({ type: 'success', text: 'User added/updated successfully.' });
        setNewUser({ email: '', role: 'viewer', status: 'active' });
        setShowAddForm(false);
        fetchUsers();
      } else {
        const err = await res.json();
        setStatus({ type: 'error', text: err.error || 'Failed to save user.' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Error communicating with server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (email === 'sreejith@ksom.res.in') {
      alert("Cannot delete the primary Super Admin.");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove access for ${email}?`)) return;

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadgeStyle = (role) => {
    const base = { padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' };
    switch (role) {
      case 'super_admin': return { ...base, backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' };
      case 'admin': return { ...base, backgroundColor: '#DBEAFE', color: '#1E40AF', border: '1px solid #93C5FD' };
      case 'approver': return { ...base, backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' };
      default: return { ...base, backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB' };
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>User Management</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Control who can access the portal and what they can do.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {status && (
        <div style={{
          padding: '1rem', marginBottom: '2rem', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: status.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          borderLeft: `4px solid ${status.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`
        }}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{status.text}</span>
        </div>
      )}

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--color-primary)' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Authorize New Email ID</h3>
          <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Institute Email</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                placeholder="user@ksom.res.in"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role Category</label>
              <select 
                className="form-control"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="super_admin">Super Admin (Full Access)</option>
                <option value="admin">Admin (Manage Data)</option>
                <option value="approver">Approver (Verify Only)</option>
                <option value="viewer">Viewer (Read Only)</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Account Status</label>
              <select 
                className="form-control"
                value={newUser.status}
                onChange={(e) => setNewUser({...newUser, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive / Suspended</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Role Category</th>
                <th>Status</th>
                <th>Created On</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)'
                      }}>
                        <User size={16} />
                      </div>
                      <div style={{ fontWeight: 600 }}>{user.email}</div>
                    </div>
                  </td>
                  <td>
                    <span style={getRoleBadgeStyle(user.role)}>{user.role.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                      {user.status === 'active' ? 
                        <><CheckCircle size={14} color="var(--color-success)" /> Active</> : 
                        <><XCircle size={14} color="var(--color-danger)" /> Suspended</>
                      }
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem', color: 'var(--color-danger)' }}
                      onClick={() => handleDeleteUser(user.id, user.email)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
