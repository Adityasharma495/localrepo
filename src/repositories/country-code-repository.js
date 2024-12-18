const CrudRepository = require('./crud-repository');
const countryCodeModel = require('../db/country_code');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

class CountryCodeRepository extends CrudRepository {

    constructor() {
        super(countryCodeModel);
    }

    async getAll() {

        try {
            const response = await this.model.find({ is_deleted: false }).sort({ name: 1 });
            return response;
        } catch (error) {
            throw error;
        }

    }

    async deleteCountryCode(id) {
        try {
            const response = await this.update(id, { is_deleted: true });
            return response;
        }
        catch (error) {
            throw error;
        }
    }

    async getAllById(ccId) {
        try {
            const response = await this.model.find({ $and: [{ _id: ccId }, { is_deleted: false }] });
            return response;
        } catch (error) {
            if (error.statusCode === undefined) {
                throw new AppError('Invalid Country Code Id.', StatusCodes.BAD_REQUEST);
            }
        }

    }

}

module.exports = CountryCodeRepository;