import { useState, useEffect } from 'react';
import { Spinner, Modal, Form, Row, Col, Button } from 'react-bootstrap';
import {
    FaRobot, FaFileContract, FaSearch, FaHistory, FaCheckCircle,
    FaBalanceScale, FaTrash, FaUsers, FaPen, FaBookmark,
    FaBell, FaMapMarkerAlt, FaCalendarAlt, FaGavel, FaDirections,
    FaPlus, FaTimes, FaEdit, FaBuilding, FaRoute, FaPhoneAlt,
    FaClock, FaCheck, FaAngleRight
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const getUser = () => { try { return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')); } catch { return null; } };

const COURT_GUIDANCE = [
    { step: 1, icon: '📋', title: 'Prepare Documents', desc: 'FIR copy, Aadhaar/PAN, case number, court notices, 2 passport photos.' },
    { step: 2, icon: '⏰', title: 'Arrive Early', desc: 'Arrive 30 min before hearing time. Courts open at 10:30 AM.' },
    { step: 3, icon: '🏛️', title: 'Find Your Courtroom', desc: 'Check the cause list board at the entrance by case number.' },
    { step: 4, icon: '👔', title: 'Dress Formally', desc: 'Formal attire required. Switch phone to silent inside.' },
    { step: 5, icon: '⚖️', title: 'Meet Your Lawyer', desc: 'Brief your advocate 15 minutes before the hearing.' },
    { step: 6, icon: '📞', title: 'Emergency Contacts', desc: 'DLSA: 1800-110-2031 | Legal Helpline: 15100' },
];

const REMINDERS_KEY = 'lawmate_reminders';
const loadR = () => { try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]'); } catch { return []; } };
const saveR = (r) => localStorage.setItem(REMINDERS_KEY, JSON.stringify(r));

const S = {
    page:      { background: '#F4F6FA', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" },
    wrap:      { maxWidth: 1280, margin: '0 auto', padding: '28px 24px' },
    card:      { background: '#fff', borderRadius: 14, border: '1px solid #E8ECF0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
    cardHead:  { padding: '14px 18px', borderBottom: '1px solid #F1F3F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: 15, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 7 },
    pill:      (active, col) => ({ padding: '6px 16px', borderRadius: 99, border: `1.5px solid ${active ? col : '#E8ECF0'}`, background: active ? col + '12' : '#fff', color: active ? col : '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }),
    iconDot:   (col, bg) => ({ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: col, fontSize: 16, flexShrink: 0 }),
    row:       { padding: '13px 18px', borderBottom: '1px solid #F1F3F6', cursor: 'pointer', transition: 'background .12s', display: 'flex', alignItems: 'center', gap: 12 },
    tag:       (col) => ({ display: 'inline-block', padding: '2px 9px', borderRadius: 5, background: col + '15', color: col, fontSize: 11, fontWeight: 700, letterSpacing: '0.2px' }),
    btn:       (col, outline) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${outline ? col : col}`, background: outline ? 'transparent' : col, color: outline ? col : '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit', whiteSpace: 'nowrap' }),
    statCard:  (col) => ({ background: '#fff', borderRadius: 14, padding: '20px 18px', border: '1px solid #E8ECF0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', borderLeft: `3px solid ${col}`, transition: 'box-shadow .15s' }),
};

export default function Dashboard() {
    const [stats, setStats]           = useState(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [queries, setQueries]       = useState([]);
    const [qLoading, setQLoading]     = useState(true);
    const [delId, setDelId]           = useState(null);
    const [showDel, setShowDel]       = useState(false);
    const [saveState, setSaveState]   = useState('idle'); // idle | saving | saved

    const [reminders, setReminders]   = useState(loadR);
    const [showRem, setShowRem]       = useState(false);
    const [remForm, setRemForm]       = useState({ title:'', date:'', time:'', caseNo:'', court:'', notes:'' });
    const [editIdx, setEditIdx]       = useState(null);

    const [gpsLoad, setGpsLoad]       = useState(false);
    const [gpsErr, setGpsErr]         = useState('');
    const [nearby, setNearby]         = useState('court');
    const [showGuide, setShowGuide]   = useState(false);

    const navigate = useNavigate();
    const user = getUser();
    const role = user?.role?.toLowerCase() || 'public';

    useEffect(() => {
        fetch(`${API_URL}/api/stats/dashboard`, { headers: { Authorization: `Bearer ${user?.token}` } })
            .then(r => r.json()).then(d => { setStats(d); setLoading(false); })
            .catch(() => { setError('Could not connect'); setLoading(false); });

        fetch(`${API_URL}/api/queries`, { headers: { Authorization: `Bearer ${user?.token}` } })
            .then(r => r.json()).then(d => { setQueries(d.queries || []); setQLoading(false); })
            .catch(() => setQLoading(false));
    }, []);

    // ── Save current session to searches ────────────────────────────────────
    const handleSave = async () => {
        if (saveState !== 'idle') return;
        setSaveState('saving');
        try {
            const res = await fetch(`${API_URL}/api/queries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
                body: JSON.stringify({ query: `Dashboard session – ${user?.name}`, law: 'all', title: `Dashboard – ${new Date().toLocaleDateString('en-IN')}` })
            });
            if (res.ok) {
                const data = await res.json();
                setQueries(p => [data, ...p]);
                setStats(p => ({ ...p, savedQueries: (p?.savedQueries || 0) + 1 }));
                setSaveState('saved');
                setTimeout(() => setSaveState('idle'), 2500);
            } else setSaveState('idle');
        } catch { setSaveState('idle'); }
    };

    // ── Reminders ────────────────────────────────────────────────────────────
    const openAdd  = () => { setRemForm({ title:'', date:'', time:'', caseNo:'', court:'', notes:'' }); setEditIdx(null); setShowRem(true); };
    const openEdit = (i) => { setRemForm({ ...reminders[i] }); setEditIdx(i); setShowRem(true); };
    const saveRem  = () => {
        if (!remForm.title || !remForm.date) return;
        const next = [...reminders];
        if (editIdx !== null) next[editIdx] = remForm; else next.push({ ...remForm, id: Date.now() });
        next.sort((a,b) => new Date(a.date+'T'+(a.time||'00:00')) - new Date(b.date+'T'+(b.time||'00:00')));
        setReminders(next); saveR(next); setShowRem(false);
    };
    const delRem = (i) => { const n = reminders.filter((_,j)=>j!==i); setReminders(n); saveR(n); };
    const isToday = (r) => new Date(r.date).toDateString() === new Date().toDateString();
    const upcoming = reminders.filter(r => new Date(r.date+'T'+(r.time||'23:59')) >= new Date());

    // ── GPS ──────────────────────────────────────────────────────────────────
    const findNearby = () => {
        setGpsLoad(true); setGpsErr('');
        if (!navigator.geolocation) { setGpsErr('Geolocation not supported.'); setGpsLoad(false); return; }
        navigator.geolocation.getCurrentPosition(
            ({ coords: { latitude: lat, longitude: lng } }) => {
                const q = nearby === 'court' ? 'court+near+me' : 'police+station+near+me';
                window.open(`https://www.google.com/maps/search/${q}/@${lat},${lng},14z`, '_blank');
                setGpsLoad(false);
            },
            () => { setGpsErr('Location access denied. Enable GPS and try again.'); setGpsLoad(false); }
        );
    };

    // ── Delete query ─────────────────────────────────────────────────────────
    const confirmDel = async () => {
        const res = await fetch(`${API_URL}/api/queries/${delId}`, { method:'DELETE', headers:{ Authorization:`Bearer ${user?.token}` } });
        if (res.ok) { setQueries(p => p.filter(q => q._id !== delId)); setStats(p => ({ ...p, savedQueries: Math.max(0,(p?.savedQueries||0)-1) })); }
        setShowDel(false); setDelId(null);
    };

    if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12, color:'#6B7280' }}><Spinner animation="border" style={{ width:28, height:28, borderWidth:2, color:'#1E3A8A' }} /><span style={{ fontSize:13 }}>Loading dashboard…</span></div>;
    if (error)   return <div style={{ padding:32, color:'#EF4444', fontSize:14 }}>⚠ {error}</div>;

    const todayCount = reminders.filter(isToday).length;

    const STATS = [
        { label: 'Total Searches',       val: stats?.totalSearches,    icon: <FaSearch />,      col: '#2563EB', bg: '#EFF6FF' },
        { label: 'Docs Analysed',         val: stats?.totalAnalyzed,    icon: <FaBalanceScale />, col: '#7C3AED', bg: '#F5F3FF' },
        { label: 'Saved Searches',        val: stats?.savedQueries,     icon: <FaBookmark />,    col: '#D97706', bg: '#FFFBEB' },
        ...(role!=='public' ? [
            { label: 'FIR Drafts',        val: stats?.documentsDrafted, icon: <FaFileContract />,col: '#059669', bg: '#ECFDF5' },
            { label: 'Filed FIRs',        val: stats?.totalFiledDocs,   icon: <FaCheckCircle />, col: '#0891B2', bg: '#ECFEFF' },
        ] : []),
        ...(stats?.global ? [{ label:'Total Users', val:stats?.totalUsers, icon:<FaUsers />, col:'#6B7280', bg:'#F9FAFB' }] : []),
    ];

    return (
        <div style={S.page}>
            <div style={S.wrap}>

                {/* ── Page header ── */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:24 }}>
                    <div>
                        <div style={{ fontSize:24, fontWeight:800, color:'#0F172A', letterSpacing:'-0.4px' }}>
                            {stats?.global ? 'Platform Overview' : `Good ${new Date().getHours()<12?'morning':'afternoon'}, ${user?.name?.split(' ')[0]}`}
                        </div>
                        <div style={{ fontSize:14, color:'#6B7280', marginTop:4, display:'flex', alignItems:'center', gap:8 }}>
                            {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                            {todayCount > 0 && <span style={{ background:'#FEF2F2', color:'#EF4444', fontSize:12, fontWeight:700, padding:'3px 10px', borderRadius:99, border:'1px solid #FCA5A5' }}>🔔 {todayCount} hearing today</span>}
                        </div>
                    </div>

                    {/* Action bar */}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                        <button style={S.btn('#2563EB', true)} onClick={() => navigate('/chat')}><FaRobot size={11}/>AI Chat</button>
                        {role!=='public' && <button style={S.btn('#DC2626',true)} onClick={() => navigate('/generator')}><FaFileContract size={11}/>New FIR</button>}
                        <button style={S.btn('#059669',true)} onClick={openAdd}><FaBell size={11}/>Reminder</button>
                        <button style={S.btn('#7C3AED',true)} onClick={() => setShowGuide(true)}><FaGavel size={11}/>Court Guide</button>
                        <button
                            disabled={saveState==='saving'}
                            onClick={handleSave}
                            style={{
                                ...S.btn(saveState==='saved' ? '#059669' : '#1A2332', saveState!=='saved'),
                                background: saveState==='saved' ? '#059669' : saveState==='saving' ? '#E5E7EB' : 'transparent',
                                color: saveState==='saved' ? '#fff' : saveState==='saving' ? '#9CA3AF' : '#1A2332',
                                borderColor: saveState==='saved' ? '#059669' : saveState==='saving' ? '#E5E7EB' : '#D1D5DB',
                                minWidth:80
                            }}>
                            {saveState==='saving' ? <Spinner animation="border" style={{ width:12, height:12, borderWidth:2 }} /> : saveState==='saved' ? <><FaCheck size={11}/>Saved</> : <><FaBookmark size={11}/>Save</>}
                        </button>
                    </div>
                </div>

                {/* ── Stat row ── */}
                <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(STATS.length,6)}, 1fr)`, gap:12, marginBottom:24 }}>
                    {STATS.map((s,i) => (
                        <div key={i} style={S.statCard(s.col)}>
                            <div style={{ ...S.iconDot(s.col, s.bg), marginBottom:10 }}>{s.icon}</div>
                            <div style={{ fontSize:28, fontWeight:800, color:'#0F172A', lineHeight:1 }}>{s.val ?? 0}</div>
                            <div style={{ fontSize:13, color:'#374151', marginTop:6, fontWeight:600 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── 3-column grid ── */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, alignItems:'start' }}>

                    {/* ── Col 1: Reminders + Nearby ── */}
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                        {/* Reminders */}
                        <div style={S.card}>
                            <div style={S.cardHead}>
                                <span style={S.cardTitle}><FaBell size={13} color="#EF4444" /> Court Reminders
                                    {upcoming.length > 0 && <span style={{ background:'#FEF2F2', color:'#EF4444', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:99 }}>{upcoming.length}</span>}
                                </span>
                                <button onClick={openAdd} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:6, border:'1.5px solid #E8ECF0', background:'#F9FAFB', color:'#374151', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                                    <FaPlus size={9}/>Add
                                </button>
                            </div>
                            <div style={{ maxHeight:220, overflowY:'auto' }}>
                                {upcoming.length === 0 ? (
                                    <div style={{ padding:'28px 16px', textAlign:'center', color:'#6B7280', fontSize:14 }}>
                                        <FaCalendarAlt size={22} style={{ marginBottom:8, opacity:0.3, display:'block', margin:'0 auto 8px' }} />
                                        No upcoming hearings
                                    </div>
                                ) : upcoming.map((r,i) => (
                                    <div key={r.id||i} style={{ padding:'10px 14px', borderBottom:'1px solid #F6F8FA', background: isToday(r) ? '#FFFBEB' : '#fff' }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                                            <div style={{ flex:1, minWidth:0 }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                                                    {isToday(r) && <span style={{ background:'#EF4444', color:'#fff', fontSize:9, fontWeight:800, padding:'1px 5px', borderRadius:4 }}>TODAY</span>}
                                                    <span style={{ fontSize:14, fontWeight:700, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</span>
                                                </div>
                                                <div style={{ fontSize:12, color:'#6B7280', display:'flex', alignItems:'center', gap:6 }}>
                                                    <span><FaCalendarAlt size={9}/> {new Date(r.date).toLocaleDateString('en-IN')}</span>
                                                    {r.time && <span><FaClock size={9}/> {r.time}</span>}
                                                    {r.court && <span style={{ color:'#2563EB' }}><FaBuilding size={9}/> {r.court}</span>}
                                                </div>
                                            </div>
                                            <div style={{ display:'flex', gap:2, marginLeft:6, flexShrink:0 }}>
                                                <button onClick={()=>openEdit(reminders.indexOf(r))} style={{ background:'none', border:'none', color:'#2563EB', cursor:'pointer', padding:3, borderRadius:5 }}><FaEdit size={11}/></button>
                                                <button onClick={()=>delRem(reminders.indexOf(r))} style={{ background:'none', border:'none', color:'#EF4444', cursor:'pointer', padding:3, borderRadius:5 }}><FaTimes size={11}/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* GPS Nearby */}
                        <div style={S.card}>
                            <div style={S.cardHead}>
                                <span style={S.cardTitle}><FaMapMarkerAlt size={13} color="#059669" /> Find Nearby</span>
                            </div>
                            <div style={{ padding:14 }}>
                                <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                                    <button style={S.pill(nearby==='court','#2563EB')} onClick={()=>setNearby('court')}>🏛 Courts</button>
                                    <button style={S.pill(nearby==='police','#DC2626')} onClick={()=>setNearby('police')}>👮 Police</button>
                                </div>
                                {gpsErr && <div style={{ fontSize:11, color:'#EF4444', marginBottom:8, padding:'6px 10px', background:'#FEF2F2', borderRadius:7 }}>{gpsErr}</div>}
                                <button onClick={findNearby} disabled={gpsLoad} style={{ width:'100%', padding:'9px', borderRadius:10, border:'none', background:'#1E3A8A', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'inherit', opacity:gpsLoad?0.7:1 }}>
                                    {gpsLoad ? <Spinner animation="border" style={{ width:14, height:14, borderWidth:2 }}/> : <><FaDirections size={12}/>Open in Google Maps</>}
                                </button>
                                <div style={{ fontSize:12, color:'#6B7280', textAlign:'center', marginTop:6 }}>Uses your current GPS location</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Col 2: Saved Searches ── */}
                    <div style={{ ...S.card, overflow:'hidden' }}>
                        <div style={S.cardHead}>
                            <span style={S.cardTitle}><FaHistory size={13} color="#2563EB" /> Saved Searches</span>
                            {/* Small count badge — not a big dark box */}
                            <span style={{ fontSize:11, fontWeight:700, color:'#2563EB', background:'#EFF6FF', border:'1px solid #BFDBFE', padding:'2px 8px', borderRadius:99 }}>
                                {queries.length}
                            </span>
                        </div>
                        <div style={{ maxHeight:520, overflowY:'auto' }}>
                            {qLoading ? (
                                <div style={{ textAlign:'center', padding:24 }}><Spinner animation="border" style={{ width:20, height:20, borderWidth:2, color:'#2563EB' }}/></div>
                            ) : queries.length === 0 ? (
                                <div style={{ padding:'32px 16px', textAlign:'center', color:'#6B7280', fontSize:14 }}>
                                    <FaSearch size={26} style={{ display:'block', margin:'0 auto 8px', opacity:0.25 }}/>
                                    No saved searches yet
                                </div>
                            ) : queries.map(q => (
                                <div key={q._id}
                                    onClick={() => navigate(`/chat?q=${encodeURIComponent(q.query)}&law=${q.law}`)}
                                    style={S.row}
                                    onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                                    onMouseLeave={e => e.currentTarget.style.background='#fff'}>

                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:14, fontWeight:600, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{q.title}</div>
                                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                                            <span style={S.tag('#2563EB')}>{q.law?.toUpperCase()}</span>
                                            <span style={{ fontSize:12, color:'#6B7280' }}>{new Date(q.createdAt).toLocaleDateString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setDelId(q._id); setShowDel(true); }}
                                        style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer', padding:4, borderRadius:5, flexShrink:0 }}
                                        onMouseEnter={e => e.currentTarget.style.color='#EF4444'}
                                        onMouseLeave={e => e.currentTarget.style.color='#9CA3AF'}>
                                        <FaTrash size={11}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Col 3: Recent Activity ── */}
                    <div style={{ ...S.card, overflow:'hidden' }}>
                        <div style={S.cardHead}>
                            <span style={S.cardTitle}><FaRoute size={13} color="#059669" /> Recent Activity</span>
                        </div>
                        <div style={{ maxHeight:520, overflowY:'auto' }}>
                            {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((a,i) => (
                                <div key={i} style={{ ...S.row, cursor:'default' }}>
                                    <div style={{ ...S.iconDot('#059669','#ECFDF5'), width:30, height:30, borderRadius:8, fontSize:12, flexShrink:0 }}><FaFileContract size={11}/></div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>{a.action}</div>
                                        <div style={{ fontSize:13, color:'#374151', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.description}</div>
                                        <div style={{ fontSize:11, color:'#6B7280', marginTop:2 }}>{new Date(a.timestamp).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding:'32px 16px', textAlign:'center', color:'#6B7280', fontSize:14 }}>
                                    <FaHistory size={26} style={{ display:'block', margin:'0 auto 8px', opacity:0.25 }}/>
                                    No recent activity
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Add/Edit Reminder Modal ── */}
            <Modal show={showRem} onHide={() => setShowRem(false)} centered>
                <div style={{ borderRadius:16, overflow:'hidden', fontFamily:'Inter,system-ui,sans-serif' }}>
                    <div style={{ padding:'18px 20px', borderBottom:'1px solid #F1F3F6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontSize:15, fontWeight:700, color:'#1A2332', display:'flex', alignItems:'center', gap:8 }}><FaBell size={14} color="#EF4444"/> {editIdx!==null?'Edit Reminder':'New Court Reminder'}</div>
                        <button onClick={()=>setShowRem(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', padding:4 }}><FaTimes size={14}/></button>
                    </div>
                    <div style={{ padding:20 }}>
                        <Row className="g-3">
                            <Col xs={12}><label style={{ fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.4px',display:'block',marginBottom:5 }}>Hearing Title *</label>
                                <Form.Control placeholder="e.g. Civil Case Hearing" value={remForm.title} onChange={e=>setRemForm(p=>({...p,title:e.target.value}))} style={{ borderRadius:9,fontSize:13,borderColor:'#E8ECF0' }}/></Col>
                            <Col xs={6}><label style={{ fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.4px',display:'block',marginBottom:5 }}>Date *</label>
                                <Form.Control type="date" value={remForm.date} onChange={e=>setRemForm(p=>({...p,date:e.target.value}))} style={{ borderRadius:9,fontSize:13,borderColor:'#E8ECF0' }}/></Col>
                            <Col xs={6}><label style={{ fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.4px',display:'block',marginBottom:5 }}>Time</label>
                                <Form.Control type="time" value={remForm.time} onChange={e=>setRemForm(p=>({...p,time:e.target.value}))} style={{ borderRadius:9,fontSize:13,borderColor:'#E8ECF0' }}/></Col>
                            <Col xs={6}><label style={{ fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.4px',display:'block',marginBottom:5 }}>Case No.</label>
                                <Form.Control placeholder="CC/123/2024" value={remForm.caseNo} onChange={e=>setRemForm(p=>({...p,caseNo:e.target.value}))} style={{ borderRadius:9,fontSize:13,borderColor:'#E8ECF0' }}/></Col>
                            <Col xs={6}><label style={{ fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.4px',display:'block',marginBottom:5 }}>Court Name</label>
                                <Form.Control placeholder="Chennai District Court" value={remForm.court} onChange={e=>setRemForm(p=>({...p,court:e.target.value}))} style={{ borderRadius:9,fontSize:13,borderColor:'#E8ECF0' }}/></Col>
                            <Col xs={12}><label style={{ fontSize:11,fontWeight:700,color:'#6B7280',textTransform:'uppercase',letterSpacing:'0.4px',display:'block',marginBottom:5 }}>Notes</label>
                                <Form.Control as="textarea" rows={2} placeholder="Documents to carry, advocate name…" value={remForm.notes} onChange={e=>setRemForm(p=>({...p,notes:e.target.value}))} style={{ borderRadius:9,fontSize:13,borderColor:'#E8ECF0',resize:'none' }}/></Col>
                        </Row>
                    </div>
                    <div style={{ padding:'14px 20px', borderTop:'1px solid #F1F3F6', display:'flex', justifyContent:'flex-end', gap:8 }}>
                        <button onClick={()=>setShowRem(false)} style={{ padding:'8px 16px',borderRadius:8,border:'1.5px solid #E8ECF0',background:'#fff',color:'#374151',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>Cancel</button>
                        <button onClick={saveRem} disabled={!remForm.title||!remForm.date} style={{ padding:'8px 20px',borderRadius:8,border:'none',background:'#1E3A8A',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:(!remForm.title||!remForm.date)?0.5:1 }}>
                            {editIdx!==null?'Update':'Save Reminder'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── Court Guidance Modal ── */}
            <Modal show={showGuide} onHide={()=>setShowGuide(false)} centered size="lg">
                <div style={{ borderRadius:16, overflow:'hidden', fontFamily:'Inter,system-ui,sans-serif' }}>
                    <div style={{ padding:'18px 24px', background:'#1E3A8A', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontSize:15,fontWeight:700,color:'#fff',display:'flex',alignItems:'center',gap:8 }}><FaGavel color="#FCD34D"/> Court Visit Guide</div>
                        <button onClick={()=>setShowGuide(false)} style={{ background:'rgba(255,255,255,0.15)',border:'none',borderRadius:6,padding:'5px 7px',cursor:'pointer',color:'#fff' }}><FaTimes size={12}/></button>
                    </div>
                    <div style={{ padding:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        {COURT_GUIDANCE.map(g => (
                            <div key={g.step} style={{ background:'#F9FAFB', borderRadius:12, padding:'14px', border:'1px solid #E8ECF0', display:'flex', gap:12, alignItems:'flex-start' }}>
                                <span style={{ fontSize:22, flexShrink:0 }}>{g.icon}</span>
                                <div>
                                    <div style={{ fontSize:12,fontWeight:700,color:'#1A2332',marginBottom:3,display:'flex',alignItems:'center',gap:5 }}>
                                        <span style={{ background:'#EFF6FF',color:'#2563EB',fontSize:9,padding:'1px 6px',borderRadius:99,fontWeight:800 }}>STEP {g.step}</span>
                                        {g.title}
                                    </div>
                                    <div style={{ fontSize:11,color:'#6B7280',lineHeight:1.5 }}>{g.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ margin:'0 20px 20px', background:'#FFFBEB', border:'1px solid #FCD34D', borderRadius:10, padding:'12px 14px' }}>
                        <div style={{ fontSize:12,fontWeight:700,color:'#92400E',marginBottom:4,display:'flex',alignItems:'center',gap:5 }}><FaPhoneAlt size={11}/> Helplines</div>
                        <div style={{ fontSize:11,color:'#78716C',lineHeight:1.8 }}>
                            Legal Helpline: <strong>15100</strong> &nbsp;·&nbsp; DLSA Free Aid: <strong>1800-110-2031</strong> &nbsp;·&nbsp; Police: <strong>100</strong> &nbsp;·&nbsp; Women: <strong>1091</strong>
                        </div>
                    </div>
                    <div style={{ padding:'12px 20px',borderTop:'1px solid #F1F3F6',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                        <button onClick={findNearby} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:8,border:'1.5px solid #1E3A8A',background:'transparent',color:'#1E3A8A',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>
                            <FaMapMarkerAlt size={11}/>Find Nearest Court
                        </button>
                        <button onClick={()=>setShowGuide(false)} style={{ padding:'8px 18px',borderRadius:8,border:'none',background:'#F3F4F6',color:'#374151',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit' }}>Close</button>
                    </div>
                </div>
            </Modal>

            {/* ── Delete confirm ── */}
            <Modal show={showDel} onHide={()=>setShowDel(false)} centered size="sm">
                <div style={{ borderRadius:14, overflow:'hidden', padding:24, textAlign:'center', fontFamily:'Inter,system-ui,sans-serif' }}>
                    <div style={{ width:44,height:44,borderRadius:'50%',background:'#FEF2F2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}><FaTrash size={17} color="#EF4444"/></div>
                    <div style={{ fontSize:14,fontWeight:700,color:'#1A2332',marginBottom:6 }}>Delete Search?</div>
                    <div style={{ fontSize:12,color:'#6B7280',marginBottom:18 }}>This action cannot be undone.</div>
                    <div style={{ display:'flex',gap:8,justifyContent:'center' }}>
                        <button onClick={()=>setShowDel(false)} style={{ padding:'7px 18px',borderRadius:8,border:'1.5px solid #E8ECF0',background:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:'#374151' }}>Cancel</button>
                        <button onClick={confirmDel} style={{ padding:'7px 18px',borderRadius:8,border:'none',background:'#EF4444',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }}>Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
