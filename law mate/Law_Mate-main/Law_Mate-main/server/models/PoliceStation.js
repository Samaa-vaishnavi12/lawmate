import mongoose from 'mongoose';

const policeStationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true,
        default: 'Tamil Nadu'
    },
    address: String,
    phone: String,
    email: String,
    officers: [{
        name: String,
        rank: String,
        badgeNumber: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

const PoliceStation = mongoose.model('PoliceStation', policeStationSchema);

export default PoliceStation;
