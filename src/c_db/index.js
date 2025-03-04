const User = require("./User");
const Credit = require("./Credits");

Credit.belongsTo(User, { foreignKey: "user_id" });
Credit.belongsTo(User, { foreignKey: "fromUser" });
Credit.belongsTo(User, { foreignKey: "toUser" });
Credit.belongsTo(User, { foreignKey: "actionUser" });

User.hasMany(Credit, { foreignKey: "user_id" });
User.hasMany(Credit, { foreignKey: "fromUser" });
User.hasMany(Credit, { foreignKey: "toUser" });
User.hasMany(Credit, { foreignKey: "actionUser" });

module.exports = { User, Credit };
