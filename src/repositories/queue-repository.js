const CrudRepository = require("./crud-repository");
const queueModel = require("../db/queue");
const { constants} = require("../utils/common");
const statusValues = constants.STATUS_LABEL;


class QueueRepository extends CrudRepository {
  constructor() {
    super(queueModel);
  }

  async getAll(current_uid) {

    try {

      let response = await queueModel.find({ is_deleted: false, createdBy :  current_uid }).populate('extention').populate('createdBy').sort({ createdAt: -1 }).lean();
      return response;
    } catch (error) {
      throw error;
    }

  }

  async update(id, data) {
    const response = await this.model.findOneAndUpdate({ _id: id, is_deleted: false }, data, { runValidators: true, new: true });
    return response;
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


  async delete(id) {

    try {
      const check = await this.model.find({ _id: id, is_deleted: false });
      if (check.length == 0) {
        const error = new Error();
        error.name = 'Queue not found';
        throw error;
      }
      const response = await this.update(id, { is_deleted: true });
      return response;
    } catch (error) {
      throw error;
    }

  }


}

module.exports = QueueRepository;
