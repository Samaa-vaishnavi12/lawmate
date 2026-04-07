import { useState } from 'react';
import { Container, Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { FaMoon, FaSun, FaPalette, FaLock } from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
    const { theme, setTheme } = useOutletContext();
    const [saved, setSaved] = useState(false);

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordMessage, setPasswordMessage] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const submitPasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage(null);
        setPasswordError(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        setPasswordLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            
            if (!user || !user.token) { // Check if user or token is missing
                setPasswordError('Session expired. Please login again.');
                return;
            }
            const token = user.token; // Define token after checking user

            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/users/password-change`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordMessage(data.message);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPasswordError(data.message || 'Password update failed');
            }
        } catch (err) {
            setPasswordError('Server error');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <h2 className="mb-4">Settings</h2>
                    {saved && <Alert variant="success" className="mb-4">Settings saved successfully!</Alert>}
                    
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-body border-bottom-0 pt-4 pb-0">
                            <h5 className="fw-bold"><FaPalette className="me-2 text-primary"/> Appearance</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Theme</Form.Label>
                                <div className="d-flex gap-3">
                                    <Button 
                                        variant={theme === 'light' ? 'primary' : 'outline-secondary'} 
                                        className="d-flex align-items-center flex-grow-1 justify-content-center"
                                        onClick={() => setTheme('light')}
                                    >
                                        <FaSun className="me-2" /> Light Mode
                                    </Button>
                                    <Button 
                                        variant={theme === 'dark' ? 'primary' : 'outline-secondary'} 
                                        className="d-flex align-items-center flex-grow-1 justify-content-center"
                                        onClick={() => setTheme('dark')}
                                    >
                                        <FaMoon className="me-2" /> Dark Mode
                                    </Button>
                                </div>
                                <Form.Text className="text-muted">
                                    Select your preferred application theme.
                                </Form.Text>
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-body border-bottom-0 pt-4 pb-0">
                            <h5 className="fw-bold"><FaLock className="me-2 text-primary"/> Security</h5>
                        </Card.Header>
                        <Card.Body>
                            {passwordMessage && <Alert variant="success">{passwordMessage}</Alert>}
                            {passwordError && <Alert variant="danger">{passwordError}</Alert>}
                            
                            <Form onSubmit={submitPasswordChange}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Current Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="bg-body-secondary"
                                    />
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>New Password</Form.Label>
                                            <Form.Control 
                                                type="password" 
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                className="bg-body-secondary"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control 
                                                type="password" 
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                required
                                                className="bg-body-secondary"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <div className="d-flex justify-content-end">
                                    <Button variant="outline-primary" type="submit" disabled={passwordLoading}>
                                        {passwordLoading ? 'Updating...' : 'Change Password'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    <div className="d-flex justify-content-end">
                        <Button variant="primary" size="lg" onClick={handleSave}>
                            Save Preferences
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Settings;
