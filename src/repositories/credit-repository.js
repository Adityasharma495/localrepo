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
        notIncludeThisUser = targetUser[0]?.created_by;

        const users = await UserModel.find({ created_by: id }).select('_id');
        userIds = users.map(user => user._id.toString());
      }

      const query = id
        ? {
            $or: [
              { user_id: id }, 
              { from_user: id },
              { to_user: id },
              { action_user: id },
              { user_id: { $in: userIds } },
              { from_user: { $in: userIds } },
              { to_user: { $in: userIds } },
              { action_user: { $in: userIds } }
            ],
            ...(notIncludeThisUser && { action_user: { $ne: notIncludeThisUser } })
          }
        : {};

      const response = await CreditModel.find(query)
        .populate('from_user', ["from_user", "username"])
        .populate('action_user', ["action_user", "username"])
        .populate('to_user', ["to_user", "username"])
        .sort({ created_at: -1 })
        .lean();

      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CreditRepository;
