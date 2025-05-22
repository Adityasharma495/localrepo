const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { constants } = require('../utils/common');
const { Op, fn, col, where } = require('sequelize');
class CrudRepository {

    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            const response = await this.model.create(data);
            
            return response;            
        } catch (error) {
            console.log(error);
            throw error
        }
    }
    

    async get(id) {
        try {
          const response = await this.model.findAll({
            where: {
              id: id
            },
            raw:true,
          });
      
          if (!response) {
            throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
          }
      
          return response;
        } catch (error) {
          throw error;
        }
      }
      

    async getAll(filter = {}) {

        const response = await this.model.findAll(filter);
        return response;
    }

    async update(id, data) {

      console.log("UPDATED", id, data);

      try {
        const options = {
          where: {
            id: id,
          },
        };
        console.log("OPTIONS", options);
        

        const response = await this.model.update(data, options);
        return response;
      } catch (error) {

        console.log("ISSUES ERORR ", error);
          throw error;
      }
        
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
            // Step 1: Check if all the provided IDs exist and are not deleted
            const check = await this.model.findAll({
                where: {
                    id: idArray,
                    is_deleted: false
                },
                attributes: ['id'] // Only fetch the IDs
            });
    
            if (check.length !== idArray.length) {
                // Extract existing IDs and find the missing ones
                const existingIds = check.map(obj => obj.id);
                const notFoundElements = idArray.filter(id => !existingIds.includes(id));
    
                const error = new Error(`Data with id ${notFoundElements} not found.`);
                error.name = "NotFoundError";
                throw error;
            }
    
            // Step 2: Perform soft delete (update `is_deleted` to true)
            const response = await this.model.update(
                { is_deleted: true }, // Set is_deleted = true
                {
                    where: {
                        id: idArray
                    }
                }
            );
    
            return { deletedCount: response[0] }; // Sequelize returns [affectedRows] in update()
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
            const createdAt = new Date(item.dataValues.created_at);
            const updatedAt = new Date(item.dataValues.updated_at);
    
            const formattedCreatedAt = createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            const formattedUpdatedAt = updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

            item.dataValues.created_at = formattedCreatedAt;
            item.dataValues.updated_at = formattedUpdatedAt;
    
            return item;
        });
    
        return response;
    }

    async findOne(conditions) {

        try {
            const response = await this.model.findOne({
                where: {
                  ...conditions
                }
              });

            return response;
        } catch (error) {
            throw error;
        }
    }
    async findOneDeleted(conditions) {

        try {
            const response = await this.model.findOne({
                where: {
                  ...conditions
                }
              });
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

    async findParent(conditions) {
      try {
          const response = await this.model.findOne({ where: { is_deleted: false, ...conditions } });
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
    

    async bulkUpdate(ids, data) {
      try {
        const [affectedRows] = await this.model.update(data, {
          where: {
            id: {
              [Op.in]: ids,
            },
          },
          returning: true, // optional: returns updated rows if needed
        });
    
        if (affectedRows === 0) {
          throw new AppError('No matching resources found to update', StatusCodes.NOT_FOUND);
        }
    
        return { updatedCount: affectedRows };
      } catch (error) {
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    }
    
}

module.exports = CrudRepository;