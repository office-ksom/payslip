import { Outlet, NavLink, useOutletContext } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, FileText, Download, ShieldCheck, UserCog, LogOut, ChevronDown, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Layout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(res => {
      if (res.status === 401 || res.status === 403) {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocal) {
          window.location.href = '/cdn-cgi/access/login';
          return;
        }
      }
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    }).then(data => {
      if (data) setUser(data);
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  const isSuperAdmin = user && user.role === 'super_admin';

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-primary)' }}>Loading Portal...</div>;

  if (!user) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '3rem', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '2rem',
            marginBottom: '1.5rem', boxShadow: 'var(--shadow-lg)'
          }}>K</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>KSoM Payslip Portal</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Please sign in with your institute email via Google</p>
          
          {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const email = e.target.email.value;
              if (email) {
                document.cookie = `mock_email=${email}; Path=/; Max-Age=86400`;
                window.location.reload();
              }
            }}>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <strong>Development Mode:</strong> Enter an email to simulate login.
              </div>
              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Email ID (Mock)</label>
                <input 
                  name="email"
                  type="email" 
                  className="form-control" 
                  required 
                  placeholder="sreejith@ksom.res.in"
                  style={{ padding: '0.75rem 1rem' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                Sign In (Local Dev)
              </button>
            </form>
          ) : (
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                Redirecting to Institute Login...
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                We are verifying your credentials with Google.
              </p>
            </div>
          )}
          
          <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Note: Only authorized institute accounts are allowed access.
          </p>
        </div>
      </div>
    );
  }

  const isViewer = user && user.role === 'viewer';

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', 
            background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'
          }}>
            K
          </div>
          <span className="sidebar-logo-text">KSoM Payslip</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>
          
          {!isViewer && (
            <>
              <NavLink to="/employees" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Users size={20} />
                <span>Employees</span>
              </NavLink>
              <NavLink to="/paybill" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FileText size={20} />
                <span>Paybill Generation</span>
              </NavLink>
            </>
          )}

          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Download size={20} />
            <span>Reports & Exports</span>
          </NavLink>

          <div style={{ marginTop: 'auto' }}>
            {!isViewer && isSuperAdmin && (
              <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ marginBottom: '0.5rem' }}>
                <UserCog size={20} />
                <span>User Management</span>
              </NavLink>
            )}
            {!isViewer && isAdmin && (
              <>
                <NavLink to="/backup" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ marginBottom: '0.5rem' }}>
                  <ShieldCheck size={20} />
                  <span>Backup & Restore</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Settings size={20} />
                  <span>Allowances Settings</span>
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <h2 style={{ fontSize: '1.25rem', marginBottom: 0 }}>Portal Dashboard</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.75rem',
                  borderRadius: '12px', backgroundColor: 'var(--color-bg-surface-hover)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  border: showUserMenu ? '1px solid var(--color-primary)' : '1px solid transparent',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                }}>
                  <User size={18} />
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {user ? user.email.split('@')[0] : 'User'}
                  </div>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-accent-primary)', fontWeight: 800 }}>
                    {user ? user.role.replace('_', ' ') : ''}
                  </div>
                </div>
                <ChevronDown size={14} style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>
              
              {showUserMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '240px',
                  backgroundColor: 'var(--color-bg-surface)', borderRadius: '12px', 
                  boxShadow: 'var(--shadow-lg)', padding: '0.5rem', zIndex: 1001, 
                  border: '1px solid var(--color-border)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Signed in as</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', wordBreak: 'break-all' }}>{user?.email}</div>
                  </div>
                  <div 
                    onClick={() => {
                      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                      if (isLocal) {
                        document.cookie = 'mock_email=; Path=/; Max-Age=0';
                        window.location.reload();
                      } else {
                        window.location.href = '/cdn-cgi/access/logout';
                      }
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                      borderRadius: '8px', cursor: 'pointer',
                      color: 'var(--color-danger)', fontSize: '0.9rem', fontWeight: 600,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={18} /> Logout / Switch User
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-container">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
};

export default Layout;
