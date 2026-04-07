import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBalanceScale, FaEnvelope, FaLock, FaUser, FaUserShield, FaArrowLeft, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import API_URL from '../config';

export default function Register({ onLogin }) {
    const [name, setName]         = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [role, setRole]         = useState('public');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        setError(''); setLoading(true);
        try {
            const res  = await fetch(`${API_URL}/api/auth/register`, {
                method:'POST', headers:{'Content-Type':'application/json'},
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            if (res.ok) navigate('/login');
            else setError(data.message || 'Registration failed.');
        } catch { setError('Server error. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight:'100vh', background:'#F9FAFB', display:'flex', alignItems:'center', justifyContent:'center', padding:16, fontFamily:'Inter,system-ui,sans-serif' }}>
            <button onClick={() => navigate('/')} style={{ position:'fixed', top:20, left:20, display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#fff', border:'1.5px solid #E5E7EB', borderRadius:99, cursor:'pointer', fontSize:'0.8125rem', fontWeight:600, color:'#6B7280', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', zIndex:10 }}
                onMouseEnter={e => { e.currentTarget.style.background='#1E3A8A'; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='#6B7280'; }}>
                <FaArrowLeft size={11} /> Back
            </button>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', maxWidth:900, width:'100%', background:'#fff', borderRadius:24, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.1)' }}>

                {/* Left */}
                <div style={{ background:'linear-gradient(145deg,#064E3B,#059669)', padding:'48px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }} className="d-none d-md-flex">
                    <div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:40 }}>
                            <div style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <FaBalanceScale color="#fff" size={18} />
                            </div>
                            <span style={{ fontSize:'1.1rem', fontWeight:800, color:'#fff' }}>LawMate</span>
                        </div>
                        <h2 style={{ fontSize:'1.75rem', fontWeight:800, color:'#fff', lineHeight:1.2, marginBottom:12 }}>Join 10,000+ Legal Professionals</h2>
                        <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.9rem', lineHeight:1.7 }}>Get free access to India's most comprehensive legal AI platform.</p>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        {[
                            { icon:'⚖️', label:'2400+ Laws',       desc:'IPC, CrPC & more' },
                            { icon:'🤖', label:'AI Assistant',      desc:'Instant answers' },
                            { icon:'📋', label:'FIR Generator',     desc:'Auto-fill sections' },
                            { icon:'📍', label:'Court Finder',      desc:'GPS navigation' },
                        ].map((f,i) => (
                            <div key={i} style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 14px' }}>
                                <div style={{ fontSize:'1.25rem', marginBottom:4 }}>{f.icon}</div>
                                <div style={{ fontSize:'0.8rem', fontWeight:700, color:'#fff' }}>{f.label}</div>
                                <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.6)' }}>{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right */}
                <div style={{ padding:'48px 40px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                    <div style={{ marginBottom:24 }}>
                        <h3 style={{ fontSize:'1.375rem', fontWeight:800, color:'#111827', marginBottom:4 }}>Create your account</h3>
                        <p style={{ fontSize:'0.875rem', color:'#6B7280' }}>Free forever. No credit card required.</p>
                    </div>

                    {/* Role toggle */}
                    <div style={{ display:'flex', background:'#F3F4F6', borderRadius:12, padding:4, marginBottom:20, gap:4 }}>
                        {[{ key:'public', label:'👤 Citizen', color:'#1E3A8A' }, { key:'police', label:'👮 Officer', color:'#059669' }].map(r => (
                            <button key={r.key} onClick={() => setRole(r.key)} style={{
                                flex:1, padding:'8px', border:'none', borderRadius:9, cursor:'pointer', fontFamily:'inherit',
                                background: role === r.key ? '#fff' : 'transparent',
                                color: role === r.key ? r.color : '#6B7280',
                                fontWeight: role === r.key ? 700 : 500,
                                fontSize:'0.8125rem',
                                boxShadow: role === r.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                transition:'all 0.15s'
                            }}>{r.label}</button>
                        ))}
                    </div>

                    {error && <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:'0.8125rem', color:'#EF4444' }}>⚠ {error}</div>}

                    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                        {[
                            { label:'Full Name', type:'text', val:name, set:setName, icon:FaUser, ph:'Your full name', required:true },
                            { label:'Email Address', type:'email', val:email, set:setEmail, icon:FaEnvelope, ph:'name@example.com', required:true },
                        ].map(({ label, type, val, set, icon:Icon, ph, required }) => (
                            <div key={label}>
                                <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>{label}</label>
                                <div style={{ position:'relative' }}>
                                    <Icon style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:14 }} />
                                    <input type={type} required={required} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                                        style={{ width:'100%', padding:'10px 14px 10px 40px', borderRadius:12, border:'1.5px solid #E5E7EB', fontSize:'0.875rem', outline:'none', fontFamily:'inherit' }}
                                        onFocus={e => e.target.style.borderColor='#3B82F6'}
                                        onBlur={e  => e.target.style.borderColor='#E5E7EB'} />
                                </div>
                            </div>
                        ))}

                        <div>
                            <label style={{ fontSize:'0.8rem', fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Password</label>
                            <div style={{ position:'relative' }}>
                                <FaLock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:14 }} />
                                <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                                    style={{ width:'100%', padding:'10px 42px 10px 40px', borderRadius:12, border:'1.5px solid #E5E7EB', fontSize:'0.875rem', outline:'none', fontFamily:'inherit' }}
                                    onFocus={e => e.target.style.borderColor='#3B82F6'}
                                    onBlur={e  => e.target.style.borderColor='#E5E7EB'} />
                                <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9CA3AF' }}>
                                    {showPw ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                </button>
                            </div>
                            {password.length > 0 && (
                                <div style={{ marginTop:6, display:'flex', gap:4 }}>
                                    {[1,2,3,4].map(i => (
                                        <div key={i} style={{ flex:1, height:3, borderRadius:99, background: password.length >= i*2 ? (password.length >= 8 ? '#10B981' : '#F59E0B') : '#E5E7EB', transition:'all 0.2s' }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={loading} style={{
                            padding:'11px', borderRadius:12, border:'none', fontFamily:'inherit',
                            background: role === 'police' ? 'linear-gradient(135deg,#064E3B,#059669)' : 'linear-gradient(135deg,#1E3A8A,#2563EB)',
                            color:'#fff', fontWeight:700, fontSize:'0.9375rem', cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.75 : 1,
                            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                            boxShadow:'0 4px 14px rgba(30,58,138,0.25)'
                        }}>
                            {loading ? <><span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Creating...</> : <><FaCheckCircle size={14} /> Create Account</>}
                        </button>
                    </form>

                    <p style={{ textAlign:'center', marginTop:20, fontSize:'0.875rem', color:'#6B7280' }}>
                        Already have an account? <Link to="/login" style={{ color:'#1E3A8A', fontWeight:700, textDecoration:'none' }}>Sign in</Link>
                    </p>
                </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
