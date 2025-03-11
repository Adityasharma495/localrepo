const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
class CrudRepository {

    constructor(model) {
        this.model = model;
    }

    async create(data) {

        console.log("DATA TO BE CREATED", data);
        try {
            const response = await this.model.create(data);

            console.log("RETURING RESPONSE", response);
            return response;            
        } catch (error) {
            console.log(error);
            throw error
            
            if (error.name === 'ValidationError' || (error.name === 'MongoServerError' && error.code === 11000)) {
                let detailedErrorMessage = error.message;
                if (error.code === 11000) {
                    // Adding detail to the error message about which key was duplicated
                    const duplicatedField = Object.keys(error.keyPattern)[0];
                    const duplicatedValue = error.keyValue[duplicatedField];
                    detailedErrorMessage = `Duplicate key error: ${duplicatedField} with value '${duplicatedValue}' already exists.`;
                }
                throw new AppError(detailedErrorMessage, StatusCodes.BAD_REQUEST);
            }
            throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    

    async get(data) {
        try {
            const response = await this.model.findById(data);
            if(!response) {
                throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
            }
            return response;            
        } catch (error) {
            throw error;
        }
    }

    async getAll(filter = {}) {

        const response = await this.model.find(filter);
        return response;
    }

    async update(id, data) {
        const options = {
            where: {
                id: id
            }
        }
        const response = await this.model.update(data, options, { runValidators: true, new: true });
        return response;
    }


    async delete(id){
        try {
            const response = await this.update(id, {is_deleted: true});
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deleteMany(idArray) {
        try {
            const check = await this.model.find({ _id: { $in: idArray }, is_deleted: false },{ _id: 1 });
            if (check.length !== idArray.length) {
              const checkData = check.map(obj => obj._id.toString());
              const notFoundElement =  idArray.filter(x => !checkData.includes(x));
              const error = new Error();
              error.name = `Data with id ${notFoundElement} not found.`;
              throw error;
            }
            const response = await this.model.updateMany(
              { _id: { $in: idArray } },
              { $set: { is_deleted: true } }
          );
            return response;
          } catch (error) {
            throw error;
          }
      
    }

    async findAllData() {
        const response = await this.model.find({ is_deleted: false }).lean();
        return response;
    }

    async findOne(conditions) {
        try {
            const response = await this.model.findOne({ is_deleted: false, ...conditions});
            return response;
        } catch (error) {
            throw error;
        }
    }

    async find(conditions) {
        try {
            const response = await this.model.findOne({ is_deleted: false, ...conditions});
            return response;
        } catch (error) {
            throw error;
        }
    }
    async hardDeleteMany(idArray) {
        try {
            const response = await this.model.deleteMany({ flowId: { $in: idArray } });
            return response;
        } catch (error) {
            throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = CrudRepository;