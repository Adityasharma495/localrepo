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
const DownloadReport = require("./download-report");
const IncomingSummary = require("./incoming-summary");
const CallStrategy = require("./call-stratergy");
const VoiceCategory = require("./voice-category");
const CallCenter = require("./call-centres");
const SubUserLicence = require('./sub-user-licence');
// const Company = require("./companies");
const VoicePlan = require("./voice-plans");
const VoipProfile = require("./voip-profile");
const TelephonyProfile = require("./telephony-profile");
const Subscriber = require("./subscriber");
const TelephonyProfileItem = require("./telephony-profile-items")
const Extension = require("./extention");
const Call = require("./call");
const Queue = require("./queue");
const IncomingReport = require("./incoming-report");
const UserCallCentres = require("./user-call-centres");
const AgentGroup = require("./agent-group");

Credit.belongsTo(User, { foreignKey: "user_id",onDelete: 'CASCADE',onUpdate: 'CASCADE', });
Credit.belongsTo(User, { foreignKey: "from_user", as: "fromUser" });
Credit.belongsTo(User, { foreignKey: "to_user", as: "toUser" });
Credit.belongsTo(User, { foreignKey: "action_user", as: "actionUser" });

Numbers.hasMany(DIDUserMapping, {
  foreignKey: 'DID',
  as: 'DIDUserMapping',
});

DIDUserMapping.belongsTo(Numbers, {
  foreignKey: 'DID',
  targetKey: 'id',
  as: 'did',
});


User.belongsToMany(Company, {
  through: 'user_companies',
  as: 'companyList',
  foreignKey: 'user_id'
});

Company.hasMany(User, {
  foreignKey: 'company_id',
  as: 'users'
});

CallCenter.hasMany(User, {
  foreignKey: 'callcenter_id',
  as: 'users'
});

Numbers.belongsTo(VoicePlan, {
  foreignKey: 'voice_plan_id',
  as: 'voice_plan',
});

VoicePlan.hasMany(Numbers, {
  foreignKey: 'voice_plan_id',
  as: 'numbers',
});


Agents.belongsTo(TelephonyProfile, { foreignKey: 'telephony_profile', as: 'telephonyProfile' });


TelephonyProfile.hasMany(TelephonyProfileItem, {
    foreignKey: 'telephony_profile_id',
    as: 'items',
  });
  
TelephonyProfileItem.belongsTo(TelephonyProfile, {
    foreignKey: 'telephony_profile_id',
    as: 'profile',
  });
  

NumberFile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(NumberFile, { foreignKey: 'user_id', as: 'userFiles' });


AclSettings.belongsTo(User, { foreignKey: "created_by", as: "creator" });
User.hasMany(AclSettings, { foreignKey: "created_by", as: "aclsettings" });


User.belongsTo(SubUserLicence, {foreignKey: 'sub_user_licence_id',as: 'sub_user_licence',});

User.belongsTo(User, {foreignKey: 'created_by',as: 'createdByUser'});
User.hasMany(User, {
  foreignKey: 'created_by',
});
User.hasMany(Credit, { foreignKey: "user_id" });
User.hasMany(Credit, { foreignKey: "from_user", as: "fromUser" });
User.hasMany(Credit, { foreignKey: "to_user", as: "toUser" });
User.hasMany(Credit, { foreignKey: "action_user", as: "actionUser" });

User.belongsTo(Company, {
  foreignKey: 'company_id',
  as: 'company'
});

User.belongsTo(CallCenter, {
  foreignKey: 'callcenter_id',
  as: 'callcenter'
});

User.belongsTo(AclSettings, {foreignKey: 'acl_settings_id',as: 'acl_settings'});
AclSettings.hasMany(User, {foreignKey: 'acl_settings_id',as: 'users'});
User.hasMany(VoicePlan, { foreignKey: "user_id" });

User.hasMany(Queue, { foreignKey: 'created_by', as: 'created_queues' });

UserJourney.belongsTo(User, { foreignKey: "created_by", as: "creator" });
User.hasMany(UserJourney, { foreignKey: "created_by", as: "creator" });

DataCenter.hasMany(ServerManagement, { foreignKey: 'data_center_id', as: 'server_managements' });
ServerManagement.belongsTo(DataCenter, { foreignKey: 'data_center_id',  as: 'data_center' });

IncomingSummary.belongsTo(User, { foreignKey: "user_id", as: "user" });
IncomingSummary.belongsTo(User, { foreignKey: "parent_id", as: "parent" });
IncomingSummary.belongsTo(User, { foreignKey: "s_parent_id", as: "sParent" });

VoicePlan.belongsTo(User, { foreignKey: "user_id", as: "user" });

Queue.belongsTo(Extension, { foreignKey: 'extension', as: 'extension_data' });
Queue.belongsTo(User, { foreignKey: 'created_by', as: 'created_by_user' });

Extension.hasMany(Queue, { foreignKey: 'extension', as: 'queues' });



CallCenter.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
CallCenter.belongsTo(CountryCode, { foreignKey: 'country_code_id', as: 'country_code' });
CallCenter.belongsTo(Timezone, { foreignKey: 'timezone_id', as: 'timezone' });
CallCenter.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });


User.belongsToMany(CallCenter, {
  through: UserCallCentres,
  foreignKey: 'user_id',
  otherKey: 'call_centre_id',
});

CallCenter.belongsToMany(User, {
  through: UserCallCentres,
  foreignKey: 'call_centre_id',
  otherKey: 'user_id',
});

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
    Operator,
    DownloadReport,
    IncomingSummary,
    CallStrategy,
    VoiceCategory,
    CallCenter,
    Company,
    VoicePlan,
    VoipProfile,
    TelephonyProfile,
    Subscriber,
    TelephonyProfileItem,
    Extension,
    Call,
    Queue,
    UserCallCentres,
    IncomingReport,
    AgentGroup,
};
