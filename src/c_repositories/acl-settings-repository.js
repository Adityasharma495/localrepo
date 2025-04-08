const { Op } = require("sequelize");
const { AclSettings, User } = require("../c_db");
const { constants } = require("../utils/common");
const CrudRepository = require("./crud-repository");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

const statusValues = constants.STATUS_LABEL;

class AclSettingRepository extends CrudRepository {
  constructor() {
    super(AclSettings);
  }

  async getAll(current_uid) {
    try {
      let response = await AclSettings.findAll({
        where: { is_deleted: false },
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "username"],
          },
        ],
        order: [["created_at", "DESC"]],
        raw: true,
        nest: true,
      });

      // Map status label
      response = response.map((val) => ({
        ...val,
        status: statusValues[val.status],
      }));

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update a single ACL entry by ID
  async update(id, data) {
    const [affectedRows, [updatedRecord]] = await AclSettings.update(data, {
      where: {
        id,
        is_deleted: false,
      },
      returning: true,
    });

    if (!updatedRecord) {
      throw new AppError("Acl Setting not found", StatusCodes.NOT_FOUND);
    }

    return updatedRecord;
  }

  // Get one by ID
  async get(id) {
    const response = await AclSettings.findOne({
      where: { id },
    });

    if (!response) {
      throw new AppError("Not able to find the resource", StatusCodes.NOT_FOUND);
    }

    return response;
  }

  // Soft-delete (mark is_deleted true)
  async delete(id) {
    const check = await AclSettings.findOne({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!check) {
      const error = new Error("Acl Settings not found");
      error.name = "NotFoundError";
      throw error;
    }

    const updated = await this.update(id, { is_deleted: true });
    return updated;
  }

  async deleteMany(idArray) {
    try {
      const check = await this.model.findAll({
        where: { id: idArray, is_deleted: false },
        attributes: ['id']
      });

      const checkData = check.map((obj) => obj.id.toString());
  
      if (checkData.length !== idArray.length) {
        const notFoundElement = idArray.filter((x) => !checkData.includes(x));
        const error = new Error(`Data with id(s) ${notFoundElement.join(', ')} not found.`);
        throw error;
      }
      const response = await this.model.update(
        { is_deleted: true },
        { where: { id: idArray } }
      );
  
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AclSettingRepository;
