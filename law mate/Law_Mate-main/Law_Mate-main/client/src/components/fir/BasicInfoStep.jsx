import { Form, Row, Col } from 'react-bootstrap';

const BasicInfoStep = ({ data, updateData }) => {
    const handleChange = (field, value) => {
        updateData('policeStation', {
            ...data.policeStation,
            [field]: value
        });
    };

    const handleFIRNumberChange = (value) => {
        updateData('firNumber', value);
    };

    return (
        <div>
            <Form.Group className="mb-3">
                <Form.Label>FIR Number <span className="text-muted">(Leave blank for auto-generation)</span></Form.Label>
                <Form.Control
                    type="text"
                    placeholder="e.g., 0123/2026"
                    value={data.firNumber}
                    onChange={(e) => handleFIRNumberChange(e.target.value)}
                />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Police Station Name *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g., T. Nagar Police Station"
                            value={data.policeStation.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Label>District *</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="e.g., Chennai"
                        value={data.policeStation.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        required
                    />
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>State *</Form.Label>
                <Form.Control
                    type="text"
                    value={data.policeStation.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    required
                />
            </Form.Group>

            <div className="alert alert-info">
                <small>
                    <strong>Note:</strong> Fields marked with * are required. FIR number will be auto-generated if left blank.
                </small>
            </div>
        </div>
    );
};

export default BasicInfoStep;
