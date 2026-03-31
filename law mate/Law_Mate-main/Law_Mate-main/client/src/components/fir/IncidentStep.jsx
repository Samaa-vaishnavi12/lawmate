import { Form, Row, Col } from 'react-bootstrap';

const IncidentStep = ({ data, updateData }) => {
    const handleChange = (field, value) => {
        updateData('incident', {
            ...data.incident,
            [field]: value
        });
    };

    return (
        <div>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Date of Occurrence *</Form.Label>
                        <Form.Control
                            type="date"
                            value={data.incident.dateOfOccurrence}
                            onChange={(e) => handleChange('dateOfOccurrence', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Time of Occurrence *</Form.Label>
                        <Form.Control
                            type="time"
                            value={data.incident.timeOfOccurrence}
                            onChange={(e) => handleChange('timeOfOccurrence', e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Place of Occurrence *</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="e.g., Near Anna Nagar Signal, Chennai"
                    value={data.incident.placeOfOccurrence}
                    onChange={(e) => handleChange('placeOfOccurrence', e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Nature of Offence *</Form.Label>
                <Form.Select
                    value={data.incident.natureOfOffence}
                    onChange={(e) => handleChange('natureOfOffence', e.target.value)}
                    required
                >
                    <option value="">Select Offence Type</option>
                    <option value="Theft">Theft</option>
                    <option value="Robbery">Robbery</option>
                    <option value="Assault">Assault</option>
                    <option value="Murder">Murder</option>
                    <option value="Rash and negligent driving">Rash and Negligent Driving</option>
                    <option value="Cheating">Cheating</option>
                    <option value="Kidnapping">Kidnapping</option>
                    <option value="Rape">Rape</option>
                    <option value="Dowry harassment">Dowry Harassment</option>
                    <option value="Other">Other</option>
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Check
                    type="checkbox"
                    label="Cognizable Offence"
                    checked={data.incident.isCognizable}
                    onChange={(e) => handleChange('isCognizable', e.target.checked)}
                />
                <Form.Text className="text-muted">
                    A cognizable offence is one where police can arrest without a warrant.
                </Form.Text>
            </Form.Group>
        </div>
    );
};

export default IncidentStep;
