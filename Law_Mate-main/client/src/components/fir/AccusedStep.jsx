import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaPlus, FaTrash } from 'react-icons/fa';

const AccusedStep = ({ data, updateData }) => {
    const handleAddAccused = () => {
        updateData('accused', [
            ...data.accused,
            { name: '', fatherName: '', age: '', description: '', address: '' }
        ]);
    };

    const handleRemoveAccused = (index) => {
        const newAccused = data.accused.filter((_, i) => i !== index);
        updateData('accused', newAccused);
    };

    const handleChange = (index, field, value) => {
        const newAccused = [...data.accused];
        newAccused[index][field] = value;
        updateData('accused', newAccused);
    };

    return (
        <div>
            {data.accused.map((accused, index) => (
                <div key={index} className="mb-4 p-3 border border-secondary rounded shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>Accused #{index + 1}</h6>
                        {data.accused.length > 1 && (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveAccused(index)}
                            >
                                <FaTrash /> Remove
                            </Button>
                        )}
                    </div>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Unknown (if not known)"
                                    value={accused.name}
                                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Father's Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="If known"
                                    value={accused.fatherName}
                                    onChange={(e) => handleChange(index, 'fatherName', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Age (Approximate)</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Approximate age"
                            value={accused.age}
                            onChange={(e) => handleChange(index, 'age', e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Physical Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            placeholder="e.g., Male, approx. 30 years, driving a white car"
                            value={accused.description}
                            onChange={(e) => handleChange(index, 'description', e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Address (if known)</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Not known"
                            value={accused.address}
                            onChange={(e) => handleChange(index, 'address', e.target.value)}
                        />
                    </Form.Group>
                </div>
            ))}

            <Button variant="outline-primary" onClick={handleAddAccused}>
                <FaPlus className="me-2" />
                Add Another Accused
            </Button>
        </div>
    );
};

export default AccusedStep;
