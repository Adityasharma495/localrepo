const CrudRepository = require("./crud-repository");
const CreditModel = require("../db/credits");

class CreditRepository extends CrudRepository {
  constructor() {
    super(CreditModel);
  }

  async getAll(id) {
    try {
      let response;
      if (id) {
        response = await CreditModel.find({ user_id: id })
        .populate('fromUser', ["fromUser", "username"])
        .populate('toUser', ["toUser", "username"])
        .sort({ createdAt: -1 })
        .lean();
      }
      else {
        response = await CreditModel.find()
        .populate('fromUser', ["fromUser", "username"])
        .populate('toUser', ["toUser", "username"])
        .sort({ createdAt: -1 })
        .lean();
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAllData() {
    const response = await this.model.find().lean();
    return response;
}

  async update(id, data) {
    const response = await this.model.findOneAndUpdate({ _id: id }, data, {
      runValidators: true,
      new: true,
    });
    return response;
  }

  async get(data) {
    try {
      const response = await this.model.findById(data);
      if (!response) {
        throw new AppError(
          "Not able to find the resource",
          StatusCodes.NOT_FOUND
        );
      }
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CreditRepository;
