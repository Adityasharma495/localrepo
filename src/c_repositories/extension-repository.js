const CrudRepository = require("./crud-repository");
const Extension = require("../c_db/extention"); // ✅ Sequelize model
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

class ExtensionRepository extends CrudRepository {
  constructor() {
    super(Extension);
  }

  // ✅ Get all extensions based on conditions
  async getAll(current_uid, check) {
    try {
      let conditions = {
        is_deleted: false,
        created_by: current_uid,
      };

      // If `check` is not 'all', filter by is_allocated = 0
      if (check !== 'all') {
        conditions.is_allocated = 0;
      }

      const response = await Extension.findAll({
        where: conditions,
        include: [{ association: "creator" }], // Sequelize equivalent of populate
        order: [["created_at", "DESC"]], // Sort by created_at DESC
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Get a single extension by ID
  async get(id) {

    console.log("SEARCH FOR ID", id);
    try {
      const response = await Extension.findOne({
        where: { extension: id, is_deleted: false },
      });

      console.log("RESPONSE FOR EXTENSION", response);

      if (!response) {
        throw new AppError("Not able to find the Extension", StatusCodes.NOT_FOUND);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Update an extension by ID
  async update(id, data) {

    console.log("ID CAME TO UPDATE", id);
    console.log("DATA CAME TO UPDATE", data);
    try {
      const [updatedRows, [updatedExtension]] = await Extension.update(data, {
        where: { id, is_deleted: false },
        returning: true, 
      });

      if (updatedRows === 0) {
        throw new AppError("Extension not found or already deleted", StatusCodes.NOT_FOUND);
      }

      return updatedExtension;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Soft Delete: Mark as `is_deleted = true`
  async delete(id) {
    try {
      const extension = await Extension.findOne({ where: { id, is_deleted: false } });

      if (!extension) {
        throw new AppError("Extension not found", StatusCodes.NOT_FOUND);
      }

      await extension.update({ is_deleted: true });

      return extension;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Bulk Update
  async bulkUpdate(ids, data) {
    try {
      const response = await Extension.update(data, {
        where: { id: { [Op.in]: ids } },
      });

      if (response[0] === 0) {
        throw new AppError("No matching resources found to update", StatusCodes.NOT_FOUND);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ExtensionRepository;
