const CrudRepository = require("./crud-repository");
const CreditModel = require("../db/credits");
const UserModel = require("../db/users");

class CreditRepository extends CrudRepository {
  constructor() {
    super(CreditModel);
  }

  async getAll(id) {
    try {
      let userIds = [];
      let notIncludeThisUser = null;

      if (id) {
        const targetUser = await UserModel.find({ _id: id });
        notIncludeThisUser = targetUser[0]?.createdBy;

        const users = await UserModel.find({ createdBy: id }).select('_id');
        userIds = users.map(user => user._id.toString());
      }

      const query = id
        ? {
            $or: [
              { user_id: id }, 
              { fromUser: id },
              { toUser: id },
              { actionUser: id },
              { user_id: { $in: userIds } },
              { fromUser: { $in: userIds } },
              { toUser: { $in: userIds } },
              { actionUser: { $in: userIds } }
            ],
            ...(notIncludeThisUser && { actionUser: { $ne: notIncludeThisUser } })
          }
        : {};

      const response = await CreditModel.find(query)
        .populate('fromUser', ["fromUser", "username"])
        .populate('actionUser', ["actionUser", "username"])
        .populate('toUser', ["toUser", "username"])
        .sort({ createdAt: -1 })
        .lean();

      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CreditRepository;
