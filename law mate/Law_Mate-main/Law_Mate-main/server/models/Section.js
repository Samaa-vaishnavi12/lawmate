import mongoose from 'mongoose';

const sectionSchema = mongoose.Schema({
    law: {
        type: String,
        required: true,
        index: true
    },
    section: {
        type: String, // Kept as String to handle "29A", etc.
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness of a section within a law
sectionSchema.index({ law: 1, section: 1 }, { unique: true });

const Section = mongoose.model('Section', sectionSchema);

export default Section;
