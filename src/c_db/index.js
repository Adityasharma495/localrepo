const User = require("./User");
const Company = require("./companies")
const Credit = require("./Credits");
const UserJourney = require("./User-Journey");
const ServerManagement = require("./server-management");
const DataCenter = require("./data_center");
const Trunks = require("./trunks");
const Agents = require("./Agents");
const Prompt  = require("./prompt");
const Numbers = require("./numbers");
const DIDUserMapping = require("./did-user-mapping");
const NumberFile = require("./numbers-file-list");
const NumberStatus = require("./number-status");
const MemberSchedule = require("./member-schedule");
const CountryCode = require("./country_code");
const IVRData = require("./ivr-data");
const IVR = require("./ivr");
const IVRSettings = require("./ivr-settings");
const FlowControl = require("./flow-control");
const FlowEdges = require("./flow-edge");
const FlowJson = require("./flows-json");
const Flow = require("./flows");
const AclSettings = require("./acl-settings")
const Timezone = require("./timezones");
const Language = require("./languages");
const Codecs = require("./codecs");
const Module = require("./module");
const Operator = require("./operator");


Credit.belongsTo(User, { foreignKey: "user_id",onDelete: 'CASCADE',onUpdate: 'CASCADE', });
Credit.belongsTo(User, { foreignKey: "from_user", as: "fromUser" });
Credit.belongsTo(User, { foreignKey: "to_user", as: "toUser" });
Credit.belongsTo(User, { foreignKey: "action_user", as: "actionUser" });



// User.belongsTo(Company, { foreignKey: "company_id", as: "companies" });
// Company.hasMany(User, { foreignKey: "company_id", as: "companyUsers" });



NumberFile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(NumberFile, { foreignKey: 'user_id', as: 'userFiles' });


AclSettings.belongsTo(User, { foreignKey: "created_by", as: "creator" });
User.hasMany(AclSettings, { foreignKey: "created_by", as: "aclsettings" });


User.hasMany(Credit, { foreignKey: "user_id" });
User.hasMany(Credit, { foreignKey: "from_user", as: "fromUser" });
User.hasMany(Credit, { foreignKey: "to_user", as: "toUser" });
User.hasMany(Credit, { foreignKey: "action_user", as: "actionUser" });

User.belongsTo(AclSettings, {foreignKey: 'acl_settings_id',as: 'acl_settings'});
AclSettings.hasMany(User, {foreignKey: 'acl_settings_id',as: 'users'});
  

UserJourney.belongsTo(User, { foreignKey: "created_by", as: "creator" });
User.hasMany(UserJourney, { foreignKey: "created_by", as: "creator" });

DataCenter.hasMany(ServerManagement, { foreignKey: 'data_center_id', as: 'server_managements' });
ServerManagement.belongsTo(DataCenter, { foreignKey: 'data_center_id',  as: 'data_center' });


module.exports = { 
    Agents,
    User,
    Credit,
    UserJourney,
    ServerManagement,   
    DataCenter,
    Trunks,
    Prompt, 
    Numbers,
    DIDUserMapping, 
    NumberFile, 
    NumberStatus,
    MemberSchedule,
    CountryCode,
    IVRData,
    IVR,
    IVRSettings,
    FlowControl,
    FlowEdges,
    FlowJson,
    Flow,
    Company,
    AclSettings,
    Timezone,
    Language,
    Codecs,
    Module,
    Operator
};
