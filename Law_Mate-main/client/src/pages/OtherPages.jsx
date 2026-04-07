import { Container } from 'react-bootstrap';

const PlaceholderPage = ({ title }) => (
    <Container className="py-4 text-center">
        <h2 className="mb-4">{title}</h2>
        <p className="lead text-muted">This feature is coming soon.</p>
    </Container>
);

export const DocDrafter = () => <PlaceholderPage title="Document Drafter" />;
export const History = () => <PlaceholderPage title="History" />;
