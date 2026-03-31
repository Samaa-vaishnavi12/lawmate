import { Form } from 'react-bootstrap';

const ComplaintStep = ({ data, updateData }) => {
    const handleChange = (value) => {
        updateData('complaint', value);
    };

    const templates = {
        accident: `I, [Complainant Name], hereby state that on [Date] at about [Time], while I was riding my two-wheeler bearing registration number [Vehicle Number] near [Location], a car coming at high speed from the wrong side hit my vehicle.

Due to the impact, I fell on the road and sustained injuries on my [body parts]. The driver of the car did not stop to help and fled from the scene immediately.

My vehicle was damaged due to the accident. I request the police to take necessary legal action against the accused as per law.`,
        
        theft: `I, [Complainant Name], hereby state that on [Date] at about [Time], I discovered that my [items stolen] were missing from [location].

The estimated value of the stolen items is approximately ₹[amount]. I suspect [if any suspects]. I request the police to investigate this matter and take necessary legal action.`,
        
        assault: `I, [Complainant Name], hereby state that on [Date] at about [Time], at [location], I was assaulted by [accused details].

The accused [describe the assault]. I sustained injuries [describe injuries]. I request the police to take necessary legal action against the accused.`
    };

    const useTemplate = (template) => {
        handleChange(template);
    };

    return (
        <div>
            <Form.Group className="mb-3">
                <Form.Label>Complaint Narrative *</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={12}
                    placeholder="Describe the incident in detail..."
                    value={data.complaint}
                    onChange={(e) => handleChange(e.target.value)}
                    required
                />
                <Form.Text className="text-muted">
                    {data.complaint.length} characters | Write a detailed account of the incident
                </Form.Text>
            </Form.Group>

            <div className="alert alert-info">
                <strong>Quick Templates:</strong> Click to use a template and customize it
                <div className="mt-2 d-flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => useTemplate(templates.accident)}
                    >
                        Road Accident
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => useTemplate(templates.theft)}
                    >
                        Theft
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => useTemplate(templates.assault)}
                    >
                        Assault
                    </button>
                </div>
            </div>

            <div className="alert alert-warning">
                <small>
                    <strong>Important:</strong> The complaint should be written in first person and include:
                    <ul className="mb-0 mt-2">
                        <li>What happened (sequence of events)</li>
                        <li>When and where it happened</li>
                        <li>Who was involved</li>
                        <li>Any injuries or damages</li>
                        <li>Request for police action</li>
                    </ul>
                </small>
            </div>
        </div>
    );
};

export default ComplaintStep;
