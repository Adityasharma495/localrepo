const User = require("./User");
const Credit = require("./Credits");
const UserJourney = require("./User-Journey");

Credit.belongsTo(User, { foreignKey: "user_id" });
Credit.belongsTo(User, { foreignKey: "from_user", as: "fromUser" });
Credit.belongsTo(User, { foreignKey: "to_user", as: "toUser" });
Credit.belongsTo(User, { foreignKey: "action_user", as: "actionUser" });

User.hasMany(Credit, { foreignKey: "user_id" });
User.hasMany(Credit, { foreignKey: "from_user", as: "fromUser" });
User.hasMany(Credit, { foreignKey: "to_user", as: "toUser" });
User.hasMany(Credit, { foreignKey: "action_user", as: "actionUser" });

UserJourney.belongsTo(User, { foreignKey: "created_by", as: "creator" });
User.hasMany(UserJourney, { foreignKey: "created_by", as: "creator" });

module.exports = { User, Credit, UserJourney };
