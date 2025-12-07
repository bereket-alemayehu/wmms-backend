const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceID: {
        type: String,
        required: true,
        unique: true
    },
    userID: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

deviceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;