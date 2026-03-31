import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';

const WitnessesStep = ({ data, updateData }) => {
    const handleAddWitness = () => {
        updateData('witnesses', [
            ...data.witnesses,
            { name: '', mobile: '', address: '' }
        ]);
    };

    const handleRemoveWitness = (index) => {
        const newWitnesses = data.witnesses.filter((_, i) => i !== index);
        updateData('witnesses', newWitnesses);
    };

    const handleWitnessChange = (index, field, value) => {
        const newWitnesses = [...data.witnesses];
        newWitnesses[index][field] = value;
        updateData('witnesses', newWitnesses);
    };

    const handlePropertyChange = (field, value) => {
        updateData('propertyDamage', {
            ...data.propertyDamage,
            [field]: value
        });
    };

    return (
        <div>
            {/* Witnesses Section */}
            <h6 className="mb-3">Witnesses</h6>
            {data.witnesses.length === 0 ? (
                <div className="alert alert-secondary">
                    No witnesses added. Click "Add Witness" if there were any witnesses to the incident.
                </div>
            ) : (
                data.witnesses.map((witness, index) => (
                    <div key={index} className="mb-3 p-3 border border-secondary rounded shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <strong>Witness #{index + 1}</strong>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveWitness(index)}
                            >
                                <FaTrash /> Remove
                            </Button>
                        </div>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Witness name"
                                        value={witness.name}
                                        onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Mobile Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        placeholder="9XXXXXXXXX"
                                        value={witness.mobile}
                                        onChange={(e) => handleWitnessChange(index, 'mobile', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Address</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Witness address"
                                value={witness.address}
                                onChange={(e) => handleWitnessChange(index, 'address', e.target.value)}
                            />
                        </Form.Group>
                    </div>
                ))
            )}

            <Button variant="outline-primary" onClick={handleAddWitness} className="mb-4">
                <FaPlus className="me-2" />
                Add Witness
            </Button>

            <hr className="my-4" />

            {/* Property Damage Section */}
            <h6 className="mb-3">Property / Damage Details</h6>
            <Form.Group className="mb-3">
                <Form.Label>Description of Property / Damage</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="e.g., Two-wheeler TN-XX-1234, front headlight broken, scratches on body"
                    value={data.propertyDamage.description}
                    onChange={(e) => handlePropertyChange('description', e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Estimated Loss (₹)</Form.Label>
                <Form.Control
                    type="number"
                    placeholder="12000"
                    value={data.propertyDamage.estimatedLoss}
                    onChange={(e) => handlePropertyChange('estimatedLoss', e.target.value)}
                />
            </Form.Group>
        </div>
    );
};

export default WitnessesStep;
