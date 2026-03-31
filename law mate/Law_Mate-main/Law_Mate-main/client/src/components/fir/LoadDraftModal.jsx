import { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaTrash, FaClock } from 'react-icons/fa';
import API_URL from '../../config';

const LoadDraftModal = ({ show, onHide, onLoadDraft }) => {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show) {
            fetchDrafts();
        }
    }, [show]);

    const fetchDrafts = async () => {
        setLoading(true);
        setError(null);
        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            if (!user?.token) return;
            const token = user.token;

            const response = await fetch(`${API_URL}/api/fir/drafts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                setDrafts(data);
            } else {
                setError(data.message || 'Failed to fetch drafts');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const deleteDraft = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this draft?')) return;

        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            if (!user?.token) return;
            const token = user.token;

            const response = await fetch(`${API_URL}/api/fir/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchDrafts(); // Refresh list
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete draft');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete draft');
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage < 30) return 'danger';
        if (percentage < 70) return 'warning';
        return 'success';
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Load Draft</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
                
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Loading drafts...</p>
                    </div>
                ) : drafts.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-muted">No saved drafts found</p>
                    </div>
                ) : (
                    <ListGroup>
                        {drafts.map((draft) => (
                            <ListGroup.Item
                                key={draft._id}
                                action
                                onClick={() => onLoadDraft(draft)}
                                className="d-flex justify-content-between align-items-start"
                            >
                                <div className="flex-grow-1">
                                    <div className="d-flex align-items-center mb-2">
                                        <strong className="me-2">
                                            {draft.complainant?.name || 'Unnamed Draft'}
                                        </strong>
                                        <Badge bg={getProgressColor(draft.completionPercentage || 0)}>
                                            {draft.completionPercentage || 0}% Complete
                                        </Badge>
                                    </div>
                                    <div className="text-muted small">
                                        <FaClock className="me-1" />
                                        Last saved: {new Date(draft.updatedAt).toLocaleString('en-IN')}
                                    </div>
                                    {draft.incident?.natureOfOffence && (
                                        <div className="text-muted small">
                                            Offence: {draft.incident.natureOfOffence}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={(e) => deleteDraft(draft._id, e)}
                                >
                                    <FaTrash />
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LoadDraftModal;
