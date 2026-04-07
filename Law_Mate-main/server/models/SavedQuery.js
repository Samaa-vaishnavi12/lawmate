import mongoose from 'mongoose';

const savedQuerySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    query: {
        type: String,
        required: true,
        trim: true
    },
    law: {
        type: String,
        required: true,
        default: 'all'
    },
    title: {
        type: String,
        default: function () {
            return this.query.substring(0, 30);
        }
    }
}, {
    timestamps: true
});

const SavedQuery = mongoose.model('SavedQuery', savedQuerySchema);

export default SavedQuery;
