import mongoose from 'mongoose';

const documentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'general'
    }
}, {
    timestamps: true
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
