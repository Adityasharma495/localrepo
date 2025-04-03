const CrudRepository = require("./crud-repository");
const operatorModel = require("../c_db/operator");
const { Op } = require('sequelize');

class OperatorsRepository extends CrudRepository {
  constructor() {
    super(operatorModel);
  }

  async getAll() {
    try {
      const response = await operatorModel.findAll({
        where: { is_deleted: false },
        order: [['created_at', 'DESC']],
        raw: true
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const check = await operatorModel.findOne({
        where: {
          id: id,
          is_deleted: false
        }
      });

      if (!check) {
        const error = new Error();
        error.name = 'Operator not found';
        throw error;
      }

      const response = await operatorModel.update(
        { is_deleted: true },
        {
          where: { id: id }
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Optional: bring back get/update if needed in Sequelize version
  // async get(id) {
  //   const response = await operatorModel.findByPk(id);
  //   if (!response || response.is_deleted) {
  //     const error = new Error('Not able to find the resource');
  //     error.status = 404;
  //     throw error;
  //   }
  //   return response;
  // }

  // async update(id, data) {
  //   const [rowsUpdated] = await operatorModel.update(data, {
  //     where: {
  //       id: id,
  //       is_deleted: false
  //     }
  //   });
  //   return rowsUpdated;
  // }
}

module.exports = OperatorsRepository;
