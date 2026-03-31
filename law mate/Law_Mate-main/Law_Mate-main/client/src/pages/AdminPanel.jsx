import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Table, Button, Badge, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaUsers, FaFolder, FaPlus, FaTrash, FaCheckCircle, FaExclamationTriangle, FaBalanceScale, FaEdit } from 'react-icons/fa';
import API_URL from '../config';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [firs, setFirs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [laws, setLaws] = useState([]);

    // Pagination state
    const [userPage, setUserPage] = useState(1);
    const [userLimit, setUserLimit] = useState(10);
    const [userTotalPages, setUserTotalPages] = useState(1);
    const [userTotal, setUserTotal] = useState(0);

    const [firPage, setFirPage] = useState(1);
    const [firLimit, setFirLimit] = useState(10);
    const [firTotalPages, setFirTotalPages] = useState(1);
    const [firTotal, setFirTotal] = useState(0);

    const [lawPage, setLawPage] = useState(1);
    const [lawLimit, setLawLimit] = useState(10);
    const [lawTotalPages, setLawTotalPages] = useState(1);
    const [lawTotal, setLawTotal] = useState(0);

    // Law form state
    const [lawForm, setLawForm] = useState({
        law: 'BNS',
        section: '',
        title: '',
        description: '',
        punishment: '',
        bailsilver: '',
        offenseType: 'Cognizable'
    });

    // Modals state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [showLawModal, setShowLawModal] = useState(false);
    const [editingLaw, setEditingLaw] = useState(null);
    const [showDeleteLawModal, setShowDeleteLawModal] = useState(false);
    const [lawToDelete, setLawToDelete] = useState(null);

    const getStoredUser = () => JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    const user = getStoredUser();

    const fetchData = async (tab) => {
        setLoading(true);
        setError(null);
        try {
            const currentUser = getStoredUser();
            if (!currentUser?.token) return;
            
            const page = tab === 'users' ? userPage : (tab === 'firs' ? firPage : lawPage);
            const limit = tab === 'users' ? userLimit : (tab === 'firs' ? firLimit : lawLimit);

            const endpoint = tab === 'users' ? '/api/admin/users' : (tab === 'firs' ? '/api/admin/firs' : '/api/admin/laws');
            const response = await fetch(`${API_URL}${endpoint}?page=${page}&limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await response.json();
            if (response.ok) {
                if (tab === 'users') {
                    setUsers(data.users);
                    setUserTotalPages(data.pages);
                    setUserTotal(data.total);
                } else if (tab === 'firs') {
                    setFirs(data.firs);
                    setFirTotalPages(data.pages);
                    setFirTotal(data.total);
                } else if (tab === 'laws') {
                    setLaws(data.laws);
                    setLawTotalPages(data.pages);
                    setLawTotal(data.total);
                }
            } else {
                setError(data.message || 'Failed to fetch data');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, userPage, userLimit, firPage, firLimit, lawPage, lawLimit]);

    const PaginationControls = ({ currentPage, totalPages, totalItems, onPageChange, limit }) => {
        return (
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <div className="text-muted small">
                    Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{totalItems}</strong> total items)
                </div>
                
                {totalPages > 1 && (
                    <div className="d-flex gap-2">
                        <Button 
                            variant="outline-primary" 
                            size="sm" 
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            Previous
                        </Button>
                        
                        {(() => {
                            const pages = [];
                            const delta = 1;
                            for (let i = 1; i <= totalPages; i++) {
                                if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                                    pages.push(
                                        <Button
                                            key={i}
                                            variant={currentPage === i ? 'primary' : 'outline-primary'}
                                            size="sm"
                                            onClick={() => onPageChange(i)}
                                        >
                                            {i}
                                        </Button>
                                    );
                                } else if ((i === 2 && currentPage > delta + 2) || (i === totalPages - 1 && currentPage < totalPages - delta - 1)) {
                                    pages.push(<span key={i} className="px-1 text-muted">...</span>);
                                }
                            }
                            return pages;
                        })()}

                        <Button 
                            variant="outline-primary" 
                            size="sm" 
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const handleLawSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const currentUser = getStoredUser();
            if (!currentUser?.token) return;

            const method = editingLaw ? 'PUT' : 'POST';
            const endpoint = editingLaw ? `/api/admin/laws/${editingLaw._id}` : '/api/admin/laws';

            const response = await fetch(`${API_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(lawForm)
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(editingLaw ? 'Law section updated!' : 'New law section added!');
                setShowLawModal(false);
                fetchData('laws');
            } else {
                setError(data.message || 'Failed to save law');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteLaw = (l) => {
        setLawToDelete(l);
        setShowDeleteLawModal(true);
    };

    const handleDeleteLaw = async () => {
        setDeleting(true);
        try {
            const currentUser = getStoredUser();
            if (!currentUser?.token) return;

            const response = await fetch(`${API_URL}/api/admin/laws/${lawToDelete._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (response.ok) {
                setSuccess(`Law section removed successfully.`);
                fetchData('laws');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete law');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setDeleting(false);
            setShowDeleteLawModal(false);
            setLawToDelete(null);
        }
    };

    const openLawModal = (law = null) => {
        if (law) {
            setEditingLaw(law);
            setLawForm({
                law: law.law,
                section: law.section,
                title: law.title,
                description: law.description,
                punishment: law.punishment || '',
                bailsilver: law.bailsilver || '',
                offenseType: law.offenseType || 'Cognizable'
            });
        } else {
            setEditingLaw(null);
            setLawForm({
                law: 'BNS',
                section: '',
                title: '',
                description: '',
                punishment: '',
                bailsilver: '',
                offenseType: 'Cognizable'
            });
        }
        setShowLawModal(true);
    };

    const confirmDeleteUser = (u) => {
        setUserToDelete(u);
        setShowDeleteModal(true);
    };

    const handleDeleteUser = async () => {
        setDeleting(true);
        try {
            const currentUser = getStoredUser();
            if (!currentUser?.token) return;

            const response = await fetch(`${API_URL}/api/admin/users/${userToDelete._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            if (response.ok) {
                setSuccess(`User ${userToDelete.name} and all associated data deleted.`);
                setUsers(users.filter(u => u._id !== userToDelete._id));
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete user');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4 d-flex align-items-center">
                <Badge bg="primary" className="me-3">Admin</Badge>
                Control Panel
            </h2>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Card className="shadow-sm border-0">
                    <Card.Header className="bg-body p-0">
                        <Nav variant="tabs" className="border-0 px-3 pt-2">
                            <Nav.Item>
                                <Nav.Link eventKey="users" className="border-0 d-flex align-items-center">
                                    <FaUsers className="me-2" /> Users
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="firs" className="border-0 d-flex align-items-center">
                                    <FaFolder className="me-2" /> FIR Tracking
                                </Nav.Link>
                            </Nav.Item>
                             <Nav.Item>
                                 <Nav.Link eventKey="laws" className="border-0 d-flex align-items-center">
                                     <FaBalanceScale className="me-2" /> Law Management
                                 </Nav.Link>
                             </Nav.Item>
                        </Nav>
                    </Card.Header>
                    <Card.Body>
                        <Tab.Content>
                            <Tab.Pane eventKey="users">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                    <h5 className="fw-bold mb-0">User Management</h5>
                                    <div className="d-flex align-items-center gap-3">
                                        <Form.Group className="d-flex align-items-center gap-2">
                                            <Form.Label className="small mb-0 text-nowrap">Items per page:</Form.Label>
                                            <Form.Select 
                                                size="sm" 
                                                className="w-auto"
                                                value={userLimit}
                                                onChange={(e) => { setUserLimit(Number(e.target.value)); setUserPage(1); }}
                                            >
                                                {[5, 10, 25, 50].map(l => <option key={l} value={l}>{l}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                        <Button variant="outline-primary" size="sm" className="rounded-pill px-3" onClick={() => fetchData('users')}>
                                            Refresh List
                                        </Button>
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="text-center py-5"><Spinner animation="border" /></div>
                                ) : (
                                    <Card className="border-0 shadow-sm rounded-3">
                                        <Card.Body className="p-0">
                                            <div className="table-responsive">
                                                <Table hover className="align-middle mb-0 custom-admin-table">
                                                    <thead className="bg-body-tertiary">
                                                        <tr>
                                                            <th className="px-4 py-3 border-0">Name</th>
                                                            <th className="py-3 border-0">Email</th>
                                                            <th className="py-3 border-0">Role</th>
                                                            <th className="py-3 border-0">Joined</th>
                                                            <th className="text-end px-4 py-3 border-0">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {users.map(u => (
                                                            <tr key={u._id}>
                                                                <td className="px-4 py-3 fw-medium">{u.name}</td>
                                                                <td className="py-3 text-muted">{u.email}</td>
                                                                <td className="py-3">
                                                                    <Badge pill bg={u.role === 'admin' ? 'danger' : 'info'} className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                                                                        {u.role}
                                                                    </Badge>
                                                                </td>
                                                                <td className="py-3 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                                <td className="text-end px-4 py-3">
                                                                    <Button 
                                                                        variant="light" 
                                                                        className={`btn-sm rounded-circle text-danger ${u.role === 'admin' ? 'opacity-0' : ''}`}
                                                                        onClick={() => confirmDeleteUser(u)}
                                                                        disabled={u.role === 'admin'}
                                                                    >
                                                                         <FaTrash />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Card.Body>
                                        <Card.Footer className="bg-white py-3">
                                            <PaginationControls 
                                                currentPage={userPage}
                                                totalPages={userTotalPages}
                                                totalItems={userTotal}
                                                limit={userLimit}
                                                onPageChange={setUserPage}
                                            />
                                        </Card.Footer>
                                    </Card>
                                )}
                            </Tab.Pane>

                            <Tab.Pane eventKey="firs">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                    <h5 className="fw-bold mb-0">Global FIR Oversight</h5>
                                    <div className="d-flex align-items-center gap-3">
                                        <Form.Group className="d-flex align-items-center gap-2">
                                            <Form.Label className="small mb-0 text-nowrap">Items per page:</Form.Label>
                                            <Form.Select 
                                                size="sm" 
                                                className="w-auto"
                                                value={firLimit}
                                                onChange={(e) => { setFirLimit(Number(e.target.value)); setFirPage(1); }}
                                            >
                                                {[5, 10, 25, 50].map(l => <option key={l} value={l}>{l}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                        <Button variant="outline-primary" size="sm" className="rounded-pill px-3" onClick={() => fetchData('firs')}>
                                            Refresh Tracking
                                        </Button>
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="text-center py-5"><Spinner animation="border" /></div>
                                ) : (
                                    <Card className="border-0 shadow-sm rounded-3">
                                        <Card.Body className="p-0">
                                            <div className="table-responsive">
                                                <Table hover className="align-middle mb-0 custom-admin-table">
                                                    <thead className="bg-body-tertiary">
                                                        <tr>
                                                            <th className="px-4 py-3 border-0">FIR # / Draft</th>
                                                            <th className="py-3 border-0">Created By</th>
                                                            <th className="py-3 border-0">Offence Nature</th>
                                                            <th className="py-3 border-0 text-center">Status</th>
                                                            <th className="px-4 py-3 border-0 text-end">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {firs.map(f => (
                                                            <tr key={f._id}>
                                                                <td className="px-4 py-3 fw-bold text-primary">{f.firNumber || 'DRAFT'}</td>
                                                                <td className="py-3">
                                                                    <span className="fw-medium">{f.createdBy?.name || 'Unknown'}</span>
                                                                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{f.createdBy?.email}</small>
                                                                </td>
                                                                <td className="py-3 text-muted">{f.incident?.natureOfOffence || 'Not specified'}</td>
                                                                <td className="py-3 text-center">
                                                                    <Badge pill bg={f.status === 'filed' ? 'success' : 'warning'} style={{ minWidth: '80px', fontSize: '0.7rem' }}>
                                                                        {f.status.toUpperCase()}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-4 py-3 text-end text-muted font-monospace">{new Date(f.createdAt).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Card.Body>
                                        <Card.Footer className="bg-white py-3">
                                            <PaginationControls 
                                                currentPage={firPage}
                                                totalPages={firTotalPages}
                                                totalItems={firTotal}
                                                limit={firLimit}
                                                onPageChange={setFirPage}
                                            />
                                        </Card.Footer>
                                    </Card>
                                )}
                            </Tab.Pane>

                             <Tab.Pane eventKey="laws">
                                 <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                     <h5 className="fw-bold mb-0">Legal Knowledge Base</h5>
                                     <div className="d-flex align-items-center gap-3">
                                         <Form.Group className="d-flex align-items-center gap-2">
                                             <Form.Label className="small mb-0 text-nowrap">Items per page:</Form.Label>
                                             <Form.Select 
                                                 size="sm" 
                                                 className="w-auto"
                                                 value={lawLimit}
                                                 onChange={(e) => { setLawLimit(Number(e.target.value)); setLawPage(1); }}
                                             >
                                                 {[5, 10, 25, 50].map(l => <option key={l} value={l}>{l}</option>)}
                                             </Form.Select>
                                         </Form.Group>
                                         <Button variant="primary" size="sm" className="rounded-pill px-4 shadow-sm" onClick={() => openLawModal()}>
                                             <FaPlus className="me-2" /> Add New Section
                                         </Button>
                                     </div>
                                 </div>
                                 {loading && activeTab === 'laws' ? (
                                     <div className="text-center py-5"><Spinner animation="border" /></div>
                                 ) : (
                                     <Card className="border-0 shadow-sm rounded-3">
                                         <Card.Body className="p-0">
                                             <div className="table-responsive">
                                                 <Table hover className="align-middle mb-0 custom-admin-table">
                                                     <thead className="bg-body-tertiary">
                                                         <tr>
                                                             <th className="px-4 py-3 border-0">Law</th>
                                                             <th className="py-3 border-0">Section</th>
                                                             <th className="py-3 border-0">Title</th>
                                                             <th className="py-3 border-0">Type</th>
                                                             <th className="text-end px-4 py-3 border-0">Actions</th>
                                                         </tr>
                                                     </thead>
                                                     <tbody>
                                                         {laws.map(l => (
                                                             <tr key={l._id}>
                                                                 <td className="px-4 py-3"><Badge bg="secondary" className="px-2">{l.law}</Badge></td>
                                                                 <td className="py-3 fw-bold">Section {l.section}</td>
                                                                 <td className="py-3 text-muted" title={l.title}>{l.title.length > 50 ? l.title.substring(0, 50) + '...' : l.title}</td>
                                                                 <td className="py-3 small">{l.offenseType}</td>
                                                                 <td className="text-end px-4 py-3">
                                                                     <div className="d-flex gap-2 justify-content-end">
                                                                         <Button 
                                                                             variant="light" 
                                                                             className="btn-sm rounded-circle text-primary"
                                                                             onClick={() => openLawModal(l)}
                                                                         >
                                                                             <FaEdit />
                                                                         </Button>
                                                                         <Button 
                                                                             variant="light" 
                                                                             className="btn-sm rounded-circle text-danger"
                                                                             onClick={() => confirmDeleteLaw(l)}
                                                                         >
                                                                             <FaTrash />
                                                                         </Button>
                                                                     </div>
                                                                 </td>
                                                             </tr>
                                                         ))}
                                                     </tbody>
                                                 </Table>
                                             </div>
                                         </Card.Body>
                                         <Card.Footer className="bg-white py-3">
                                             <PaginationControls 
                                                 currentPage={lawPage}
                                                 totalPages={lawTotalPages}
                                                 totalItems={lawTotal}
                                                 limit={lawLimit}
                                                 onPageChange={setLawPage}
                                             />
                                         </Card.Footer>
                                     </Card>
                                 )}
                             </Tab.Pane>
                        </Tab.Content>
                    </Card.Body>
                </Card>
            </Tab.Container>

            {/* Cascade Delete Confirmation */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Body className="text-center py-4">
                    <div className="text-danger mb-3">
                        <FaExclamationTriangle size={64} />
                    </div>
                    <h4 className="fw-bold">CRITICAL ACTION</h4>
                    <p className="mb-4">
                        You are about to delete <strong>{userToDelete?.name}</strong>.<br/>
                        <span className="text-danger fw-bold">WARNING: This will permanently delete all FIRs, saved searches, and history logs belonging to this user.</span>
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                        <Button variant="light" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteUser} disabled={deleting}>
                            {deleting ? <Spinner size="sm" /> : 'CONFIRM CASCADE DELETE'}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Law Entry/Edit Modal */}
            <Modal show={showLawModal} onHide={() => setShowLawModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{editingLaw ? 'Edit Law Section' : 'Add New Law Section'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-4">
                    <Form onSubmit={handleLawSubmit}>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Law Category</Form.Label>
                                    <Form.Select 
                                        value={lawForm.law} 
                                        onChange={(e) => setLawForm({...lawForm, law: e.target.value})}
                                    >
                                        <option value="BNS">BNS</option>
                                        <option value="IPC">IPC</option>
                                        <option value="CrPC">CrPC</option>
                                        <option value="IEA">IEA</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Section Number</Form.Label>
                                    <Form.Control 
                                        required
                                        placeholder="e.g. 302"
                                        value={lawForm.section}
                                        onChange={(e) => setLawForm({...lawForm, section: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Short Title</Form.Label>
                                    <Form.Control 
                                        required
                                        placeholder="e.g. Punishment for murder"
                                        value={lawForm.title}
                                        onChange={(e) => setLawForm({...lawForm, title: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Full Description</Form.Label>
                                    <Form.Control 
                                        as="textarea"
                                        rows={4}
                                        required
                                        placeholder="Full legal text here..."
                                        value={lawForm.description}
                                        onChange={(e) => setLawForm({...lawForm, description: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Punishment</Form.Label>
                                    <Form.Control 
                                        placeholder="e.g. Life imprisonment"
                                        value={lawForm.punishment}
                                        onChange={(e) => setLawForm({...lawForm, punishment: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Bail/Silver Status</Form.Label>
                                    <Form.Control 
                                        placeholder="e.g. Non-bailable"
                                        value={lawForm.bailsilver}
                                        onChange={(e) => setLawForm({...lawForm, bailsilver: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Offense Type</Form.Label>
                                    <Form.Control 
                                        placeholder="e.g. Cognizable"
                                        value={lawForm.offenseType}
                                        onChange={(e) => setLawForm({...lawForm, offenseType: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12} className="text-end mt-4">
                                <Button variant="primary" type="submit" disabled={loading} className="px-5 py-2 fw-bold">
                                    {loading ? <Spinner size="sm" /> : (editingLaw ? 'Update Section' : 'Record Law Section')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Law Delete Modal */}
            <Modal show={showDeleteLawModal} onHide={() => setShowDeleteLawModal(false)} centered size="sm">
                <Modal.Body className="text-center py-4">
                    <FaExclamationTriangle size={48} className="text-warning mb-3" />
                    <h5 className="fw-bold">Remove Section?</h5>
                    <p className="text-muted small">Are you sure you want to delete <strong>Section {lawToDelete?.section}</strong> of <strong>{lawToDelete?.law}</strong>?</p>
                    <div className="d-flex gap-2 justify-content-center mt-4">
                        <Button variant="light" onClick={() => setShowDeleteLawModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteLaw} disabled={deleting}>
                            {deleting ? <Spinner size="sm" /> : 'Delete'}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            <style>{`
                .custom-admin-table tbody tr {
                    transition: all 0.2s ease;
                }
                .custom-admin-table tbody tr:hover {
                    background-color: rgba(13, 110, 253, 0.02) !important;
                }
                .font-monospace {
                    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                }
            `}</style>
        </Container>
    );
};

export default AdminPanel;
