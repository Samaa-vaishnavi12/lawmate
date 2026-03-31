import mongoose from 'mongoose';

const firSchema = new mongoose.Schema({
    firNumber: {
        type: String,
        unique: true,
        sparse: true // Allow null for drafts
    },
    policeStation: {
        name: String,
        district: String,
        state: { type: String, default: 'Tamil Nadu' }
    },
    complainant: {
        name: String,
        fatherName: String,
        age: Number,
        occupation: String,
        address: String,
        mobile: String,
        email: String,
        idProof: {
            type: { type: String }, // Note: nested 'type' field
            number: String
        }
    },
    accused: [{
        name: { type: String, default: 'Unknown' },
        fatherName: String,
        age: Number,
        description: String,
        address: String
    }],
    incident: {
        dateOfOccurrence: Date,
        timeOfOccurrence: String,
        placeOfOccurrence: String,
        natureOfOffence: String,
        isCognizable: { type: Boolean, default: true }
    },
    legalSections: [{
        act: String,
        section: String,
        title: String,
        description: String
    }],
    complaint: String,
    witnesses: [{
        name: String,
        mobile: String,
        address: String
    }],
    propertyDamage: {
        description: String,
        estimatedLoss: Number
    },
    officer: {
        name: String,
        rank: String,
        badgeNumber: String,
        policeStation: String
    },
    status: {
        type: String,
        enum: ['draft', 'filed', 'under_investigation', 'closed'],
        default: 'draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    completionPercentage: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Pre-save hook: Calculate completion percentage and auto-generate FIR number
firSchema.pre('save', async function () {
    // Calculate completion percentage for drafts
    if (this.status === 'draft') {
        let completed = 0;
        const total = 8;

        if (this.policeStation?.name && this.policeStation?.district) completed++;
        if (this.complainant?.name && this.complainant?.fatherName && this.complainant?.age && this.complainant?.address && this.complainant?.mobile) completed++;
        if (this.accused && this.accused.length > 0) completed++;
        if (this.incident?.dateOfOccurrence && this.incident?.timeOfOccurrence && this.incident?.placeOfOccurrence && this.incident?.natureOfOffence) completed++;
        if (this.legalSections && this.legalSections.length > 0) completed++;
        if (this.complaint && this.complaint.length > 50) completed++;
        completed++; // Witnesses are optional
        if (this.officer?.rank) completed++;

        this.completionPercentage = Math.round((completed / total) * 100);
    } else {
        this.completionPercentage = 100;
    }

    // Auto-generate FIR number when filing
    if (!this.firNumber && this.status === 'filed') {
        const year = new Date().getFullYear();
        const count = await mongoose.model('FIR').countDocuments({ status: { $ne: 'draft' } });
        this.firNumber = `${String(count + 1).padStart(4, '0')}/${year}`;
    }
});

const FIR = mongoose.model('FIR', firSchema);

export default FIR;
