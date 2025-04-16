const CrudRepository = require("./crud-repository");
const { Credit, User } = require("../c_db");
const { Op } = require("sequelize");
const { constants } = require('../utils/common');

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
              { from_user: id },
              { to_user: id },
              { action_user: id },
              { user_id: { [Op.in]: userIds } },
              { from_user: { [Op.in]: userIds } },
              { to_user: { [Op.in]: userIds } },
              { action_user: { [Op.in]: userIds } },
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

  async findAllData(current_role, current_uid) {
    let response;
    if (current_role === constants.USERS_ROLE.SUPER_ADMIN) {
      response = await Credit.findAll();
    } else {
      response = await Credit.findAll({ where: { action_user: current_uid } });
    }
    return response;
  }
}

module.exports = CreditRepository;
