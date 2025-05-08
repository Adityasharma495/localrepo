const CrudRepository = require("./crud-repository");
const { Credit, User, Company } = require("../c_db");
const { Op } = require("sequelize");
const { constants } = require('../utils/common');

class CreditRepository extends CrudRepository {
  constructor() {
    super(Credit);
  }

  async getAll(id) {
    try {
      let query = {};
      let userIds = [];
  
      if (id) {
        const isUser = await User.findByPk(id);
  
        if (isUser) {
          const users = await User.findAll({
            where: { created_by: id },
            attributes: ['id'],
          });
          userIds = users.map(user => user.id);
        } else {
          const isCompany = await Company.findByPk(id);
          if (isCompany) {
            const users = await User.findAll({
              where: { company_id: id },
              attributes: ['id'],
            });
            userIds = users.map(user => user.id);
          } else {
            return [];
          }
        }
  
        query = {
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
        };
      }
  
      const credits = await Credit.findAll({
        where: query,
        raw: true,
        order: [['created_at', 'DESC']],
      });
  
      const userIdsSet = new Set();
      const companyIdsSet = new Set();
  
      credits.forEach((item) => {
        if (item.from_user) userIdsSet.add(item.from_user);
        if (item.to_user) userIdsSet.add(item.to_user);
      
        if (item.type === "Company" && item.action === "deduction") {
          if (item.company_action === "Addition") {
            if (item.action_user) userIdsSet.add(item.action_user);
          } else {
            if (item.action_user) companyIdsSet.add(item.action_user);
          }
        } else if (item.type === "Company" && item.action === "addition") {
          if (item.company_action === "Addition") {
            if (item.action_user) companyIdsSet.add(item.action_user); 
          } else {
            if (item.action_user) userIdsSet.add(item.action_user);
          }
        } else {
          if (item.action_user) userIdsSet.add(item.action_user);
        }
      });
   
      const [users, companies] = await Promise.all([
        User.findAll({
          where: { id: Array.from(userIdsSet) },
          attributes: ["id", "username"],
          raw: true,
        }),
        Company.findAll({
          where: { id: Array.from(companyIdsSet) },
          attributes: ["id", "name"],
          raw: true,
        }),
      ]);
  
      const userMap = Object.fromEntries(
        users.map((u) => [u.id, { type: "user", username: u.username }])
      );
  
      const companyMap = Object.fromEntries(
        companies.map((c) => [c.id, { type: "company", username: c.name }])
      );
  
      const idMap = { ...userMap, ...companyMap };
  
      const enrichedCredits = credits.map((credit) => ({
        ...credit,
        fromUser: idMap[credit.from_user] || null,
        toUser: idMap[credit.to_user] || null,
        actionUser:
          credit.type === "Company" && credit.action === "deduction"
            ? credit.company_action === "Addition"
              ? userMap[credit.action_user] || null
              : companyMap[credit.action_user] || null
            : credit.type === "Company" && credit.action === "addition"
            ? credit.company_action === "Addition"
              ? companyMap[credit.action_user] || null
              : userMap[credit.action_user] || null
            : userMap[credit.action_user] || null,
      }));      
  
      return enrichedCredits;
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

module.exports = CreditRepository;
