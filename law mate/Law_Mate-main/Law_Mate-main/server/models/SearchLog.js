import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true
    },
    law: {
        type: String,
        default: 'all'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const SearchLog = mongoose.model('SearchLog', searchLogSchema);

export default SearchLog;
