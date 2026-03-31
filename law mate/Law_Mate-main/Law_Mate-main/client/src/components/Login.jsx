import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBalanceScale, FaEnvelope, FaLock, FaUser, FaUserShield, FaUserTie, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import API_URL from '../config';

const ROLES = [
    { key: 'public',  label: 'Citizen',       icon: FaUser,      color: '#1E3A8A', desc: 'Legal research & AI guidance' },
    { key: 'police',  label: 'Police Officer', icon: FaUserShield,color: '#059669', desc: 'FIR drafting & enforcement tools' },
    { key: 'admin',   label: 'Administrator',  icon: FaUserTie,   color: '#7C3AED', desc: 'Full platform management' },
];

export default function Login({ onLogin }) {
    const [role, setRole]         = useState('public');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const navigate = useNavigate();

    const selected = ROLES.find(r => r.key === role);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res  = await fetch(`${API_URL}/api/auth/login`, {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ email, password, role, rememberMe: remember })
            });
            const data = await res.json();
            if (res.ok) onLogin(data, remember);
            else setError(data.message || 'Login failed. Check your credentials.');
        } catch { setError('Network error — is the server running?'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight:'100vh', background:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center', padding:16, fontFamily:'Inter, system-ui, sans-serif' }}>

            {/* Back button */}
            <button onClick={() => navigate('/')} style={{ position:'fixed', top:20, left:20, display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:99, cursor:'pointer', fontSize:'0.8125rem', fontWeight:600, color:'#6B7280', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', transition:'all 0.2s', zIndex:10 }}
                onMouseEnter={e => { e.currentTarget.style.background='#1E3A8A'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='#1E3A8A'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#6B7280'; e.currentTarget.style.borderColor='#E5E7EB'; }}>
                <FaArrowLeft size={11} /> Back
            </button>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', maxWidth:900, width:'100%', background:'#fff', borderRadius:24, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.1)', minHeight:560 }}>

                {/* Left panel */}
                <div style={{ background:'linear-gradient(145deg, #1E3A8A 0%, #1d4ed8 60%, #2563EB 100%)', padding:'48px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}
                    className="d-none d-md-flex">
                    <div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:40 }}>
                            <div style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <FaBalanceScale color="#fff" size={18} />
                            </div>
                            <span style={{ fontSize:'1.1rem', fontWeight:800, color:'#fff' }}>LawMate</span>
                        </div>
                        <h2 style={{ fontSize:'1.75rem', fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:12 }}>India's AI-Powered Legal Assistant</h2>
                        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.9rem', lineHeight:1.7 }}>Search 2400+ sections across IPC, CrPC, CPC and 5 more laws. Get instant legal guidance.</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {['2400+ Legal Sections', 'AI-Powered Search', 'FIR Generation', 'Court Reminders'].map((f,i) => (
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, color:'rgba(255,255,255,0.85)', fontSize:'0.875rem' }}>
                                <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', flexShrink:0 }}>✓</div>
                                {f}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right form */}
                <div style={{ padding:'48px 40px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                    <div style={{ marginBottom:28 }}>
                        <h3 style={{ fontSize:'1.375rem', fontWeight:800, color:'#111827', marginBottom:4 }}>Welcome back</h3>
                        <p style={{ fontSize:'0.875rem', color:'#6B7280' }}>Sign in to your account</p>
                    </div>

                    {/* Role picker */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:20 }}>
                        {ROLES.map(r => {
                            const Icon = r.icon;
                            const active = role === r.key;
                            return (
                                <button key={r.key} onClick={() => setRole(r.key)} style={{
                                    padding:'10px 6px', borderRadius:12, border:`1.5px solid ${active ? r.color : '#E5E7EB'}`,
                                    background: active ? r.color + '12' : '#fff', cursor:'pointer', transition:'all 0.15s', textAlign:'center'
                                }}>
                                    <Icon size={16} color={active ? r.color : '#9CA3AF'} style={{ marginBottom:4 }} />
                                    <div style={{ fontSize:'0.7rem', fontWeight:700, color: active ? r.color : '#6B7280' }}>{r.label}</div>
                                </button>
                            );
                        })}
                    </div>

                    {error && (
                        <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:'0.8125rem', color:'#EF4444', display:'flex', alignItems:'center', gap:8 }}>
                            ⚠ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                        <div>
                            <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Email Address</label>
                            <div style={{ position:'relative' }}>
                                <FaEnvelope style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:14 }} />
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"
                                    style={{ width:'100%', padding:'10px 14px 10px 40px', borderRadius:12, border:'1.5px solid #E5E7EB', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', transition:'border-color 0.15s' }}
                                    onFocus={e => e.target.style.borderColor='#3B82F6'}
                                    onBlur={e  => e.target.style.borderColor='#E5E7EB'} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                                <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#374151' }}>Password</label>
                                <Link to="/forgot-password" style={{ fontSize:'0.8rem', color:'#3B82F6', textDecoration:'none', fontWeight:500 }}>Forgot?</Link>
                            </div>
                            <div style={{ position:'relative' }}>
                                <FaLock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:14 }} />
                                <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                    style={{ width:'100%', padding:'10px 42px 10px 40px', borderRadius:12, border:'1.5px solid #E5E7EB', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', transition:'border-color 0.15s' }}
                                    onFocus={e => e.target.style.borderColor='#3B82F6'}
                                    onBlur={e  => e.target.style.borderColor='#E5E7EB'} />
                                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', padding:2 }}>
                                    {showPw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                </button>
                            </div>
                        </div>

                        <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:'0.8125rem', color:'#6B7280', fontWeight:500 }}>
                            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width:15, height:15, accentColor:'#1E3A8A', cursor:'pointer' }} />
                            Keep me signed in
                        </label>

                        <button type="submit" disabled={loading} style={{
                            padding:'11px', borderRadius:12, border:'none', fontFamily:'inherit',
                            background: loading ? '#93C5FD' : `linear-gradient(135deg, ${selected.color}, #3B82F6)`,
                            color:'#fff', fontWeight:700, fontSize:'0.9375rem', cursor: loading ? 'not-allowed' : 'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s',
                            boxShadow: loading ? 'none' : '0 4px 14px rgba(30,58,138,0.3)'
                        }}>
                            {loading ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Signing in...</> : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign:'center', marginTop:20, fontSize:'0.875rem', color:'#6B7280' }}>
                        New to LawMate? <Link to="/register" style={{ color:'#1E3A8A', fontWeight:700, textDecoration:'none' }}>Create account</Link>
                    </p>
                </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
