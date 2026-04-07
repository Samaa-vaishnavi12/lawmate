import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';
import {
    FaHome, FaRobot, FaSearch, FaFileAlt, FaHistory,
    FaSignOutAlt, FaChevronLeft, FaChevronRight,
    FaUser, FaCog, FaFolder, FaArrowLeft,
    FaUserShield, FaBars, FaBalanceScale
} from 'react-icons/fa';

const MainLayout = ({ user, onLogout, theme, setTheme }) => {
    const [collapsed, setCollapsed]     = useState(false);
    const [showMobile, setShowMobile]   = useState(false);
    const navigate  = useNavigate();
    const location  = useLocation();

    const role           = user?.role?.toLowerCase();
    const isPoliceOrAdmin = role === 'police' || role === 'admin' || user?.isAdmin;

    const navItems = [
        { path: '/dashboard',     label: 'Dashboard',    icon: FaHome },
        { path: '/chat',          label: 'AI Assistant', icon: FaRobot },
        { path: '/analysis',      label: 'Doc Analysis', icon: FaSearch },
        { path: '/generator',     label: 'FIR Generator',icon: FaFileAlt, policeOnly: true },
        { path: '/fir-history',   label: 'FIR History',  icon: FaFolder,  policeOnly: true },
        { path: '/saved-queries', label: 'Saved',        icon: FaHistory },
        ...(user?.isAdmin ? [{ path: '/admin', label: 'Admin', icon: FaCog }] : []),
    ].filter(i => !i.policeOnly || isPoliceOrAdmin);

    // Bottom nav — top 5 for mobile
    const bottomNav = [
        { path: '/dashboard', label: 'Home',  icon: FaHome },
        { path: '/chat',      label: 'AI',    icon: FaRobot },
        { path: '/analysis',  label: 'Docs',  icon: FaSearch },
        { path: '/saved-queries', label: 'Saved', icon: FaHistory },
        { path: '/profile',   label: 'Me',    icon: FaUser },
    ];

    const handleLogout = () => { onLogout(); navigate('/'); };
    const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'U';

    const SidebarBody = ({ compact }) => (
        <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#1E3A8A' }}>
            {/* Logo */}
            <div style={{ padding: compact ? '20px 16px' : '20px 20px 16px', display:'flex', alignItems:'center', justifyContent: compact ? 'center' : 'space-between', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                {!compact && (
                    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                            <FaBalanceScale color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize:'1rem', fontWeight:800, color:'#fff', lineHeight:1 }}>LawMate</div>
                            {isPoliceOrAdmin && role !== 'admin' && (
                                <div style={{ fontSize:'0.6rem', color:'#93C5FD', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginTop:2 }}>
                                    <FaUserShield style={{ marginRight:3 }} />Police
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {compact && (
                    <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <FaBalanceScale color="#fff" size={16} />
                    </div>
                )}
                {!compact && (
                    <button onClick={() => setCollapsed(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:4 }}>
                        <FaChevronLeft size={13} />
                    </button>
                )}
            </div>

            {/* Back to home */}
            {!compact && (
                <div style={{ padding:'10px 12px 4px' }}>
                    <NavLink to="/" style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, color:'rgba(255,255,255,0.45)', fontSize:'0.8rem', fontWeight:500, textDecoration:'none', transition:'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                        <FaArrowLeft size={11} /> Back to Home
                    </NavLink>
                </div>
            )}

            {/* Nav items */}
            <nav style={{ padding: compact ? '10px 8px' : '8px 12px', flex:1, overflowY:'auto' }}>
                {!compact && <div style={{ fontSize:'0.65rem', fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'1px', padding:'6px 10px 8px' }}>Navigation</div>}
                {navItems.map(({ path, label, icon: Icon }) => {
                    const active = location.pathname === path;
                    return (
                        <NavLink key={path} to={path} onClick={() => setShowMobile(false)}
                            style={{
                                display:'flex', alignItems:'center', gap: compact ? 0 : 10,
                                justifyContent: compact ? 'center' : 'flex-start',
                                padding: compact ? '11px' : '9px 10px',
                                borderRadius: 10, marginBottom: 2, textDecoration:'none',
                                background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                                fontWeight: active ? 600 : 500,
                                fontSize:'0.875rem', transition:'all 0.15s'
                            }}
                            onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.9)'; }}}
                            onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}}
                            title={compact ? label : ''}>
                            <span style={{ fontSize:'0.95rem', width:20, textAlign:'center', flexShrink:0 }}><Icon /></span>
                            {!compact && <span style={{ whiteSpace:'nowrap', overflow:'hidden' }}>{label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Expand btn (collapsed) */}
            {compact && (
                <div style={{ padding:'12px 8px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'center' }}>
                    <button onClick={() => setCollapsed(false)} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:8, padding:'8px 10px', cursor:'pointer', color:'rgba(255,255,255,0.7)' }}>
                        <FaChevronRight size={12} />
                    </button>
                </div>
            )}

            {/* User chip */}
            {!compact && (
                <div style={{ padding:'12px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.08)', cursor:'pointer' }}
                        onClick={() => navigate('/profile')}>
                        <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#3B82F6,#60A5FA)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.875rem', fontWeight:700, color:'#fff', flexShrink:0 }}>
                            {initials}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:'0.8rem', fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
                            <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.4px' }}>{user.isAdmin ? 'Admin' : role}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:7, padding:'6px 7px', cursor:'pointer', color:'rgba(255,255,255,0.6)', transition:'all 0.15s', flexShrink:0 }}
                            title="Logout">
                            <FaSignOutAlt size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#F9FAFB' }}>

            {/* ── Desktop Sidebar ── */}
            <div className="d-none d-md-block" style={{ width: collapsed ? 68 : 240, minWidth: collapsed ? 68 : 240, transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)', overflow:'hidden' }}>
                <SidebarBody compact={collapsed} />
            </div>

            {/* ── Mobile Sidebar (Offcanvas) ── */}
            <Offcanvas show={showMobile} onHide={() => setShowMobile(false)} style={{ width:260, padding:0, border:'none' }}>
                <Offcanvas.Body style={{ padding:0 }}>
                    <SidebarBody compact={false} />
                </Offcanvas.Body>
            </Offcanvas>

            {/* ── Main ── */}
            <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

                {/* Topbar */}
                <div style={{ height:60, background:'#fff', borderBottom:'1px solid #E5E7EB', display:'flex', alignItems:'center', padding:'0 20px', gap:16, flexShrink:0, boxShadow:'0 1px 3px rgba(0,0,0,0.05)', zIndex:10 }}>
                    {/* Mobile hamburger */}
                    <button className="d-md-none" onClick={() => setShowMobile(true)} style={{ background:'none', border:'none', cursor:'pointer', padding:6, borderRadius:8, color:'#6B7280' }}>
                        <FaBars size={20} />
                    </button>

                    {/* Page title */}
                    <div style={{ flex:1 }}>
                        <div style={{ fontSize:'0.9375rem', fontWeight:700, color:'#111827' }}>
                            {navItems.find(n => n.path === location.pathname)?.label || 'Law Mate'}
                        </div>
                    </div>

                    {/* Right actions */}
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <NavLink to="/settings" style={{ padding:'7px 8px', borderRadius:8, color:'#6B7280', textDecoration:'none', transition:'all 0.15s', display:'flex' }}
                            title="Settings">
                            <FaCog size={16} />
                        </NavLink>

                        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px', borderRadius:99, background:'#F3F4F6', cursor:'pointer' }} onClick={() => navigate('/profile')}>
                            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#1E3A8A,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, color:'#fff' }}>
                                {initials}
                            </div>
                            <div className="d-none d-sm-block" style={{ fontSize:'0.8125rem', fontWeight:600, color:'#111827' }}>{user.name}</div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <main style={{ flex:1, overflowY:'auto', overflowX:'hidden', background:'#F9FAFB' }}>
                    <Outlet context={{ theme, setTheme }} />
                </main>
            </div>

            {/* ── Mobile Bottom Nav ── */}
            <div className="lm-bottom-nav">
                {bottomNav.map(({ path, label, icon: Icon }) => {
                    const active = location.pathname === path;
                    return (
                        <NavLink key={path} to={path} className={`lm-bottom-nav__item${active ? ' lm-bottom-nav__item--active' : ''}`}>
                            <div className="lm-bottom-nav__icon">
                                <Icon size={18} />
                            </div>
                            {label}
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
};

export default MainLayout;
