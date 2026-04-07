import { Modal, Button } from 'react-bootstrap';
import { FaDownload, FaEdit } from 'react-icons/fa';

const PDFPreviewModal = ({ show, onHide, pdfBlob, onDownload, onEdit }) => {
    return (
        <Modal show={show} onHide={onHide} size="xl" fullscreen="lg-down">
            <Modal.Header closeButton>
                <Modal.Title>FIR Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {pdfBlob && (
                    <iframe
                        src={URL.createObjectURL(pdfBlob)}
                        style={{ width: '100%', height: '80vh', border: 'none' }}
                        title="FIR PDF Preview"
                    />
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onEdit}>
                    <FaEdit className="me-2" />
                    Edit FIR
                </Button>
                <Button variant="success" onClick={onDownload}>
                    <FaDownload className="me-2" />
                    Download PDF
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PDFPreviewModal;
