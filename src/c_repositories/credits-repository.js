const CrudRepository = require("./crud-repository");
const { Credit, User } = require("../c_db");
const { Op } = require("sequelize");

class CreditRepository extends CrudRepository {
  constructor() {
    super(Credit);
  }

  async getAll(id) {
    try {
      let userIds = [];
      if (id) {
        const users = await User.findAll({
          where: { created_by: id },
          attributes: ['id'],
        });
        userIds = users.map(user => user.id);
      }

      const query = id
        ? {
            [Op.or]: [
              { user_id: id },
              { fromUser: id },
              { toUser: id },
              { actionUser: id },
              { user_id: { [Op.in]: userIds } },
              { fromUser: { [Op.in]: userIds } },
              { toUser: { [Op.in]: userIds } },
              { actionUser: { [Op.in]: userIds } },
            ],
          }
        : {};

      const response = await Credit.findAll({
        where: query,
        include: [
          { model: User, as: 'fromUser', attributes: ['id', 'username'] },
          { model: User, as: 'actionUser', attributes: ['id', 'username'] },
          { model: User, as: 'toUser', attributes: ['id', 'username'] },
        ],
        order: [['created_at', 'DESC']],
        raw: true,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CreditRepository;
