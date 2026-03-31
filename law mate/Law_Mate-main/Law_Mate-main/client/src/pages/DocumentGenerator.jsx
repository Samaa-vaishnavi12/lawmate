import { useState } from 'react';
import { Container, Tabs, Tab, Card } from 'react-bootstrap';
import FIRGenerator from '../components/fir/FIRGenerator';

const DocumentGenerator = () => {
    const [activeTab, setActiveTab] = useState('fir');

    return (
        <Container className="py-4">
            <h2 className="mb-4">Document Generator</h2>
            <Card className="shadow-sm">
                <Card.Body>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-4"
                    >
                        <Tab eventKey="fir" title="FIR (First Information Report)">
                            <FIRGenerator />
                        </Tab>
                        <Tab eventKey="complaint" title="Complaint Letter" disabled>
                            <p className="text-muted">Coming soon...</p>
                        </Tab>
                        <Tab eventKey="affidavit" title="Affidavit" disabled>
                            <p className="text-muted">Coming soon...</p>
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default DocumentGenerator;
