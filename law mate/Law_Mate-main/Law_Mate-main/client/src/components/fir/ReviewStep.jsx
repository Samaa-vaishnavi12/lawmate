import { Card, Row, Col, Badge, Form } from 'react-bootstrap';

const ReviewStep = ({ data, updateData }) => {
    const handleOfficerChange = (field, value) => {
        updateData('officer', {
            ...data.officer,
            [field]: value
        });
    };

    return (
        <div>
            <div className="alert alert-info mb-4">
                <strong>Review your FIR</strong> - Please verify all information before generating the document.
            </div>

            {/* Basic Information */}
            <Card className="mb-3">
                <Card.Header className="bg-body-secondary">
                    <strong>Basic Information</strong>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}><strong>FIR Number:</strong> {data.firNumber || 'Auto-generated'}</Col>
                        <Col md={6}><strong>Police Station:</strong> {data.policeStation.name}</Col>
                        <Col md={6}><strong>District:</strong> {data.policeStation.district}</Col>
                        <Col md={6}><strong>State:</strong> {data.policeStation.state}</Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Complainant */}
            <Card className="mb-3">
                <Card.Header className="bg-body-secondary">
                    <strong>Complainant Details</strong>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}><strong>Name:</strong> {data.complainant.name}</Col>
                        <Col md={6}><strong>Father's Name:</strong> {data.complainant.fatherName}</Col>
                        <Col md={6}><strong>Age:</strong> {data.complainant.age} years</Col>
                        <Col md={6}><strong>Occupation:</strong> {data.complainant.occupation || 'N/A'}</Col>
                        <Col md={12}><strong>Address:</strong> {data.complainant.address}</Col>
                        <Col md={6}><strong>Mobile:</strong> {data.complainant.mobile}</Col>
                        <Col md={6}><strong>Email:</strong> {data.complainant.email || 'N/A'}</Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Accused */}
            <Card className="mb-3">
                <Card.Header className="bg-body-secondary">
                    <strong>Accused Details</strong>
                </Card.Header>
                <Card.Body>
                    {data.accused.map((accused, index) => (
                        <div key={index} className={index > 0 ? 'mt-3 pt-3 border-top' : ''}>
                            <strong>Accused #{index + 1}:</strong>
                            <div className="ms-3">
                                <div><strong>Name:</strong> {accused.name || 'Unknown'}</div>
                                {accused.description && <div><strong>Description:</strong> {accused.description}</div>}
                            </div>
                        </div>
                    ))}
                </Card.Body>
            </Card>

            {/* Incident */}
            <Card className="mb-3">
                <Card.Header className="bg-body-secondary">
                    <strong>Incident Details</strong>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}><strong>Date:</strong> {data.incident.dateOfOccurrence}</Col>
                        <Col md={6}><strong>Time:</strong> {data.incident.timeOfOccurrence}</Col>
                        <Col md={12}><strong>Place:</strong> {data.incident.placeOfOccurrence}</Col>
                        <Col md={6}><strong>Nature:</strong> {data.incident.natureOfOffence}</Col>
                        <Col md={6}>
                            <strong>Type:</strong>{' '}
                            <Badge bg={data.incident.isCognizable ? 'danger' : 'warning'}>
                                {data.incident.isCognizable ? 'Cognizable' : 'Non-Cognizable'}
                            </Badge>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Legal Sections */}
            <Card className="mb-3">
                <Card.Header className="bg-body-secondary">
                    <strong>Legal Sections Applied ({data.legalSections.length})</strong>
                </Card.Header>
                <Card.Body>
                    {data.legalSections.length === 0 ? (
                        <div className="text-muted">No sections added</div>
                    ) : (
                        <ul className="mb-0">
                            {data.legalSections.map((section, index) => (
                                <li key={index}>
                                    <Badge bg="primary" className="me-2">{section.act}</Badge>
                                    Section {section.section} - {section.title}
                                </li>
                            ))}
                        </ul>
                    )}
                </Card.Body>
            </Card>

            {/* Complaint */}
            <Card className="mb-3">
                <Card.Header className="bg-body-secondary">
                    <strong>Complaint Narrative</strong>
                </Card.Header>
                <Card.Body>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{data.complaint}</div>
                </Card.Body>
            </Card>

            {/* Witnesses */}
            {data.witnesses.length > 0 && (
                <Card className="mb-3">
                    <Card.Header className="bg-body-secondary">
                        <strong>Witnesses ({data.witnesses.length})</strong>
                    </Card.Header>
                    <Card.Body>
                        {data.witnesses.map((witness, index) => (
                            <div key={index} className={index > 0 ? 'mt-2 pt-2 border-top' : ''}>
                                {witness.name} - {witness.mobile}
                            </div>
                        ))}
                    </Card.Body>
                </Card>
            )}

            {/* Officer Details */}
            <Card className="mb-3">
                <Card.Header className="bg-body-secondary">
                    <strong>Officer Details</strong>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Rank</Form.Label>
                                <Form.Select
                                    value={data.officer.rank}
                                    onChange={(e) => handleOfficerChange('rank', e.target.value)}
                                >
                                    <option value="Sub-Inspector">Sub-Inspector</option>
                                    <option value="Inspector">Inspector</option>
                                    <option value="Deputy Superintendent">Deputy Superintendent</option>
                                    <option value="Superintendent">Superintendent</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Badge Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Badge number"
                                    value={data.officer.badgeNumber}
                                    onChange={(e) => handleOfficerChange('badgeNumber', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <div className="alert alert-success">
                <strong>Ready to file!</strong> Click "Generate & File FIR" below to create the official document.
            </div>
        </div>
    );
};

export default ReviewStep;
