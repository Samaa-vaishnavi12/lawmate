// Validation utility for FIR data
export const validateFIRData = (firData, currentStep) => {
    const errors = [];

    // Step 1: Basic Information
    if (currentStep >= 1) {
        if (!firData.policeStation?.name?.trim()) {
            errors.push('Police Station name is required');
        }
        if (!firData.policeStation?.district?.trim()) {
            errors.push('District is required');
        }
    }

    // Step 2: Complainant Details
    if (currentStep >= 2) {
        if (!firData.complainant?.name?.trim()) {
            errors.push('Complainant name is required');
        }
        if (!firData.complainant?.fatherName?.trim()) {
            errors.push("Complainant's father name is required");
        }
        if (!firData.complainant?.age || firData.complainant.age < 1 || firData.complainant.age > 150) {
            errors.push('Valid complainant age is required (1-150)');
        }
        if (!firData.complainant?.address?.trim()) {
            errors.push('Complainant address is required');
        }
        if (!firData.complainant?.mobile?.trim()) {
            errors.push('Complainant mobile number is required');
        } else if (!/^[0-9]{10}$/.test(firData.complainant.mobile.replace(/\s/g, ''))) {
            errors.push('Mobile number must be 10 digits');
        }
    }

    // Step 4: Incident Details
    if (currentStep >= 4) {
        if (!firData.incident?.dateOfOccurrence) {
            errors.push('Date of occurrence is required');
        }
        if (!firData.incident?.timeOfOccurrence?.trim()) {
            errors.push('Time of occurrence is required');
        }
        if (!firData.incident?.placeOfOccurrence?.trim()) {
            errors.push('Place of occurrence is required');
        }
        if (!firData.incident?.natureOfOffence?.trim()) {
            errors.push('Nature of offence is required');
        }
    }

    // Step 6: Complaint
    if (currentStep >= 6) {
        if (!firData.complaint?.trim()) {
            errors.push('Complaint narrative is required');
        } else if (firData.complaint.trim().length < 50) {
            errors.push('Complaint must be at least 50 characters');
        }
    }

    return errors;
};

// Validate before filing (all steps must be complete)
export const validateBeforeFiling = (firData) => {
    const errors = validateFIRData(firData, 8);

    // Additional checks for filing
    if (!firData.legalSections || firData.legalSections.length === 0) {
        errors.push('At least one legal section must be added');
    }

    if (!firData.officer?.rank) {
        errors.push('Officer rank is required');
    }

    return errors;
};
