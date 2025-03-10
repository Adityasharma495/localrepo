const CrudRepository = require("./crud-repository");
const { ServerManagement } = require("../c_db"); 
const { constants } = require("../utils/common");
const dataCenterLabelType = constants.DATA_CENTER_TYPE_LABEL;
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { DataCenter } = require('../c_db');

class ServerManagementRepository extends CrudRepository {
    constructor() {
        super(ServerManagement);  
    }

    async getAll() {
        try {
            const response = await ServerManagement.findAll({
                where: { is_deleted: false },
                include: [
                    {
                        model: DataCenter,  
                        as: "data_center",
                        attributes: ["id", "name"], 
                    },
                ],
                order: [["created_at", "DESC"]], 
                raw: true,  
            });

            const formattedResponse = response.map((val) => {
                val.type = dataCenterLabelType[val.type];
                return val;
            });

            return formattedResponse;
        } catch (error) {
            throw error;
        }
    }

    async get(data) {
        try {
            const response = await ServerManagement.findOne({
                where: { id: data, is_deleted: false },
                raw: true, 
            });

            if (!response) {
                throw new AppError("Not able to find the Server", StatusCodes.NOT_FOUND);
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    async update(id, data) {
        try {
            const [updatedRows] = await ServerManagement.update(data, {
                where: { id: id, is_deleted: false },
            });

            if (updatedRows === 0) {
                throw new AppError("Not able to find the Server", StatusCodes.NOT_FOUND);
            }

            const updatedRecord = await ServerManagement.findOne({
                where: { id: id },
                raw: true, 
            });

            return updatedRecord;
        } catch (error) {
            throw error;
        }
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

module.exports = ServerManagementRepository;