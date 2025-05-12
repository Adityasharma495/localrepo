const CrudRepository = require("./crud-repository");
const { CallCenter } = require("../c_db");
const { constants } = require("../utils/common");

class CallCentreRepository extends CrudRepository {
  constructor() {
    super(CallCenter);
  }

  async getAll(userRole, createdById) {
    try {
      let response;
      const queryOptions = {
        order: [["created_at", "DESC"]],
        raw: true,
      };
  
      if (userRole === constants.USERS_ROLE.SUPER_ADMIN) {
        response = await this.model.findAll(queryOptions);
      } else {
        response = await this.model.findAll({
          ...queryOptions,
          where: { created_by: createdById },
        });
      }
  
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Company.findByPk('company-123', {
//   include: [{ model: User, as: 'users' }]
// });

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
  

  async findAllData(role, id) {
    let response;
    if (role === constants.USERS_ROLE.SUPER_ADMIN) {
      response = await this.model.findAll();
    } else {
      response = await this.model.findAll({
        where: { created_by: id }
      });
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
}

module.exports = CallCentreRepository;
