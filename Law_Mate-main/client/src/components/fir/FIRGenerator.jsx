import { useState, useEffect } from 'react';
import { Card, ProgressBar, Button, Alert, Row, Col } from 'react-bootstrap';
import { FaSave, FaFilePdf, FaCheck } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import BasicInfoStep from './BasicInfoStep';
import ComplainantStep from './ComplainantStep';
import AccusedStep from './AccusedStep';
import IncidentStep from './IncidentStep';
import LegalSectionsStep from './LegalSectionsStep';
import ComplaintStep from './ComplaintStep';
import WitnessesStep from './WitnessesStep';
import ReviewStep from './ReviewStep';
import LoadDraftModal from './LoadDraftModal';
import PDFPreviewModal from './PDFPreviewModal';
import API_URL from '../../config';
import { generateFIRPDF } from '../../utils/firPDFGenerator';
import { validateFIRData, validateBeforeFiling } from '../../utils/firValidation';

const FIRGenerator = () => {
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const [currentStep, setCurrentStep] = useState(1);
    const [firData, setFirData] = useState({
        firNumber: '',
        policeStation: { name: '', district: '', state: 'Tamil Nadu' },
        complainant: {
            name: '', fatherName: '', age: '', occupation: '',
            address: '', mobile: '', email: '', idProof: { type: '', number: '' }
        },
        accused: [{ name: 'Unknown', fatherName: '', age: '', description: '', address: '' }],
        incident: {
            dateOfOccurrence: '', timeOfOccurrence: '',
            placeOfOccurrence: '', natureOfOffence: '', isCognizable: true
        },
        legalSections: [],
        complaint: '',
        witnesses: [],
        propertyDamage: { description: '', estimatedLoss: 0 },
        officer: { name: '', rank: 'Sub-Inspector', badgeNumber: '' }
    });
    const [savedDraftId, setSavedDraftId] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [showLoadDraft, setShowLoadDraft] = useState(false);
    const [showPDFPreview, setShowPDFPreview] = useState(false);
    const [pdfBlob, setPdfBlob] = useState(null);

    const totalSteps = 8;
    const progress = (currentStep / totalSteps) * 100;

    const steps = [
        { number: 1, title: 'Basic Information', component: BasicInfoStep },
        { number: 2, title: 'Complainant Details', component: ComplainantStep },
        { number: 3, title: 'Accused Details', component: AccusedStep },
        { number: 4, title: 'Incident Details', component: IncidentStep },
        { number: 5, title: 'Legal Sections', component: LegalSectionsStep },
        { number: 6, title: 'Complaint Narrative', component: ComplaintStep },
        { number: 7, title: 'Witnesses & Evidence', component: WitnessesStep },
        { number: 8, title: 'Review & Generate', component: ReviewStep }
    ];

    const CurrentStepComponent = steps[currentStep - 1].component;

    const loadDraft = (draft) => {
        setFirData({
            firNumber: draft.firNumber || '',
            policeStation: draft.policeStation || { name: '', district: '', state: 'Tamil Nadu' },
            complainant: draft.complainant || {
                name: '', fatherName: '', age: '', occupation: '',
                address: '', mobile: '', email: '', idProof: { type: '', number: '' }
            },
            accused: draft.accused || [{ name: 'Unknown', fatherName: '', age: '', description: '', address: '' }],
            incident: draft.incident || {
                dateOfOccurrence: '', timeOfOccurrence: '',
                placeOfOccurrence: '', natureOfOffence: '', isCognizable: true
            },
            legalSections: draft.legalSections || [],
            complaint: draft.complaint || '',
            witnesses: draft.witnesses || [],
            propertyDamage: draft.propertyDamage || { description: '', estimatedLoss: 0 },
            officer: draft.officer || { name: '', rank: 'Sub-Inspector', badgeNumber: '' }
        });
        setSavedDraftId(draft._id);
        setShowLoadDraft(false);
        setMessage('Draft loaded successfully!');
        setTimeout(() => setMessage(null), 3000);
    };

    // Load FIR for editing if edit parameter is present
    useEffect(() => {
        if (editId) {
            loadFIRForEdit(editId);
        }
    }, [editId]);

    const getStoredUser = () => JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));

    const loadFIRForEdit = async (id) => {
        try {
            const user = getStoredUser();
            if (!user?.token) return;
            const token = user.token;

            const response = await fetch(`${API_URL}/api/fir/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                loadDraft(data);
                setMessage('Draft loaded for editing');
                setTimeout(() => setMessage(null), 3000);
            } else {
                setError(data.message || 'Failed to load FIR');
            }
        } catch (err) {
            console.error('Load FIR error:', err);
            setError('Failed to load FIR for editing');
        }
    };

    // Auto-save every 2 minutes
    useEffect(() => {
        const autoSave = setInterval(() => {
            if (currentStep > 1) {
                saveDraft();
            }
        }, 120000); // 2 minutes

        return () => clearInterval(autoSave);
    }, [firData]);

    const updateFirData = (section, data) => {
        setFirData(prev => ({
            ...prev,
            [section]: data
        }));
    };

    const saveDraft = async () => {
        try {
            const user = getStoredUser();
            if (!user?.token) return;
            const token = user.token;

            const url = savedDraftId 
                ? `${API_URL}/api/fir/${savedDraftId}`
                : `${API_URL}/api/fir`;
            
            const method = savedDraftId ? 'PUT' : 'POST';

            console.log('Saving draft:', { url, method, firData }); // Debug log

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...firData, status: 'draft' })
            });

            const data = await response.json();
            console.log('Save response:', data); // Debug log

            if (response.ok) {
                if (!savedDraftId) setSavedDraftId(data._id);
                setMessage('Draft saved successfully');
                setTimeout(() => setMessage(null), 3000);
            } else {
                console.error('Save error:', data); // Debug log
                setError(data.message || 'Failed to save draft');
                setTimeout(() => setError(null), 5000);
            }
        } catch (err) {
            console.error('Save draft error:', err);
            setError('Failed to save draft: ' + err.message);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleNext = () => {
        // Validate current step before proceeding
        const validationErrors = validateFIRData(firData, currentStep);
        
        if (validationErrors.length > 0) {
            setError(
                <div>
                    <strong>Please fix the following errors:</strong>
                    <ul className="mb-0 mt-2">
                        {validationErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                        ))}
                    </ul>
                </div>
            );
            window.scrollTo(0, 0);
            return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            setError(null);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleJumpToStep = (stepNumber) => {
        setCurrentStep(stepNumber);
        window.scrollTo(0, 0);
    };

    const generatePDF = async () => {
        // Validate all fields before filing
        const validationErrors = validateBeforeFiling(firData);
        
        if (validationErrors.length > 0) {
            setError(
                <div>
                    <strong>Cannot file FIR. Please complete all required fields:</strong>
                    <ul className="mb-0 mt-2">
                        {validationErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                        ))}
                    </ul>
                </div>
            );
            window.scrollTo(0, 0);
            return;
        }

        try {
            const user = getStoredUser();
            if (!user?.name) return;
            
            // Set officer name from logged-in user
            const updatedFirData = {
                ...firData,
                officer: {
                    ...firData.officer,
                    name: user.name
                }
            };

            // Generate PDF for preview
            setMessage('Generating PDF preview...');
            const pdf = generateFIRPDF(updatedFirData);
            const blob = pdf.output('blob');
            setPdfBlob(blob);
            setShowPDFPreview(true);
            setMessage(null);
        } catch (err) {
            console.error('Generate PDF error:', err);
            setError('Failed to generate PDF: ' + err.message);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const user = getStoredUser();
            if (!user?.token) return;
            const token = user.token;

            // Set officer name from logged-in user
            const updatedFirData = {
                ...firData,
                officer: {
                    ...firData.officer,
                    name: user.name
                }
            };

            // Prepare full data for submission
            const submissionData = {
                ...firData,
                rank: firData.officer.rank,
                badgeNumber: firData.officer.badgeNumber
            };

            let response;
            if (savedDraftId) {
                // Update and file existing draft
                response = await fetch(`${API_URL}/api/fir/${savedDraftId}/file`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(submissionData)
                });
            } else {
                // Create new FIR directly as filed
                response = await fetch(`${API_URL}/api/fir`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...submissionData,
                        status: 'filed'
                    })
                });
            }

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Failed to save FIR to database');
                return;
            }

            const savedFIR = await response.json();
            
            // Create final data for PDF combining local data and server-generated fields
            const finalFirData = {
                ...firData,
                firNumber: savedFIR.firNumber,
                registrationDate: savedFIR.registrationDate,
                officer: {
                    ...firData.officer,
                    name: user.name
                }
            };

            // Download the PDF
            const pdf = generateFIRPDF(finalFirData);
            const fileName = `FIR_${savedFIR.firNumber || 'Filed'}_${finalFirData.complainant.name.replace(/\s+/g, '_')}.pdf`;
            pdf.save(fileName);
            
            setShowPDFPreview(false);
            setMessage('FIR filed and saved to database successfully! PDF downloaded.');
            
            // Redirect to history after 3 seconds
            setTimeout(() => {
                window.location.href = '/fir-history';
            }, 3000);
        } catch (err) {
            console.error('Download PDF error:', err);
            setError('Failed to download PDF: ' + err.message);
        }
    };

    const handleEditFromPreview = () => {
        setShowPDFPreview(false);
        setPdfBlob(null);
        // User stays on current step to make edits
    };

    return (
        <div>
            {/* Progress Bar */}
            <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                    <small className="text-muted">Step {currentStep} of {totalSteps}</small>
                    <small className="text-muted">{Math.round(progress)}% Complete</small>
                </div>
                <ProgressBar now={progress} variant="primary" />
            </div>

            {/* Step Navigator */}
            <div className="mb-4 d-none d-md-block">
                <Row className="g-2">
                    {steps.map(step => (
                        <Col key={step.number} xs={3} lg={1.5}>
                            <Button
                                variant={currentStep === step.number ? 'primary' : currentStep > step.number ? 'success' : 'secondary'}
                                size="sm"
                                className="w-100 border-0 shadow-sm"
                                onClick={() => handleJumpToStep(step.number)}
                            >
                                {currentStep > step.number ? <FaCheck /> : step.number}
                            </Button>
                            <small className="d-block text-center mt-1 text-muted">{step.title}</small>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Messages */}
            {message && <Alert variant="success" dismissible onClose={() => setMessage(null)}>{message}</Alert>}
            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {/* Current Step Content */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-primary text-white py-3">
                    <h5 className="mb-0">Step {currentStep}: {steps[currentStep - 1].title}</h5>
                </Card.Header>
                <Card.Body>
                    <CurrentStepComponent
                        data={firData}
                        updateData={updateFirData}
                        onNext={handleNext}
                    />
                </Card.Body>
            </Card>

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between">
                <div className="d-flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowLoadDraft(true)}
                    >
                        Load Draft
                    </Button>
                </div>

                <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={saveDraft}>
                        <FaSave className="me-2" />
                        Save Draft
                    </Button>

                    {currentStep === totalSteps ? (
                        <Button variant="success" onClick={generatePDF}>
                            <FaFilePdf className="me-2" />
                            Preview & File FIR
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={handleNext}>
                            Next
                        </Button>
                    )}
                </div>
            </div>

            {/* Load Draft Modal */}
            <LoadDraftModal
                show={showLoadDraft}
                onHide={() => setShowLoadDraft(false)}
                onLoadDraft={loadDraft}
            />

            {/* PDF Preview Modal */}
            <PDFPreviewModal
                show={showPDFPreview}
                onHide={() => setShowPDFPreview(false)}
                pdfBlob={pdfBlob}
                onDownload={handleDownloadPDF}
                onEdit={handleEditFromPreview}
            />
        </div>
    );
};

export default FIRGenerator;
