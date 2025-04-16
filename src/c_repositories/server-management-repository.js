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

    async getAll(role, current_user_id) {
        try {
            let response;
            const baseOptions = {
                where: { is_deleted: false },
                include: [
                    {
                        model: DataCenter,
                        as: "data_center",
                        attributes: ["id", "name"],
                    },
                ],
                order: [["created_at", "DESC"]],
            };
    
            if (role !== constants.USERS_ROLE.SUPER_ADMIN) {
                baseOptions.where.created_by = current_user_id;
            }
    
            response = await ServerManagement.findAll(baseOptions);
    
            const formattedResponse = response.map((val) => {
                return {
                    ...val.toJSON(),
                    type: dataCenterLabelType[val.type],
                };
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

      async findAllData(current_role, current_uid) {
        let response;
        if (current_role === constants.USERS_ROLE.SUPER_ADMIN) {
            response = await this.model.findAll({ where: { is_deleted: false } });
        } else {
            response = await this.model.findAll({ where: { is_deleted: false, created_by: current_uid } });
        }
    
        response = response.map(item => {
            const createdAt = new Date(item.dataValues.createdAt);
            const updatedAt = new Date(item.dataValues.updatedAt);
    
            const formattedCreatedAt = createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            const formattedUpdatedAt = updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

            item.dataValues.createdAt = formattedCreatedAt;
            item.dataValues.updatedAt = formattedUpdatedAt;
    
            return item;
        });
    
        return response;
    }
}

module.exports = ServerManagementRepository;