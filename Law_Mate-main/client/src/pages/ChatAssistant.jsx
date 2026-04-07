import { useState, useEffect, useRef, useCallback } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import {
    FaPaperPlane, FaRobot, FaUser, FaPlus, FaTrash,
    FaBalanceScale, FaHistory, FaBookmark, FaCheck,
    FaBars, FaChevronDown
} from 'react-icons/fa';
import API_URL from '../config';

/* ── Law options ── */
const LAW_OPTIONS = [
    { value: 'all',    label: 'All Laws',    full: 'Search All Laws' },
    { value: 'ipc',    label: 'IPC',         full: 'Indian Penal Code' },
    { value: 'crpc',   label: 'CrPC',        full: 'Code of Criminal Procedure' },
    { value: 'cpc',    label: 'CPC',         full: 'Code of Civil Procedure' },
    { value: 'iea',    label: 'IEA',         full: 'Indian Evidence Act' },
    { value: 'mv_act', label: 'Motor Vehicle',full: 'Motor Vehicles Act' },
    { value: 'hma',    label: 'HMA',         full: 'Hindu Marriage Act' },
    { value: 'ida',    label: 'IDA',         full: 'Industrial Disputes Act' },
    { value: 'nia',    label: 'NIA',         full: 'Negotiable Instruments Act' },
];

/* ── Scenario-based suggestions ── */
const SUGGESTIONS = [
    { text: 'Someone beat me and I got injured',        law: 'ipc'    },
    { text: 'My husband is harassing me for dowry',     law: 'ipc'    },
    { text: 'How do I file an FIR?',                    law: 'crpc'   },
    { text: 'I met with a road accident, what are my rights?', law: 'mv_act' },
    { text: 'What is bail and how do I get it?',        law: 'crpc'   },
    { text: 'Someone cheated me online and took money', law: 'ipc'    },
    { text: 'My landlord is not returning my deposit',  law: 'cpc'    },
    { text: 'What happens if I get arrested?',          law: 'crpc'   },
];

const getUser = () => {
    try { return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')); }
    catch { return null; }
};

export default function ChatAssistant() {
    const [messages,       setMessages]       = useState([]);
    const [input,          setInput]          = useState('');
    const [law,            setLaw]            = useState('all');
    const [loading,        setLoading]        = useState(false);
    const [error,          setError]          = useState(null);
    const [sessionId,      setSessionId]      = useState(null);
    const [sessions,       setSessions]       = useState([]);
    const [sidebarOpen,    setSidebarOpen]    = useState(true);
    const [loadingSess,    setLoadingSess]    = useState(false);
    const [savedIdx,       setSavedIdx]       = useState(null);
    const [showLawPicker,  setShowLawPicker]  = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef       = useRef(null);
    const lawPickerRef   = useRef(null);

    useEffect(() => { fetchSessions(); }, []);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

    /* Close law picker on outside click */
    useEffect(() => {
        const handler = (e) => { if (lawPickerRef.current && !lawPickerRef.current.contains(e.target)) setShowLawPicker(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Sessions ── */
    const fetchSessions = async () => {
        setLoadingSess(true);
        try {
            const user = getUser();
            const res = await fetch(`${API_URL}/api/chat/sessions`, { headers: { Authorization: `Bearer ${user?.token}` } });
            const data = await res.json();
            setSessions(Array.isArray(data) ? data : []);
        } catch { /* silent */ }
        finally { setLoadingSess(false); }
    };

    const loadSession = async (sid) => {
        try {
            const user = getUser();
            const res  = await fetch(`${API_URL}/api/chat/sessions/${sid}`, { headers: { Authorization: `Bearer ${user?.token}` } });
            const data = await res.json();
            setSessionId(data.sessionId);
            setLaw(data.law || 'all');
            setMessages((data.messages || []).map(m => ({ ...m, sources: [], mode: 'loaded' })));
            setError(null);
        } catch { setError('Failed to load session.'); }
    };

    const startNewChat = () => { setSessionId(null); setMessages([]); setError(null); setLaw('all'); inputRef.current?.focus(); };

    const deleteSession = async (sid, e) => {
        e.stopPropagation();
        try {
            const user = getUser();
            await fetch(`${API_URL}/api/chat/sessions/${sid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user?.token}` } });
            setSessions(p => p.filter(s => s.sessionId !== sid));
            if (sessionId === sid) startNewChat();
        } catch { setError('Failed to delete session.'); }
    };

    /* ── Send message ── */
    const sendMessage = useCallback(async (text, overrideLaw) => {
        const msg = (text || input).trim();
        if (!msg || loading) return;
        const useLaw = overrideLaw || law;

        setInput('');
        setError(null);
        setMessages(p => [...p, { role: 'user', content: msg }]);
        setLoading(true);

        try {
            const user = getUser();
            if (!user?.token) throw new Error('Please log in first.');

            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ message: msg, law: useLaw, sessionId })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || `Server error ${res.status}`);
            }

            const data = await res.json();
            setMessages(p => [...p, {
                role: 'assistant',
                content: data.reply,
                sources: data.sources || [],
                mode: data.mode
            }]);
            setSessionId(data.sessionId);
            fetchSessions();
        } catch (err) {
            setError(err.message || 'Could not reach the server.');
            setMessages(p => p.slice(0, -1));
        } finally {
            setLoading(false);
        }
    }, [input, law, loading, sessionId]);

    const handleSubmit = (e) => { e?.preventDefault(); sendMessage(); };

    /* ── Suggestion click — sets law AND sends ── */
    const handleSuggestion = (s) => {
        setLaw(s.law);
        sendMessage(s.text, s.law);
    };

    /* ── Save message ── */
    const saveMsg = async (content, idx) => {
        try {
            const user = getUser();
            const res = await fetch(`${API_URL}/api/queries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
                body: JSON.stringify({ query: content.substring(0, 200), law, title: content.substring(0, 60) })
            });
            if (res.ok) { setSavedIdx(idx); setTimeout(() => setSavedIdx(null), 2500); }
        } catch { /* silent */ }
    };

    /* ── Render message text (bold + line breaks) ── */
    const renderText = (text) =>
        text.split('\n').map((line, i, arr) => (
            <span key={i}>
                {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
                {i < arr.length - 1 && <br />}
            </span>
        ));

    const activeLaw = LAW_OPTIONS.find(o => o.value === law);

    /* ────────────────────────────────────────────────────────── */
    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 60px)', fontFamily: "'Inter', system-ui, sans-serif", background: '#F9FAFB' }}>

            {/* ══ Sidebar ══════════════════════════════════════════ */}
            {sidebarOpen && (
                <aside style={{ width: 240, minWidth: 240, background: '#fff', borderRight: '1px solid #E8ECF0', display: 'flex', flexDirection: 'column' }}>
                    {/* Sidebar header */}
                    <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #F1F3F6' }}>
                        <button onClick={startNewChat} style={{
                            width: '100%', padding: '8px 12px', borderRadius: 9, border: '1.5px solid #1E3A8A',
                            background: '#1E3A8A', color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit'
                        }}>
                            <FaPlus size={11} /> New Conversation
                        </button>
                    </div>

                    {/* Session list */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '4px 6px 8px' }}>
                            Recent Chats
                        </div>
                        {loadingSess ? (
                            <div style={{ textAlign: 'center', paddingTop: 20 }}><Spinner animation="border" style={{ width: 18, height: 18, borderWidth: 2 }} /></div>
                        ) : sessions.length === 0 ? (
                            <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', paddingTop: 20 }}>No conversations yet</div>
                        ) : sessions.map(s => (
                            <div key={s.sessionId}
                                onClick={() => loadSession(s.sessionId)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 8px',
                                    borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                                    background: sessionId === s.sessionId ? '#EFF6FF' : 'transparent',
                                    border: sessionId === s.sessionId ? '1px solid #BFDBFE' : '1px solid transparent'
                                }}
                                onMouseEnter={e => { if (sessionId !== s.sessionId) e.currentTarget.style.background = '#F9FAFB'; }}
                                onMouseLeave={e => { if (sessionId !== s.sessionId) e.currentTarget.style.background = 'transparent'; }}>
                                <FaBalanceScale size={11} color={sessionId === s.sessionId ? '#2563EB' : '#9CA3AF'} style={{ flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1A2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.title || 'Conversation'}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>
                                        {(s.law || 'all').toUpperCase()} · {new Date(s.updatedAt).toLocaleDateString('en-IN')}
                                    </div>
                                </div>
                                <button onClick={(e) => deleteSession(s.sessionId, e)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', padding: 3, borderRadius: 4, flexShrink: 0 }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#D1D5DB'}>
                                    <FaTrash size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>
            )}

            {/* ══ Main chat area ═══════════════════════════════════ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                {/* ── Top bar ── */}
                <div style={{ height: 52, background: '#fff', borderBottom: '1px solid #E8ECF0', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
                    <button onClick={() => setSidebarOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 6, borderRadius: 7, display: 'flex' }}>
                        <FaBars size={16} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaRobot color="#fff" size={14} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2332', lineHeight: 1 }}>LawMate AI</div>
                            <div style={{ fontSize: 10, color: '#10B981', fontWeight: 600 }}>● Online</div>
                        </div>
                    </div>

                    {/* ── Law filter selector ── */}
                    <div ref={lawPickerRef} style={{ marginLeft: 'auto', position: 'relative' }}>
                        <button onClick={() => setShowLawPicker(v => !v)} style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                            borderRadius: 8, border: '1.5px solid #E8ECF0', background: '#F9FAFB',
                            cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'inherit'
                        }}>
                            <FaBalanceScale size={11} color="#2563EB" />
                            {activeLaw?.label}
                            <FaChevronDown size={9} color="#9CA3AF" />
                        </button>

                        {showLawPicker && (
                            <div style={{
                                position: 'absolute', top: '110%', right: 0, zIndex: 100,
                                background: '#fff', border: '1px solid #E8ECF0', borderRadius: 12,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: 6, minWidth: 220
                            }}>
                                {LAW_OPTIONS.map(opt => (
                                    <button key={opt.value} onClick={() => { setLaw(opt.value); setShowLawPicker(false); }} style={{
                                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                        padding: '8px 12px', border: 'none', borderRadius: 8,
                                        background: law === opt.value ? '#EFF6FF' : 'transparent',
                                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
                                    }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: law === opt.value ? '#2563EB' : '#E5E7EB', flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: law === opt.value ? '#2563EB' : '#1A2332' }}>{opt.label}</div>
                                            <div style={{ fontSize: 10, color: '#9CA3AF' }}>{opt.full}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Messages ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px', background: '#F9FAFB' }}>

                    {/* Welcome screen */}
                    {messages.length === 0 && (
                        <div style={{ maxWidth: 560, margin: '32px auto', textAlign: 'center' }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <FaRobot color="#fff" size={26} />
                            </div>
                            <h5 style={{ fontSize: 18, fontWeight: 800, color: '#1A2332', marginBottom: 6 }}>LawMate Legal Assistant</h5>
                            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
                                Describe your legal situation in plain language. I'll find the relevant laws and guide you.
                            </p>

                            {/* Suggestion chips */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                {SUGGESTIONS.map((s, i) => (
                                    <button key={i} onClick={() => handleSuggestion(s)} style={{
                                        padding: '8px 14px', borderRadius: 99,
                                        border: '1.5px solid #E8ECF0', background: '#fff',
                                        fontSize: 12, fontWeight: 500, color: '#374151',
                                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor='#2563EB'; e.currentTarget.style.color='#2563EB'; e.currentTarget.style.background='#EFF6FF'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor='#E8ECF0'; e.currentTarget.style.color='#374151'; e.currentTarget.style.background='#fff'; }}>
                                        {s.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message bubbles */}
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>

                                {/* AI avatar */}
                                {msg.role === 'assistant' && (
                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                                        <FaRobot color="#fff" size={13} />
                                    </div>
                                )}

                                {/* Bubble */}
                                <div style={{
                                    maxWidth: '72%',
                                    background: msg.role === 'user' ? '#1E3A8A' : '#fff',
                                    color: msg.role === 'user' ? '#fff' : '#1A2332',
                                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                                    padding: '11px 15px',
                                    boxShadow: msg.role === 'user' ? '0 2px 8px rgba(30,58,138,0.2)' : '0 1px 4px rgba(0,0,0,0.07)',
                                    fontSize: 13.5, lineHeight: 1.6,
                                    border: msg.role === 'assistant' ? '1px solid #E8ECF0' : 'none'
                                }}>
                                    {renderText(msg.content)}

                                    {/* Save button on AI messages */}
                                    {msg.role === 'assistant' && (
                                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <button onClick={() => saveMsg(msg.content, idx)} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                padding: '3px 9px', borderRadius: 6, border: 'none',
                                                background: savedIdx === idx ? '#ECFDF5' : '#F3F4F6',
                                                color: savedIdx === idx ? '#059669' : '#6B7280',
                                                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                                            }}>
                                                {savedIdx === idx ? <><FaCheck size={9} />Saved</> : <><FaBookmark size={9} />Save</>}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* User avatar */}
                                {msg.role === 'user' && (
                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                                        <FaUser color="#fff" size={13} />
                                    </div>
                                )}
                            </div>

                            {/* Sources under AI messages */}
                            {msg.role === 'assistant' && msg.sources?.length > 0 && (
                                <div style={{ marginLeft: 40, marginTop: 6 }}>
                                    <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                                        Sources from database
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                        {msg.sources.map((s, i) => (
                                            <span key={i} style={{
                                                display: 'inline-block', padding: '2px 9px', borderRadius: 5,
                                                background: '#EFF6FF', color: '#2563EB', fontSize: 11,
                                                fontWeight: 600, border: '1px solid #BFDBFE'
                                            }}>
                                                {(s.law || law).toUpperCase()} §{s.section}
                                                {s.title && <span style={{ fontWeight: 400, color: '#6B7280' }}> — {s.title.substring(0, 30)}</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1E3A8A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaRobot color="#fff" size={13} />
                            </div>
                            <div style={{ background: '#fff', borderRadius: '4px 18px 18px 18px', padding: '12px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E8ECF0', display: 'flex', gap: 4, alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: '#6B7280', marginRight: 4 }}>Searching laws...</span>
                                {[0,1,2].map(i => (
                                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#1E3A8A', animation: 'lm-bounce 1s infinite', animationDelay: `${i*0.18}s` }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)} style={{ fontSize: 13, borderRadius: 10, border: 'none', margin: '0 0 12px' }}>
                            {error}
                        </Alert>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* ── Input bar ── */}
                <div style={{ background: '#fff', borderTop: '1px solid #E8ECF0', padding: '12px 16px' }}>
                    {/* Active law pill */}
                    {law !== 'all' && (
                        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, color: '#6B7280' }}>Searching in:</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 9px', borderRadius: 99, border: '1px solid #BFDBFE' }}>
                                {activeLaw?.full}
                            </span>
                            <button onClick={() => setLaw('all')} style={{ fontSize: 10, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                                ✕ clear
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            disabled={loading}
                            placeholder="Describe your situation or ask a legal question…"
                            style={{
                                flex: 1, padding: '11px 16px', borderRadius: 12,
                                border: '1.5px solid #E8ECF0', fontSize: 13.5,
                                outline: 'none', fontFamily: 'inherit', background: '#F9FAFB',
                                color: '#1A2332'
                            }}
                            onFocus={e => e.target.style.borderColor = '#2563EB'}
                            onBlur={e  => e.target.style.borderColor = '#E8ECF0'}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                        />
                        <button type="submit" disabled={loading || !input.trim()} style={{
                            width: 44, height: 44, borderRadius: '50%', border: 'none',
                            background: loading || !input.trim() ? '#E5E7EB' : '#1E3A8A',
                            color: '#fff', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            transition: 'all 0.15s', boxShadow: input.trim() ? '0 2px 8px rgba(30,58,138,0.3)' : 'none'
                        }}>
                            {loading ? <Spinner animation="border" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <FaPaperPlane size={15} />}
                        </button>
                    </form>
                    <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 6 }}>
                        LawMate covers IPC, CrPC, CPC, IEA, MVA, HMA, IDA & NIA
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes lm-bounce {
                    0%, 80%, 100% { transform: scale(0.55); opacity: 0.45; }
                    40%           { transform: scale(1);    opacity: 1; }
                }
            `}</style>
        </div>
    );
}
