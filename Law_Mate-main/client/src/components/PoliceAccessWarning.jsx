import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaExclamationTriangle, FaSignInAlt, FaArrowLeft } from 'react-icons/fa';

/**
 * PoliceAccessWarning
 * Shows a warning modal when a public user tries to access police-only pages.
 * Usage: wrap any component — renders modal if access is denied, otherwise renders children.
 */
const PoliceAccessWarning = ({ user, children }) => {
    const navigate = useNavigate();
    const role = user?.role?.toLowerCase();
    const hasAccess = role === 'police' || role === 'admin' || user?.isAdmin;

    if (hasAccess) return children;

    return (
        <>
            {/* Blurred background page hint */}
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'blur(4px)',
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: 0.3
            }}>
                <div className="text-center text-muted">
                    <FaUserShield size={80} />
                    <p className="mt-3">Police Only Area</p>
                </div>
            </div>

            {/* Warning Modal — always shown, not dismissible */}
            <Modal
                show={true}
                centered
                backdrop="static"
                keyboard={false}
                size="md"
            >
                <Modal.Body className="text-center p-5">
                    {/* Warning Icon */}
                    <div style={{
                        width: 80, height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff007f22, #ff007f11)',
                        border: '2px solid #ff007f44',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <FaExclamationTriangle size={34} color="#ff007f" />
                    </div>

                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(255,0,127,0.08)',
                        border: '1px solid rgba(255,0,127,0.2)',
                        color: '#ff007f',
                        borderRadius: 50,
                        padding: '5px 16px',
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 16,
                        letterSpacing: 0.5
                    }}>
                        <FaUserShield size={11} /> POLICE ONLY ACCESS
                    </div>

                    <h4 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>
                        Restricted Area
                    </h4>

                    <p className="text-muted mb-1" style={{ fontSize: 15 }}>
                        This section is exclusively for <strong>Police Officers</strong> and <strong>Administrators</strong>.
                    </p>
                    <p className="text-muted mb-4" style={{ fontSize: 13 }}>
                        Your current role is <strong
                            style={{
                                background: 'rgba(78,84,200,0.1)',
                                color: '#4e54c8',
                                padding: '2px 10px',
                                borderRadius: 20
                            }}>
                            {role === 'public' ? 'Public Citizen' : role}
                        </strong>.
                        FIR drafting, document generation, and case history tools require verified police credentials.
                    </p>

                    {/* Divider */}
                    <hr style={{ borderColor: 'rgba(0,0,0,0.07)' }} />

                    {/* Action Buttons */}
                    <div className="d-flex flex-column gap-2">
                        <Button
                            style={{
                                background: 'linear-gradient(135deg,#ff007f,#c9005e)',
                                border: 'none',
                                borderRadius: 50,
                                padding: '10px 24px',
                                fontWeight: 700
                            }}
                            onClick={() => {
                                // Log out and go to police login
                                localStorage.removeItem('user');
                                sessionStorage.removeItem('user');
                                navigate('/login');
                            }}
                        >
                            <FaSignInAlt className="me-2" />
                            Login as Police Officer
                        </Button>

                        <Button
                            variant="outline-secondary"
                            className="rounded-pill"
                            style={{ padding: '10px 24px', fontWeight: 600 }}
                            onClick={() => navigate('/dashboard')}
                        >
                            <FaArrowLeft className="me-2" />
                            Go Back to Dashboard
                        </Button>
                    </div>

                    <p className="text-muted mt-3 mb-0" style={{ fontSize: 11 }}>
                        If you are a police officer, please login with your official credentials.
                    </p>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default PoliceAccessWarning;
