import { useState } from 'react';
import { Form, Button, ListGroup, Badge, Spinner, Row, Col, Card } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import API_URL from '../../config';

const LegalSectionsStep = ({ data, updateData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const searchSections = async () => {
        if (!searchTerm.trim()) return;

        setSearching(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
            const response = await fetch(`${API_URL}/api/search?law=all&q=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    'Authorization': user?.token ? `Bearer ${user.token}` : ''
                }
            });
            const result = await response.json();
            setSearchResults(result.results || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const addSection = (section) => {
        // Check if already added
        const exists = data.legalSections.some(
            s => s.act === section.law && s.section === section.section
        );

        if (!exists) {
            updateData('legalSections', [
                ...data.legalSections,
                {
                    act: section.law.toUpperCase(),
                    section: section.section,
                    title: section.title,
                    description: section.description
                }
            ]);
        }
    };

    const removeSection = (index) => {
        const newSections = data.legalSections.filter((_, i) => i !== index);
        updateData('legalSections', newSections);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchSections();
        }
    };

    return (
        <div>
            {/* Search Interface */}
            <Card className="mb-4 bg-body-secondary border-0 shadow-sm">
                <Card.Body>
                    <h6 className="mb-3">Search Legal Sections</h6>
                    <Row>
                        <Col md={10}>
                            <Form.Control
                                type="text"
                                placeholder="Search by keywords (e.g., 'rash driving', 'theft', 'assault')"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </Col>
                        <Col md={2}>
                            <Button
                                variant="primary"
                                className="w-100"
                                onClick={searchSections}
                                disabled={searching || !searchTerm.trim()}
                            >
                                {searching ? <Spinner size="sm" animation="border" /> : <><FaSearch /> Search</>}
                            </Button>
                        </Col>
                    </Row>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mt-3">
                            <small className="text-muted">Found {searchResults.length} relevant sections:</small>
                            <ListGroup className="mt-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {searchResults.map((result, index) => (
                                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center mb-2">
                                                <Badge bg="secondary" className="me-2">{result.law.toUpperCase()}</Badge>
                                                <strong>Section {result.section}</strong>
                                                <Badge bg="info" className="ms-2">{(result.score * 100).toFixed(0)}% Match</Badge>
                                            </div>
                                            <div className="mb-2"><strong>{result.title}</strong></div>
                                            {result.description && (
                                                <small className="text-muted d-block" style={{ 
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {result.description}
                                                </small>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => addSection(result)}
                                            className="ms-3"
                                        >
                                            <FaPlus /> Add
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Added Sections */}
            <h6 className="mb-3">Selected Legal Sections ({data.legalSections.length})</h6>
            {data.legalSections.length === 0 ? (
                <div className="alert alert-warning">
                    No legal sections added yet. Use the search above to find and add relevant sections.
                </div>
            ) : (
                <ListGroup>
                    {data.legalSections.map((section, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                                <div className="d-flex align-items-center mb-1">
                                    <Badge bg="primary" className="me-2">{section.act}</Badge>
                                    <strong>Section {section.section}</strong>
                                </div>
                                <div>{section.title}</div>
                            </div>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeSection(index)}
                            >
                                <FaTrash />
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {/* Common Sections Quick Add */}
            <div className="mt-4">
                <small className="text-muted d-block mb-2">Quick Add Common Sections:</small>
                <div className="d-flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => addSection({
                            law: 'IPC',
                            section: '279',
                            title: 'Rash driving or riding on a public way',
                            description: 'Rash driving'
                        })}
                    >
                        IPC 279 - Rash Driving
                    </Button>
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => addSection({
                            law: 'IPC',
                            section: '337',
                            title: 'Causing hurt by act endangering life or personal safety of others',
                            description: 'Causing hurt'
                        })}
                    >
                        IPC 337 - Causing Hurt
                    </Button>
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => addSection({
                            law: 'MVA',
                            section: '184',
                            title: 'Driving dangerously',
                            description: 'Dangerous driving'
                        })}
                    >
                        MVA 184 - Dangerous Driving
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LegalSectionsStep;
