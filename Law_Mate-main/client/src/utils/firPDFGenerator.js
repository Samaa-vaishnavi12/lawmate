import jsPDF from 'jspdf';

export const generateFIRPDF = (firData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPos = margin;

    // Helper function to add centered text
    const addCenteredText = (text, y, fontSize = 12, isBold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    // Helper function to add line separator
    const addLine = (y) => {
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
    };

    // Helper function to add section header
    const addSectionHeader = (text, y) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(text, margin, y);
        addLine(y + 2);
        return y + 8;
    };

    // Helper function to add field with robust null/undefined/empty string/string "null" handling
    const addField = (label, value, y, labelWidth = 50) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');

        let displayValue = 'N/A';
        if (value !== undefined && value !== null && value !== '' && value !== 'null' && value !== 'NULL') {
            displayValue = String(value);
        }

        doc.text(': ' + displayValue, margin + labelWidth, y);
        return y + lineHeight;
    };

    // Helper function to wrap text
    const addWrappedText = (text, y, maxWidth) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        let safeText = '---';
        if (text !== undefined && text !== null && text !== '' && text !== 'null' && text !== 'NULL') {
            safeText = String(text);
        }

        const lines = doc.splitTextToSize(safeText, maxWidth);
        doc.text(lines, margin, y);
        return y + (lines.length * lineHeight);
    };

    // ========== HEADER ==========
    addCenteredText('FIRST INFORMATION REPORT (FIR)', yPos, 14, true);
    yPos += 8;
    addCenteredText('(Under Section 154 of the Code of Criminal Procedure)', yPos, 10);
    yPos += 10;
    addLine(yPos);
    yPos += 8;

    // ========== FIR DETAILS ==========
    yPos = addField('FIR No.', firData.firNumber, yPos, 40);
    yPos = addField('Police Station', firData.policeStation?.name, yPos, 40);
    yPos = addField('District', firData.policeStation?.district, yPos, 40);
    yPos = addField('State', firData.policeStation?.state || 'Tamil Nadu', yPos, 40);

    const regDate = firData.registrationDate ? new Date(firData.registrationDate).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
    yPos = addField('Registration Date', regDate, yPos, 40);
    yPos += 5;
    addLine(yPos);
    yPos += 8;

    // ========== COMPLAINANT DETAILS ==========
    yPos = addSectionHeader('1. DETAILS OF COMPLAINANT / INFORMANT', yPos);
    yPos = addField('Name', firData.complainant?.name, yPos, 40);
    yPos = addField("Father's Name", firData.complainant?.fatherName, yPos, 40);
    yPos = addField('Age', firData.complainant?.age ? firData.complainant.age + ' Years' : '---', yPos, 40);
    yPos = addField('Occupation', firData.complainant?.occupation, yPos, 40);
    yPos = addField('Address', firData.complainant?.address, yPos, 40);
    yPos = addField('Mobile Number', firData.complainant?.mobile, yPos, 40);
    yPos = addField('Email', firData.complainant?.email, yPos, 40);

    if (firData.complainant?.idProof?.type || firData.complainant?.idProof?.number) {
        yPos = addField('ID Proof', `${firData.complainant.idProof.type || 'N/A'}: ${firData.complainant.idProof.number || '---'}`, yPos, 40);
    }

    yPos += 5;
    addLine(yPos);
    yPos += 8;

    // Check if we need a new page
    if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = margin;
    }

    // ========== ACCUSED DETAILS ==========
    yPos = addSectionHeader('2. DETAILS OF ACCUSED', yPos);
    if (firData.accused && firData.accused.length > 0) {
        firData.accused.forEach((accused, index) => {
            if (index > 0) yPos += 5;
            yPos = addField(`Accused #${index + 1} Name`, accused.name || 'Unknown', yPos, 40);
            yPos = addField("Father's Name", accused.fatherName, yPos, 40);
            yPos = addField('Age', accused.age ? accused.age + ' Years (Approx.)' : '---', yPos, 40);

            if (accused.description) {
                doc.setFont('helvetica', 'bold');
                doc.text('Description', margin, yPos);
                yPos += lineHeight;
                yPos = addWrappedText(accused.description, yPos, pageWidth - 2 * margin);
            }
            yPos = addField('Address', accused.address, yPos, 40);
        });
    } else {
        doc.setFont('helvetica', 'italic');
        doc.text('No accused details specified', margin, yPos);
        yPos += lineHeight;
    }
    yPos += 5;
    addLine(yPos);
    yPos += 8;

    // Check if we need a new page
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
    }

    // ========== INCIDENT DETAILS ==========
    yPos = addSectionHeader('3. DATE, TIME & PLACE OF OCCURRENCE', yPos);
    const incidentDate = firData.incident?.dateOfOccurrence ? new Date(firData.incident.dateOfOccurrence).toLocaleDateString('en-IN') : '---';
    yPos = addField('Date of Occurrence', incidentDate, yPos, 50);
    yPos = addField('Time of Occurrence', firData.incident?.timeOfOccurrence, yPos, 50);
    yPos = addField('Place of Occurrence', firData.incident?.placeOfOccurrence, yPos, 50);
    yPos += 5;
    addLine(yPos);
    yPos += 8;

    yPos = addSectionHeader('4. NATURE OF OFFENCE', yPos);
    yPos = addField('Type of Offence', firData.incident?.natureOfOffence, yPos, 50);
    yPos = addField('Cognizable/Non-Cog.', firData.incident?.hasOwnProperty('isCognizable') ? (firData.incident.isCognizable ? 'Cognizable' : 'Non-Cognizable') : '---', yPos, 50);
    yPos += 5;
    addLine(yPos);
    yPos += 8;

    // Check if we need a new page
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
    }

    // ========== LEGAL SECTIONS ==========
    yPos = addSectionHeader('5. SECTIONS OF LAW APPLIED', yPos);
    if (firData.legalSections && firData.legalSections.length > 0) {
        firData.legalSections.forEach((section) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`• ${section.act || 'IPC'} Section ${section.section || '---'} – ${section.title || '---'}`, margin + 5, yPos);
            yPos += lineHeight;

            if (section.description) {
                doc.setFont('helvetica', 'normal');
                yPos = addWrappedText(section.description, yPos, pageWidth - 2 * margin - 10);
                yPos += 2;
            }
        });
    } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No sections specified', margin, yPos);
        yPos += lineHeight;
    }
    yPos += 5;
    addLine(yPos);
    yPos += 8;

    // Check if we need a new page
    if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = margin;
    }

    // ========== COMPLAINT NARRATIVE ==========
    yPos = addSectionHeader('6. COMPLAINT / BRIEF FACTS OF THE CASE', yPos);
    yPos = addWrappedText(firData.complaint, yPos, pageWidth - 2 * margin);
    yPos += 5;
    addLine(yPos);
    yPos += 8;

    // Check if we need a new page
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
    }

    // ========== WITNESSES ==========
    if (firData.witnesses && firData.witnesses.length > 0) {
        yPos = addSectionHeader('7. DETAILS OF WITNESSES', yPos);
        firData.witnesses.forEach((witness, index) => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${index + 1}. ${witness.name || '---'}, Mobile: ${witness.mobile || '---'}`, margin + 5, yPos);
            yPos += lineHeight;
            if (witness.address) {
                yPos = addField('   Address', witness.address, yPos, 40);
            }
        });
        yPos += 5;
        addLine(yPos);
        yPos += 8;
    }

    // ========== PROPERTY DAMAGE ==========
    if (firData.propertyDamage && (firData.propertyDamage.description || firData.propertyDamage.estimatedLoss)) {
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = margin;
        }
        yPos = addSectionHeader('8. PROPERTY / DAMAGE DETAILS', yPos);
        yPos = addWrappedText(firData.propertyDamage.description, yPos, pageWidth - 2 * margin);
        if (firData.propertyDamage.estimatedLoss) {
            yPos = addField('Estimated Loss', '₹' + firData.propertyDamage.estimatedLoss + '/-', yPos, 40);
        }
        yPos += 5;
        addLine(yPos);
        yPos += 8;
    }

    // Check if we need a new page for signature
    if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = margin;
    }

    // ========== DECLARATION ==========
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    const declaration = 'I have read the above statement and confirm that it is true and correct to the best of my knowledge and belief.';
    yPos = addWrappedText(declaration, yPos, pageWidth - 2 * margin);
    yPos += 10;

    // Signature section
    doc.setFont('helvetica', 'normal');
    yPos = addField('Place', firData.policeStation?.district, yPos, 30);
    yPos = addField('Date', new Date().toLocaleDateString('en-IN'), yPos, 30);
    yPos += 10;

    doc.text('Signature / Thumb Impression of Complainant:', margin, yPos);
    yPos += 5;
    doc.text('__________________________', margin, yPos);
    yPos += lineHeight;
    doc.text(firData.complainant?.name || '---', margin, yPos);
    yPos += 15;

    addLine(yPos);
    yPos += 8;

    // ========== OFFICER DETAILS ==========
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Received and registered by me.', margin, yPos);
    yPos += 10;

    yPos = addField('Name of Officer', firData.officer?.name || 'Sub-Inspector of Police', yPos, 40);
    yPos = addField('Rank', firData.officer?.rank || 'Sub-Inspector', yPos, 40);
    yPos = addField('Badge Number', firData.officer?.badgeNumber, yPos, 40);
    yPos = addField('Police Station', firData.policeStation?.name, yPos, 40);
    yPos += 10;

    doc.text('Signature of Officer:', margin, yPos);
    yPos += 5;
    doc.text('__________________________', margin, yPos);
    yPos += 15;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Police Station Seal', margin, yPos);
    yPos += 5;
    addLine(yPos);

    // Footer on all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }


    return doc;
};

