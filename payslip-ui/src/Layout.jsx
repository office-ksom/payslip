import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, FileText, Download, ShieldCheck, UserCog, LogOut, ChevronDown, User, Key, Table, Coins, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Layout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Mobile navigation drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, rememberMe })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        window.location.reload();
      } else {
        setLoginError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setLoginError('A network error occurred. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [billMenuOpen, setBillMenuOpen] = useState(false);
  const [reportsMenuOpen, setReportsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (['/paybill', '/surrender-bill', '/arrear-bill', '/festival-bill', '/supplementary-bill'].includes(path)) {
      setBillMenuOpen(true);
    }
    if (['/reports', '/epf-reports'].includes(path)) {
      setReportsMenuOpen(true);
    }
  }, []);

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
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)',
        padding: '1rem'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px', padding: 'clamp(1.5rem, 5vw, 2.5rem)', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
          <img 
            src="/logo.png" 
            alt="KSoM Logo" 
            style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '1.5rem' }} 
          />
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>KSoM Portal</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Sign in to manage payslips</p>
          
          {loginError && (
            <div style={{ 
              padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--color-danger)', borderRadius: '8px', marginBottom: '1.5rem',
              fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required 
                placeholder="name@ksom.res.in"
                style={{ padding: '0.75rem 1rem' }}
              />
            </div>
            
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required 
                placeholder="••••••••"
                style={{ padding: '0.75rem 1rem', paddingRight: '3.5rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '38px',
                  background: 'none', border: 'none', color: 'var(--color-text-muted)',
                  cursor: 'pointer', fontSize: '0.8rem'
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none' }} onClick={async (e) => {
                e.preventDefault();
                if (!loginEmail) {
                  alert('Please enter your email address first.');
                  return;
                }
                if (!window.confirm(`Send password reset link to ${loginEmail}?`)) return;
                
                try {
                  const res = await fetch('/api/auth/reset-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: loginEmail })
                  });
                  if (res.ok) alert('If this email is registered, a reset link has been sent to your inbox.');
                  else alert('Failed to send reset request.');
                } catch (err) {
                  alert('Network error.');
                }
              }}>
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600 }}
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Note: Only authorized institute accounts are allowed access.
          </p>
        </div>
      </div>
    );
  }

  const isViewer = user && user.role === 'viewer';
  const isApprover = user && user.role === 'approver';

  const closeMobileDrawer = () => setMobileMenuOpen(false);

  return (
    <div className="app-container">
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`sidebar-backdrop ${mobileMenuOpen ? 'active' : ''}`} 
        onClick={closeMobileDrawer}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/logo.png" 
              alt="KSoM Logo" 
              style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
            />
            <span className="sidebar-logo-text">KSoM Payslip</span>
          </div>
          <button 
            className="mobile-sidebar-close" 
            onClick={closeMobileDrawer}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={closeMobileDrawer} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>
          
          {isAdmin && (
            <NavLink to="/employees" onClick={closeMobileDrawer} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Employees</span>
            </NavLink>
          )}

          {!isViewer && (
            <div>
              <div 
                onClick={() => setBillMenuOpen(!billMenuOpen)}
                className={`nav-link ${billMenuOpen ? 'active' : ''}`}
                style={{ cursor: 'pointer', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={20} />
                  <span>Bill Generation</span>
                </div>
                <ChevronDown size={14} style={{ transform: billMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>
              
              {billMenuOpen && (
                <div style={{ paddingLeft: '2.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <NavLink to="/paybill" onClick={closeMobileDrawer} className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}>
                    <span>Paybill</span>
                  </NavLink>
                  <NavLink to="/supplementary-bill" onClick={closeMobileDrawer} className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}>
                    <span>Supplementary Paybill</span>
                  </NavLink>
                  <NavLink to="/surrender-bill" onClick={closeMobileDrawer} className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}>
                    <span>Surrender Bill</span>
                  </NavLink>
                  <NavLink to="/arrear-bill" onClick={closeMobileDrawer} className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}>
                    <span>Arrear Bill</span>
                  </NavLink>
                  <NavLink to="/festival-bill" onClick={closeMobileDrawer} className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}>
                    <span>Festival Allowance Bill</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {!isViewer && (
            <NavLink to="/epf-entry" onClick={closeMobileDrawer} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Coins size={20} />
              <span>EPF Entry</span>
            </NavLink>
          )}

          <div>
            <div 
              onClick={() => setReportsMenuOpen(!reportsMenuOpen)}
              className={`nav-link ${reportsMenuOpen ? 'active' : ''}`}
              style={{ cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Download size={20} />
                <span>Reports & Exports</span>
              </div>
              <ChevronDown size={14} style={{ transform: reportsMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </div>
            
            {reportsMenuOpen && (
              <div style={{ paddingLeft: '2.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <NavLink to="/reports" onClick={closeMobileDrawer} className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}>
                  <span>Bills</span>
                </NavLink>
                <NavLink to="/epf-reports" onClick={closeMobileDrawer} className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}>
                  <span>EPF Reports</span>
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/consolidated-statement" onClick={closeMobileDrawer} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Table size={20} />
            <span>Consolidated FY Statement (individual)</span>
          </NavLink>

          {isAdmin && (
            <NavLink to="/consolidated-statement-all" onClick={closeMobileDrawer} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Table size={20} />
              <span>Consolidated FY Statements (All Employees)</span>
            </NavLink>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            {!isViewer && isSuperAdmin && (
              <NavLink to="/users" onClick={closeMobileDrawer} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ marginBottom: '0.5rem' }}>
                <UserCog size={20} />
                <span>User Management</span>
              </NavLink>
            )}
            {!isViewer && isAdmin && (
              <>
                <NavLink to="/backup" onClick={closeMobileDrawer} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ marginBottom: '0.5rem' }}>
                  <ShieldCheck size={20} />
                  <span>Backup & Restore</span>
                </NavLink>
                <NavLink to="/settings" onClick={closeMobileDrawer} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Settings size={20} />
                  <span>Settings</span>
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>
            <div className="topbar-title">
              <h2 style={{ fontSize: '1.15rem', marginBottom: 0, fontWeight: 700 }}>Portal Dashboard</h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }} ref={menuRef}>
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.65rem',
                  borderRadius: '12px', backgroundColor: 'var(--color-bg-surface-hover)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  border: showUserMenu ? '1px solid var(--color-primary)' : '1px solid transparent',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0
                }}>
                  <User size={16} />
                </div>
                <div className="topbar-user-info" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user ? user.email.split('@')[0] : 'User'}
                  </div>
                  <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--color-accent-primary)', fontWeight: 800 }}>
                    {user ? user.role.replace('_', ' ') : ''}
                  </div>
                </div>
                <ChevronDown size={14} style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>
              
              {showUserMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 'min(90vw, 240px)',
                  backgroundColor: 'var(--color-bg-surface)', borderRadius: '12px', 
                  boxShadow: 'var(--shadow-lg)', padding: '0.5rem', zIndex: 1001, 
                  border: '1px solid var(--color-border)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Signed in as</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', wordBreak: 'break-all' }}>{user?.email}</div>
                  </div>
                  <div 
                    onClick={() => {
                      const newPass = prompt("Enter your new password (min 6 characters):");
                      if (newPass && newPass.length >= 6) {
                        fetch('/api/me/password', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ password: newPass })
                        }).then(res => {
                          if (res.ok) alert('Password changed successfully.');
                          else alert('Failed to change password.');
                        });
                      } else if (newPass) {
                        alert('Password too short.');
                      }
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                      borderRadius: '8px', cursor: 'pointer',
                      color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-surface-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Key size={16} /> Change Password
                  </div>
                  <div 
                    onClick={() => {
                      window.location.href = '/api/auth/logout';
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                      borderRadius: '8px', cursor: 'pointer',
                      color: 'var(--color-danger)', fontSize: '0.875rem', fontWeight: 600,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} /> Logout / Switch User
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
