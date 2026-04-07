import { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Button, Badge, Spinner, Alert, Modal, Form, Nav, Tab } from 'react-bootstrap';
import { FaHistory, FaTrash, FaSearch, FaUsers, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const SavedQueries = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [activeTab, setActiveTab] = useState('mine');
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const navigate = useNavigate();
    
    const getStoredUser = () => JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    const user = getStoredUser();
    const isAdmin = user?.isAdmin;

    useEffect(() => {
        fetchQueries();
    }, [page, limit, activeTab]);

    const fetchQueries = async () => {
        setLoading(true);
        setError(null);
        try {
            const currentUser = getStoredUser();
            if (!currentUser?.token) return;

            const isGlobal = activeTab === 'global';
            const response = await fetch(`${API_URL}/api/queries?page=${page}&limit=${limit}${isGlobal ? '&global=true' : ''}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setQueries(data.queries);
                setTotalPages(data.pages);
                setTotalCount(data.total);
            } else {
                setError(data.message || 'Failed to fetch saved searches');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const PaginationControls = ({ currentPage, totalPages, totalItems, onPageChange, limit, onLimitChange }) => {
        if (totalItems === 0) return null;

        return (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3 bg-body-tertiary p-3 rounded-4">
                <div className="text-muted small">
                    Showing <strong>{(currentPage - 1) * limit + 1}</strong> to <strong>{Math.min(currentPage * limit, totalItems)}</strong> of <strong>{totalItems}</strong> searches
                </div>
                
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <span className="small text-muted">Rows:</span>
                        <Form.Select 
                            size="sm" 
                            className="w-auto border-0 bg-light rounded-pill px-3"
                            value={limit}
                            onChange={(e) => {
                                onLimitChange(Number(e.target.value));
                                onPageChange(1);
                            }}
                        >
                            {[5, 10, 25, 50].map(l => <option key={l} value={l}>{l}</option>)}
                        </Form.Select>
                    </div>

                    <div className="d-flex gap-1">
                        <Button 
                            variant="light" 
                            size="sm" 
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            className="rounded-circle"
                        >
                            &laquo;
                        </Button>
                        
                        {[...Array(totalPages)].map((_, i) => {
                            const p = i + 1;
                            if (totalPages > 5) {
                                if (p !== 1 && p !== totalPages && Math.abs(p - currentPage) > 1) {
                                    if (p === 2 || p === totalPages - 1) return <span key={p} className="mx-1 text-muted">...</span>;
                                    return null;
                                }
                            }

                            return (
                                <Button 
                                    key={p}
                                    variant={currentPage === p ? 'primary' : 'light'} 
                                    size="sm"
                                    onClick={() => onPageChange(p)}
                                    className="rounded-pill px-3"
                                >
                                    {p}
                                </Button>
                            );
                        })}

                        <Button 
                            variant="light" 
                            size="sm" 
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => onPageChange(currentPage + 1)}
                            className="rounded-circle"
                        >
                            &raquo;
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        setDeleteId(id);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const currentUser = getStoredUser();
            if (!currentUser?.token) return;

            const response = await fetch(`${API_URL}/api/queries/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });

            if (response.ok) {
                setQueries(prev => prev.filter(q => q._id !== deleteId));
                setTotalCount(prev => prev - 1);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete search');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete search');
        } finally {
            setShowConfirm(false);
            setDeleteId(null);
        }
    };

    const handleRun = (query, law) => {
        navigate(`/chat?q=${encodeURIComponent(query)}&law=${law}`);
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Saved Searches</h2>
                <Button variant="primary" className="rounded-pill px-4" onClick={() => navigate('/chat')}>
                    <FaSearch className="me-2" />
                    New Search
                </Button>
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {isAdmin && (
                <Nav variant="pills" className="mb-4 bg-body-tertiary p-1 rounded-pill w-fit-content mx-auto shadow-sm" activeKey={activeTab} onSelect={(k) => { setActiveTab(k); setPage(1); }}>
                    <Nav.Item>
                        <Nav.Link eventKey="mine" className="rounded-pill px-4 py-2 border-0">
                            <FaUser className="me-2" /> My Searches
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="global" className="rounded-pill px-4 py-2 border-0">
                            <FaUsers className="me-2" /> Global Platform
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            )}

            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Loading saved searches...</p>
                        </div>
                    ) : queries.length === 0 ? (
                        <div className="text-center py-5">
                            <FaHistory size={48} className="text-muted mb-3 opacity-25" />
                            <h5 className="text-muted">No saved searches found</h5>
                            <p className="text-muted small">
                                {activeTab === 'mine' ? 'Your personal saved legal queries will appear here.' : 'No users have saved any queries yet.'}
                            </p>
                            {activeTab === 'mine' && (
                                <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => navigate('/chat')}>
                                    Start Searching
                                </Button>
                            )}
                        </div>
                    ) : (
                        <ListGroup variant="flush">
                            {queries.map((q) => (
                                <ListGroup.Item 
                                    key={q._id} 
                                    action 
                                    as="div"
                                    className="py-3 px-4 bg-transparent d-flex justify-content-between align-items-center border-0 border-bottom border-light"
                                    onClick={() => handleRun(q.query, q.law)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex align-items-center overflow-hidden">
                                        <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary me-3 flex-shrink-0">
                                            <FaHistory />
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="fw-bold fs-5 mb-0 text-truncate">{q.title}</div>
                                            <div className="d-flex flex-wrap gap-2 align-items-center mb-1 mt-1">
                                                <Badge bg="info" className="fw-normal">{q.law.toUpperCase()}</Badge>
                                                {activeTab === 'global' && q.user && (
                                                    <span className="small text-muted d-flex align-items-center">
                                                        <FaUser size={10} className="me-1" />
                                                        {q.user.name} 
                                                        {q.user._id === user._id && <Badge pill bg="secondary" className="ms-1 px-2" style={{fontSize: '10px'}}>You</Badge>}
                                                    </span>
                                                )}
                                                <small className="text-muted">Saved on {new Date(q.createdAt).toLocaleDateString('en-IN')}</small>
                                            </div>
                                            <div className="text-muted small text-truncate italic">
                                                "{q.query}"
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ms-3 flex-shrink-0">
                                        {(activeTab === 'mine' || isAdmin) && (
                                            <Button 
                                                variant="light" 
                                                className="rounded-circle text-danger hover-bg-danger-subtle border-0"
                                                size="sm"
                                                onClick={(e) => handleDelete(q._id, e)}
                                                title="Remove search"
                                            >
                                                <FaTrash />
                                            </Button>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>

            {!loading && queries.length > 0 && (
                <PaginationControls 
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={totalCount}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                />
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="sm">
                <Modal.Body className="text-center py-4 rounded-4 shadow-lg border-0">
                    <div className="text-danger mb-3 bg-danger bg-opacity-10 p-4 rounded-circle d-inline-block mx-auto">
                        <FaTrash size={48} />
                    </div>
                    <h5 className="fw-bold mb-3">Delete Saved Search?</h5>
                    <p className="text-muted small mb-4 px-3">Are you sure you want to remove this search {activeTab === 'global' ? 'from the platform' : 'from your library'}?</p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button variant="light" className="rounded-pill px-4" onClick={() => setShowConfirm(false)}>Cancel</Button>
                        <Button variant="danger" className="rounded-pill px-4" onClick={confirmDelete}>Delete</Button>
                    </div>
                </Modal.Body>
            </Modal>
            
            <style>{`
                .w-fit-content { width: fit-content; }
                .hover-bg-danger-subtle:hover {
                    background-color: #f8d7da !important;
                }
                .italic { font-style: italic; }
            `}</style>
        </Container>
    );
};

export default SavedQueries;
