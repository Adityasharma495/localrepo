const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const { NUMBERS_STATUS } = constants.NUMBERS_STATUS_KEY_VALUES;

const TRUNKS_MODEL_NAME = constants.MODEL.TRUNKS;
const COMPANIES_MODEL_NAME = constants.MODEL.COMPANIES;
const CALL_CENTERS_MODEL_NAME = constants.MODEL.CALL_CENTERS;
const COUNTRY_CODE_MODEL_NAME = constants.MODEL.COUNTRY_CODE;
const USER_MODEL_NAME = constants.MODEL.USERS;
const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');
const AppError = require('../utils/errors/app-error');

const NumbersSchema = new mongoose.Schema({
    status: {
        type: Number,
        required: true,
        default: 1
    },
    actual_number: {
        type: Number,
        required: true
    },
    trunks: {
        type: mongoose.Schema.Types.ObjectId,
        ref: TRUNKS_MODEL_NAME,
        default: null
    },
    allocated_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: COMPANIES_MODEL_NAME,
        default: null
    },
    call_center: {
        type: mongoose.Schema.Types.ObjectId,
        ref: CALL_CENTERS_MODEL_NAME,
        default: null
    },
    routing_info: {
        routing_type: String,
        destination: String
    },
    country_code: {
        type: mongoose.Schema.Types.ObjectId,
        ref: COUNTRY_CODE_MODEL_NAME,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true
});

const numbersModel = mongoose.model('numbers', NumbersSchema);

async function findByNumber(actNumber) {
    try {
        return numbersModel.findOne({ actual_number: actNumber });
    } catch (error) {
        throw new Error(`Unable to connect to the database.`)
    }
}

async function saveNumbers(numberSchema) {

    try {
        var numbers = new numbersModel(numberSchema);
        const response = await numbers.save();
        return response;

    }
    catch (error) {
        if (error.name == 'ValidationError' || error.name == 'MongoServerError') {
            if (error.code == 11000) error.message = `Duplicate key, record already exists`;
            throw new AppError(error.message, StatusCodes.BAD_REQUEST);
        }
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAll(current_uid) {
    try {
        let response = await numbersModel.find({ is_deleted: false, createdBy: current_uid });
        let updatedResponse = [];
        response.map(val => {
            let obj = {
                _id: val["_id"],
                status: val["status"].toString(),
                actual_number: val["actual_number"],
                trunks: val["trunks"],
                allocated_to: val["allocated_to"],
                call_center: val["call_center"],
                country_code: val["country_code"],
                createdBy: val["createdBy"],
                is_deleted: val["is_deleted"],
                createdAt: val["createdAt"],
                updatedAt: val["updatedAt"],
                routing_info: {
                    routing_type: val["routing_info"]["routing_type"],
                    destination: val["routing_info"]["destination"]
                }
            }
            updatedResponse.push(obj);
        });

        updatedResponse = updatedResponse.map(val => {
            if (val['status'] === "1") {
                val['status'] = "Active"
            }
            else if (val['status'] === "0") {
                val['status'] = "Inactive"
            }
            return val;
        });
        return updatedResponse;
    } catch (error) {
        throw error;
    }

}

async function deleteNumber(id) {
    try {
        const response = await numbersModel.findByIdAndUpdate({ _id: id }, {
            $set: { is_deleted: true }
        }, { runValidators: true, new: true });
        return response;
    }
    catch (error) {
        throw error;
    }
}

async function get(id) {

    try {
        const response = await numbersModel.findById(id);
        if (!response) {
            throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
        }
        return response;
    } catch (error) {
        throw error;
    }

}

async function update(uid, data) {
    try {
        const response = await numbersModel.findByIdAndUpdate({ _id: uid, is_deleted: false }, data, { runValidators: true, new: true })
        if (!response) {
            throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
        }
        return response;
    } catch (error) {
        throw error;
    }
}

module.exports = { numbersModel, findByNumber, saveNumbers, getAll, deleteNumber, get, update };