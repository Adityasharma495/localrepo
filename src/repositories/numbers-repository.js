const CrudRepository = require('./crud-repository');
const {numbersModel} = require('../db/numbers');
const { constants } = require("../utils/common");
const numberStatusValues = constants.NUMBER_STATUS_VALUE;
class NumbersRepository extends CrudRepository {
    constructor() {
        super(numbersModel);
    }

    async getAll() {
        try {
            let response = await this.model.find({ is_deleted: false}).sort({ created_at: -1 }).lean();
            response = response.map(val => {
                val['status'] = numberStatusValues[val['status']];
                return val;
              });
            return response;
        } catch (error) {
            throw error;
        }

    }

    async deleteNumber(id) {
        try {
            const response = await this.update(id, { is_deleted: true });
            return response;
        }
        catch (error) {
            throw error;
        }
    }

    async isActualNumberExist(actNumber, isDeleted) {
        try {
            let response = await this.model.findOne({
                $and: [
                    { actual_number: actNumber },
                    { is_deleted: isDeleted }
                ]
            });
            return response;
        }
        catch (error) {
            throw error;
        }
    }

    async insertMany(records) {
        try {
            const response = await this.model.insertMany(records);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getParticularTypeNumber(numberType) {
        try {
            const response = await this.model.find({ is_deleted: false, number_type:  numberType});
            return response;
        } catch (error) {
            throw error;
        }
    }

    async findOne(conditions) {
        try {
            const response = await this.model.findOne({ is_deleted: false, ...conditions});
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deleteNumberByFileId(idArray) {
        try {
            const check = await this.model.find({ uploaded_file_id: { $in: idArray }, is_deleted: false },{ _id: 1 });
          
            if (check.length == 0) {
              const error = new Error();
              error.name = `Data Not found in numbers Collection with this file`;
              throw error;
            }
            const response = await this.model.updateMany(
              { uploaded_file_id: { $in: idArray } },
              { $set: { is_deleted: true } }
          );
            return response;
          } catch (error) {
            throw error;
          }
      
    }

    async bulkWrite(operations) {
        try {
            const result = await this.model.bulkWrite(operations);
            return result;
        } catch (error) {
            throw new Error('Error executing bulk write: ' + error.message);
        }
    }

    async getAllocatedNumbers(user_id) {
        try {
            const response = await this.model.find({ is_deleted: false, allocated_to: user_id })
              .populate("voice_plan_id");
            return response;
        } catch (error) {
            throw error;
        }
    }

    async findMany(ids) {
        try {
            const response = await this.model.find({
                is_deleted: false,
                _id: { $in: ids }
            }).populate("voice_plan_id").populate("allocated_to").lean();
            return response;
        } catch (error) {
            throw error;
        }
    }

    async update(id, data) {
        const response = await this.model.findOneAndUpdate({ _id: id}, data, { runValidators: true, new: true });
        return response;
    }

    async findOneWithVoicePlan(conditions) {
        try {
            const response = await this.model.findOne({ is_deleted: false, ...conditions}).populate('voice_plan_id').lean();
            return response;
        } catch (error) {
            throw error;
        }
    }
    
}

module.exports = NumbersRepository;