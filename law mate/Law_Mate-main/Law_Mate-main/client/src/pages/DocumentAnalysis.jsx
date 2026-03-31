import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, Badge, ProgressBar, Spinner } from 'react-bootstrap';
import { FaFileAlt, FaBalanceScale, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaMagic, FaTimesCircle, FaFileUpload } from 'react-icons/fa';
import API_URL from '../config';

const DocumentAnalysis = () => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setText(''); // Clear text when file is selected
            setResults(null); // Clear previous results
            setError(null);
        } else {
            setError('Please select a valid PDF file.');
            e.target.value = null;
        }
    };

    const [rejection, setRejection] = useState(null);

    const handleAnalyze = async () => {
        if (!file && (!text.trim() || text.length < 20)) {
            setError('Please enter at least 20 characters of legal text or upload a PDF for analysis.');
            return;
        }

        setLoading(true);
        setError(null);
        setRejection(null);
        setResults(null);
        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            if (!user?.token) {
                setError('You must be logged in to analyze documents.');
                return;
            }

            const formData = new FormData();
            if (file) {
                formData.append('file', file);
            } else {
                formData.append('text', text);
            }

            const response = await fetch(`${API_URL}/api/analysis`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setResults(data);
                if (file) setText(data.text);
            } else if (data.isInvalidDocument) {
                // Show structured rejection — not a generic error
                setRejection({
                    message: data.message,
                    reason: data.reason,
                    hint: data.hint,
                    foundKeywords: data.foundKeywords || []
                });
            } else {
                setError(data.message || 'Analysis failed');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Connection failed. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreVariant = (score) => {
        if (score > 80) return 'success';
        if (score > 50) return 'warning';
        return 'danger';
    };

    const getInsightIcon = (type) => {
        switch (type) {
            case 'success':    return <FaCheckCircle    size={16} className="text-success flex-shrink-0" />;
            case 'warning':    return <FaExclamationTriangle size={16} className="text-warning flex-shrink-0" />;
            case 'info':       return <FaInfoCircle     size={16} className="text-info flex-shrink-0" />;
            case 'suggestion': return <FaMagic          size={16} className="text-primary flex-shrink-0" />;
            default:           return <FaInfoCircle     size={16} className="text-muted flex-shrink-0" />;
        }
    };

    // Map insight type to a valid Bootstrap badge variant
    const getBadgeVariant = (type) => {
        switch (type) {
            case 'success':    return 'success';
            case 'warning':    return 'warning';
            case 'info':       return 'info';
            case 'suggestion': return 'primary';   // 'suggestion' is not a Bootstrap variant
            default:           return 'secondary';
        }
    };

    return (
        <Container className="py-4">
            <div className="d-flex align-items-center mb-4">
                <FaBalanceScale className="text-primary me-3" style={{ fontSize: 28 }} />
                <h2 className="mb-0" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>Legal Document Analyzer</h2>
            </div>

            <Row className="g-4 flex-column">
                {/* Input Section - Now on Top */}
                <Col xs={12}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="py-3 border-bottom">
                            <h5 className="mb-0" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>Legal Narrative / Case Summary</h5>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column" style={{ minHeight: '450px' }}>
                            <div className="mb-4 bg-body-secondary p-3 rounded border text-center">
                                <Form.Group controlId="formFile" className="mb-0">
                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <Form.Label className="btn btn-outline-primary mb-0 fw-bold">
                                            Choose PDF File
                                            <Form.Control 
                                                type="file" 
                                                accept=".pdf" 
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                        </Form.Label>
                                        <div className="text-muted text-truncate" style={{ maxWidth: '350px', fontSize: '0.95rem' }}>
                                            {file ? (
                                                <span className="fw-bold">
                                                    📄 {file.name}
                                                    <Button 
                                                        variant="link" 
                                                        className="text-danger p-0 ms-2"
                                                        onClick={() => { setFile(null); setText(''); setResults(null); }}
                                                    >
                                                        (Clear)
                                                    </Button>
                                                </span>
                                            ) : (
                                                'Select a legal document to begin analysis'
                                            )}
                                        </div>
                                    </div>
                                </Form.Group>
                            </div>

                            <Form.Group className="mb-3 flex-grow-1 d-flex flex-column">
                                <Form.Label className="text-muted fw-bold text-uppercase d-flex justify-content-between" style={{ fontSize: '0.85rem', letterSpacing: '0.4px' }}>
                                    <span>{file ? 'Extracted Text from PDF' : 'Paste your draft FIR text or legal summary'}</span>
                                    {file && <Badge bg="info">Auto-Extracted</Badge>}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    className="flex-grow-1 font-monospace"
                                    placeholder="Or type/paste your legal narrative here for analysis..."
                                    value={text}
                                    onChange={(e) => {
                                        setText(e.target.value);
                                        setResults(null); // Clear results when user types
                                        if (file) setFile(null); // Switch back to text mode if user types
                                    }}
                                    style={{ fontSize: '1rem', minHeight: '280px', resize: 'vertical', whiteSpace: 'pre-wrap', color: '#0F172A', lineHeight: '1.7' }}
                                />
                            </Form.Group>
                            <div className="d-grid mt-2">
                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                    className="py-3 fw-bold shadow-sm"
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Analyzing with Legal Engine...
                                        </>
                                    ) : (
                                        <>Analyze Document <span className="ms-1 small opacity-75">→</span></>
                                    )}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Results Section - Now Below */}
                <Col xs={12}>

                    {/* ── State 1: Loading ── */}
                    {loading && (
                        <Card className="border-0 shadow-sm d-flex align-items-center justify-content-center py-5">
                            <Spinner animation="grow" variant="primary" />
                            <p className="mt-3 text-muted fw-bold" style={{ fontSize: '1rem' }}>Scanning Legal Databases...</p>
                        </Card>
                    )}

                    {/* ── State 2: Invalid / Non-Legal Document — ONLY show warning, nothing else ── */}
                    {!loading && rejection && (
                        <div
                            style={{
                                border: '2px solid #dc3545',
                                borderRadius: 16,
                                background: '#fff5f5',
                                padding: '32px 28px',
                                maxWidth: 600,
                                margin: '0 auto'
                            }}
                        >
                            {/* Icon + Title */}
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div style={{
                                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                                    background: 'rgba(220,53,69,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <FaTimesCircle size={26} color="#dc3545" />
                                </div>
                                <div>
                                    <h5 className="fw-bold text-danger mb-0" style={{ fontSize: '1.1rem' }}>⚠️ Not a Legal Document</h5>
                                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>This file cannot be analysed</div>
                                </div>
                            </div>

                            {/* Main message */}
                            <p className="text-dark mb-3" style={{ fontSize: 16 }}>{rejection.message}</p>

                            {/* Why */}
                            {rejection.reason && (
                                <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 14 }}>
                                    <FaExclamationTriangle className="me-2 text-warning" />
                                    <strong>Why rejected:</strong> {rejection.reason}
                                </div>
                            )}

                            {/* What to upload */}
                            {rejection.hint && (
                                <div style={{ background: '#e8f4fd', border: '1px solid #0dcaf0', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14 }}>
                                    <FaFileUpload className="me-2 text-info" />
                                    <strong>Please upload:</strong> {rejection.hint}
                                </div>
                            )}

                            {/* Try again button */}
                            <Button
                                variant="danger"
                                className="rounded-pill px-4"
                                onClick={() => { setRejection(null); setFile(null); setText(''); setError(null); }}
                            >
                                <FaTimesCircle className="me-2" /> Clear &amp; Try Again
                            </Button>
                        </div>
                    )}

                    {/* ── State 3: Empty (no action yet) ── */}
                    {!loading && !rejection && !results && !error && (
                        <div className="py-4" />
                    )}

                    {/* ── State 4: Valid results ── */}
                    {!loading && !rejection && results && (
                        <div className="d-flex flex-column gap-4">
                            <Row className="g-4">
                                <Col lg={8}>
                                    {/* Executive Summary */}
                                    {results.summary && (
                                        <Card className="shadow-sm border-0 border-start border-4 border-primary h-100">
                                            <Card.Header className="py-3 border-bottom-0">
                                                <h5 className="mb-0 text-primary d-flex align-items-center fw-bold" style={{ fontSize: '1.05rem' }}>
                                                    <FaInfoCircle className="me-2 text-primary" /> Case Summary
                                                </h5>
                                            </Card.Header>
                                            <Card.Body>
                                                <div className="bg-body-secondary p-4 rounded" style={{ lineHeight: '1.9', whiteSpace: 'pre-wrap', fontSize: '0.975rem', color: '#1E293B' }}>
                                                    {results.summary.split(/(\*\*.*?\*\*)/).map((part, i) => 
                                                        part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Col>
                                <Col lg={4}>
                                    {/* Consistency Score */}
                                    <Card className="shadow-sm border-0 overflow-hidden h-100">
                                        <Card.Header className="border-bottom-0 pt-3">
                                            <h6 className="text-muted fw-bold text-uppercase mb-0 text-center" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Legal Consistency</h6>
                                        </Card.Header>
                                        <Card.Body className="text-center d-flex flex-column justify-content-center py-4">
                                            <h2 className={`display-3 fw-bold text-${getScoreVariant(results.score)} mb-2`}>
                                                {results.score}%
                                            </h2>
                                            <div className="px-4">
                                                <ProgressBar 
                                                    now={results.score} 
                                                    variant={getScoreVariant(results.score)} 
                                                    className="mt-3" 
                                                    style={{ height: '12px' }}
                                                />
                                            </div>
                                            <p className="text-muted mt-4 px-3" style={{ fontSize: '0.9rem' }}>
                                                Alignment rating between narrative and legal sections.
                                            </p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Row className="g-4">
                                <Col lg={6}>
                                    {/* Analysis Insights */}
                                    <Card className="shadow-sm border-0 h-100">
                                        <Card.Header className="py-3 border-bottom">
                                            <h5 className="mb-0 fw-bold" style={{ fontSize: '1.05rem' }}><FaExclamationTriangle className="me-2 text-warning" /> Critical Insights</h5>
                                        </Card.Header>
                                        <ListGroup variant="flush">
                                            {results.insights.length > 0 ? (
                                                results.insights.map((insight, idx) => (
                                                    <ListGroup.Item key={idx} className="py-3 px-4 bg-transparent border-light">
                                                        <div className="d-flex align-items-start gap-3">
                                                            <div className="mt-1">{getInsightIcon(insight.type)}</div>
                                                            <div className="flex-grow-1">
                                                                <div className="fw-bold d-flex align-items-center flex-wrap gap-2 mb-1" style={{ fontSize: '0.975rem', color: '#0F172A' }}>
                                                                    {insight.title}
                                                                    <Badge bg={getBadgeVariant(insight.type)} style={{ fontSize: '0.7rem' }}>
                                                                        {insight.type.toUpperCase()}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                                                                    {insight.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))
                                            ) : (
                                                <ListGroup.Item className="text-center py-5 text-muted h4 opacity-50">
                                                    No anomalies detected.
                                                </ListGroup.Item>
                                            )}
                                        </ListGroup>
                                    </Card>
                                </Col>
                                <Col lg={6}>
                                    {/* Suggested Sections */}
                                    <Card className="shadow-sm border-0 h-100">
                                        <Card.Header className="py-3 border-bottom">
                                            <h5 className="mb-0 text-primary fw-bold" style={{ fontSize: '1.05rem' }}><FaMagic className="me-2" /> Suggested Legal Framework</h5>
                                        </Card.Header>
                                        <Card.Body className="p-0">
                                            <ListGroup variant="flush">
                                                {results.suggestedSections.map((s, idx) => (
                                                    <ListGroup.Item key={idx} className="py-3 px-4 border-light hover-bg-light transition-all">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="fw-bold" style={{ fontSize: '1.05rem', color: '#0F172A' }}>{s.law?.toUpperCase()} Section {s.section}</span>
                                                            <Badge bg="primary" pill className="px-3" style={{ fontSize: '0.78rem' }}>{Math.round(s.score * 100)}% Match</Badge>
                                                        </div>
                                                        <div className="text-muted mt-2" style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#374151' }}>
                                                            {s.title || (s.description?.substring(0, 150) + '...')}
                                                        </div>
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* ── State 5: Generic error ── */}
                    {!loading && !rejection && error && (
                        <Alert variant="danger" className="mt-2 shadow-sm border-0">{error}</Alert>
                    )}
                </Col>
            </Row>

            <style>{`
                .border-dashed {
                    border: 2px dashed var(--bs-border-color);
                }
                .text-truncate-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;  
                    overflow: hidden;
                }
                .font-monospace {
                    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                }
            `}</style>
        </Container>
    );
};

export default DocumentAnalysis;
