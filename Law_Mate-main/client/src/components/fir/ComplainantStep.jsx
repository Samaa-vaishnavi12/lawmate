import { Form, Row, Col } from 'react-bootstrap';

const ComplainantStep = ({ data, updateData }) => {
    const handleChange = (field, value) => {
        updateData('complainant', {
            ...data.complainant,
            [field]: value
        });
    };

    const handleIdProofChange = (field, value) => {
        updateData('complainant', {
            ...data.complainant,
            idProof: {
                ...data.complainant.idProof,
                [field]: value
            }
        });
    };

    return (
        <div>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Full Name *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g., Akhil R"
                            value={data.complainant.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Father's / Guardian's Name *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g., Ramesh"
                            value={data.complainant.fatherName}
                            onChange={(e) => handleChange('fatherName', e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Age *</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="28"
                            value={data.complainant.age}
                            onChange={(e) => handleChange('age', e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={8}>
                    <Form.Group className="mb-3">
                        <Form.Label>Occupation</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g., Software Developer"
                            value={data.complainant.occupation}
                            onChange={(e) => handleChange('occupation', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Complete Address *</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="No. 25, Anna Nagar East, Chennai – 600102"
                    value={data.complainant.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Mobile Number *</Form.Label>
                        <Form.Control
                            type="tel"
                            placeholder="9XXXXXXXXX"
                            value={data.complainant.mobile}
                            onChange={(e) => handleChange('mobile', e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email (Optional)</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="akhil@example.com"
                            value={data.complainant.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>ID Proof Type</Form.Label>
                        <Form.Select
                            value={data.complainant.idProof.type}
                            onChange={(e) => handleIdProofChange('type', e.target.value)}
                        >
                            <option value="">Select ID Type</option>
                            <option value="Aadhaar">Aadhaar Card</option>
                            <option value="PAN">PAN Card</option>
                            <option value="Driving License">Driving License</option>
                            <option value="Voter ID">Voter ID</option>
                            <option value="Passport">Passport</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>ID Proof Number</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter ID number"
                            value={data.complainant.idProof.number}
                            onChange={(e) => handleIdProofChange('number', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default ComplainantStep;
