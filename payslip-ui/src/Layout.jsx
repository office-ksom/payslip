import { Outlet, NavLink, useOutletContext } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, FileText, Download, ShieldCheck, UserCog, LogOut, ChevronDown, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Layout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(res => {
      if (res.status === 401 || res.status === 403) {
        // Just throw error, the UI will show the login screen
        throw new Error('Unauthorized');
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a 
                href="/api/auth/google" 
                className="btn btn-primary" 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', 
                  padding: '0.875rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 600
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Institute Google ID
              </a>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                You will be redirected to Google for secure authentication.
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
                      window.location.href = '/api/auth/logout';
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
