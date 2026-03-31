import { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LegalHeroImage from '../components/LegalHeroImage';
import API_URL from '../config';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(data.message || 'Request failed');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="vh-100 d-flex align-items-center bg-body-tertiary">
            <Row className="w-100 justify-content-center align-items-center g-0">
                <Col md={6} lg={5} className="d-none d-md-flex flex-column align-items-center justify-content-center p-5">
                    <LegalHeroImage />
                    <h2 className="mt-4 fw-bold text-primary text-center">Update Your Credentials</h2>
                    <p className="text-muted text-center lead">Securely reset your password to regain access to your account.</p>
                </Col>

                <Col md={6} lg={5}>
                    <Card className="shadow-lg border-0 rounded-4">
                        <Card.Body className="p-5">
                            <div className="mb-4 text-center">
                                <h3 className="fw-bold">Reset Password</h3>
                                <p className="text-muted small">Enter your email and choose a new secure password</p>
                            </div>
                            
                            {error && <Alert variant="danger" className="small py-2">{error}</Alert>}
                            {message && <Alert variant="success" className="small py-2">{message}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Confirm Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" size="lg" className="w-100 mb-3 shadow-sm py-2" disabled={loading}>
                                    {loading ? 'Processing...' : 'Reset Password'}
                                </Button>
                            </Form>
                            <div className="text-center mt-3">
                                <Link to="/login" className="text-decoration-none fw-bold small text-primary">Back to Login</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassword;
