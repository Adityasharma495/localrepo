const mongoose = require('mongoose');

const CountryCodeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: { unique: true },
        trim: true
    },
    code: {
        type: String,
        required: true,
        index: { unique: true },
        trim: true,
        uppercase: true
    },
    calling_code: {
        type: String,
        required: true,
        index: { unique: true }
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true
});

    // Pre-save middleware to convert timestamps to IST
    CountryCodeSchema.pre('save', function (next) {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
        const istDate = new Date(now.getTime() + istOffset);

        // Set createdAt and updatedAt fields to IST
        if (this.isNew) {
            this.createdAt = istDate;
        }
        this.updatedAt = istDate;

        next();
    });

    // Pre-update middleware to convert updatedAt to IST
    CountryCodeSchema.pre('findOneAndUpdate', function (next) {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
        const istDate = new Date(now.getTime() + istOffset);

        this._update.updatedAt = istDate;

        next();
    });


const countryCodeModel = mongoose.model('countryCode', CountryCodeSchema);

module.exports = countryCodeModel;

