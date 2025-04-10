const CrudRepository = require("./crud-repository");
const didUserMappingModel = require("../db/did-user-mapping");
const { constants} = require("../utils/common");

class DIDUserMappingRepository extends CrudRepository {
  constructor() {
    super(didUserMappingModel);
  }

  async insertMany(records) {
    try {
        const response = await this.model.insertMany(records);
        return response;
    } catch (error) {
        throw error;
    }
  }

  async update(id, data) {
    const response = await this.model.findOneAndUpdate({ _id: id}, data, { runValidators: true, new: true });
    return response;
  }


  async getForOthers(id) {
    try {
      const totalNumbers = await this.model.find({
        $and: [
          { allocated_to: id },
          { active: true }      
        ]
      })
      .populate({
        path: 'allocated_to', 
        select: '_id username'
      })
      .populate("voice_plan_id")
      .exec();

      return totalNumbers
    } catch (error) {
        throw error;
    }
  }

  async getForSuperadmin(id) {
    try {
      const totalNumbers = await this.model.find({
        $or: [
          { allocated_to: id },
          { parent_id: id }
        ],
        $and: [
          {active : true}
        ]
      })
      .populate("voice_plan_id")
      .populate({
        path: 'allocated_to', 
        select: '_id username'
      })
      .exec();
      return totalNumbers
    } catch (error) {
        throw error;
    }
  }

  async findOne(conditions) {
    try {
        const response = await this.model.findOne({ ...conditions});
        return response;
    } catch (error) {
        throw error;
    }
  }

  async get(data) {

    try {

      const response = await this.model.findById(data);
      if (!response) {
        throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
      }
      return response;

    } catch (error) {

      throw error;

    }

  }

 }

module.exports = DIDUserMappingRepository;
