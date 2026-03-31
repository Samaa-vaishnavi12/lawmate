import { useState } from 'react';
import { FaUser, FaEnvelope, FaShieldAlt, FaEdit, FaCheck, FaTimes, FaUserShield } from 'react-icons/fa';
import API_URL from '../config';

export default function Profile() {
    const getUser = () => JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const [user, setUser]       = useState(getUser);
    const [editing, setEditing] = useState(false);
    const [form, setForm]       = useState({ name: user.name || '', email: user.email || '' });
    const [msg, setMsg]         = useState(null);
    const [err, setErr]         = useState(null);
    const [loading, setLoading] = useState(false);

    const initials = user.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'U';
    const roleColor = user.role === 'police' ? '#059669' : user.isAdmin ? '#7C3AED' : '#1E3A8A';
    const roleLabel = user.isAdmin ? 'Administrator' : user.role === 'police' ? 'Police Officer' : 'Public Citizen';

    const save = async (e) => {
        e.preventDefault();
        setMsg(null); setErr(null); setLoading(true);
        try {
            const res  = await fetch(`${API_URL}/api/users/profile`, {
                method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${user.token}` },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data); setEditing(false); setMsg('Profile updated successfully.');
                localStorage.getItem('user') ? localStorage.setItem('user', JSON.stringify(data)) : sessionStorage.setItem('user', JSON.stringify(data));
                setTimeout(() => setMsg(null), 3000);
            } else setErr(data.message || 'Update failed');
        } catch { setErr('Server error.'); }
        finally { setLoading(false); }
    };

    const Field = ({ icon: Icon, label, name, type='text', value, readOnly }) => (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <label style={{ fontSize:'0.75rem', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.5px', display:'flex', alignItems:'center', gap:6 }}>
                <Icon size={11} /> {label}
            </label>
            {readOnly || !editing ? (
                <div style={{ padding:'10px 14px', borderRadius:12, background:'#F9FAFB', border:'1.5px solid #E5E7EB', fontSize:'0.875rem', color:readOnly?'#9CA3AF':'#111827', fontWeight: readOnly ? 400 : 500 }}>
                    {value}
                </div>
            ) : (
                <input type={type} value={form[name] || ''} onChange={e => setForm(p=>({...p,[name]:e.target.value}))}
                    style={{ padding:'10px 14px', borderRadius:12, border:'1.5px solid #3B82F6', fontSize:'0.875rem', outline:'none', background:'#fff', fontFamily:'inherit', boxShadow:'0 0 0 3px rgba(59,130,246,0.1)' }} />
            )}
        </div>
    );

    return (
        <div style={{ maxWidth:560, margin:'40px auto', padding:'0 16px', fontFamily:'Inter,system-ui,sans-serif' }}>

            {/* Avatar card */}
            <div style={{ background:'#fff', borderRadius:20, padding:'32px 28px', boxShadow:'0 4px 20px rgba(0,0,0,0.07)', marginBottom:16, textAlign:'center', border:'1px solid #E5E7EB' }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background:`linear-gradient(135deg, ${roleColor}, #3B82F6)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.75rem', fontWeight:800, color:'#fff', margin:'0 auto 16px' }}>
                    {initials}
                </div>
                <h3 style={{ fontSize:'1.25rem', fontWeight:800, color:'#111827', marginBottom:6 }}>{user.name}</h3>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 14px', borderRadius:99, background: roleColor+'15', color: roleColor, fontSize:'0.75rem', fontWeight:700 }}>
                    <FaUserShield size={11} /> {roleLabel}
                </div>
                <div style={{ marginTop:12, fontSize:'0.8rem', color:'#9CA3AF' }}>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { year:'numeric', month:'long' })}</div>
            </div>

            {/* Form card */}
            <div style={{ background:'#fff', borderRadius:20, padding:'28px', boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1px solid #E5E7EB' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                    <h5 style={{ fontSize:'0.9375rem', fontWeight:700, color:'#111827' }}>Account Details</h5>
                    {!editing ? (
                        <button onClick={() => setEditing(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:99, border:'1.5px solid #E5E7EB', background:'#fff', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, color:'#374151' }}>
                            <FaEdit size={12} /> Edit
                        </button>
                    ) : (
                        <button onClick={() => { setEditing(false); setErr(null); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:99, border:'1.5px solid #E5E7EB', background:'#fff', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, color:'#EF4444' }}>
                            <FaTimes size={12} /> Cancel
                        </button>
                    )}
                </div>

                {msg && <div style={{ background:'#ECFDF5', border:'1px solid #A7F3D0', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:'0.8125rem', color:'#059669', display:'flex', alignItems:'center', gap:6 }}><FaCheck size={11} /> {msg}</div>}
                {err && <div style={{ background:'#FEF2F2', border:'1px solid #FCA5A5', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:'0.8125rem', color:'#EF4444' }}>⚠ {err}</div>}

                <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <Field icon={FaUser}     label="Full Name"     name="name"  value={editing ? form.name  : user.name}  />
                    <Field icon={FaEnvelope} label="Email Address" name="email" value={editing ? form.email : user.email} type="email" />
                    <Field icon={FaShieldAlt} label="Role"   value={roleLabel}   readOnly />
                    <Field icon={FaUser}     label="User ID" value={user._id}    readOnly />

                    {editing && (
                        <button type="submit" disabled={loading} style={{
                            marginTop:8, padding:'11px', borderRadius:12, border:'none', fontFamily:'inherit',
                            background:'linear-gradient(135deg,#1E3A8A,#2563EB)', color:'#fff',
                            fontWeight:700, fontSize:'0.9rem', cursor: loading?'not-allowed':'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                            boxShadow:'0 4px 14px rgba(30,58,138,0.25)', opacity: loading?0.75:1
                        }}>
                            {loading ? 'Saving...' : <><FaCheck size={13} /> Save Changes</>}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
