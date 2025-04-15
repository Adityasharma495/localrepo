function extractValuesLabelObj(input_object) {

    const outputObject = {};
    for (const key in input_object) {
        outputObject[input_object[key].value] = input_object[key].label;
    }

    return outputObject;

}

function extractKeyValuesObj(input_object) {

    const outputObject = {};
    for (const key in input_object) {
        outputObject[key] = input_object[key].value;
    }

    return outputObject;

}

const USERS_STATUS = {
    ACTIVE: { value: 1, label: 'Active' },
    INACTIVE: { value: 0, label: 'Inactive' }
}
//Get { 0: 'Inactive', 1: 'Active' }
const USERS_STATUS_VALUES_LABEL = extractValuesLabelObj(USERS_STATUS);
//Get { ACTIVE: 1, INACTIVE: 0 }
const USERS_STATUS_KEY_VALUES = extractKeyValuesObj(USERS_STATUS);

const USERS_ROLE = {
    SUPER_ADMIN: 'role_sadmin',
    RESELLER: 'role_reseller',
    COMPANY_ADMIN: 'role_cadmin',
    CALLCENTRE_ADMIN: 'role_ccadmin',
    CALLCENTRE_TEAM_LEAD: 'role_ccteamlead',
    CALLCENTRE_AGENT: 'role_ccagent',
    SUB_SUPERADMIN: "role_sub_superadmin"
}

const USER_ROLE_VALUE = {
    role_sadmin: 'Super Admin',
    role_reseller: 'Reseller',
    role_cadmin: 'Campany Admin',
    role_ccadmin: 'Callcenter Admin',
    role_ccteamlead: 'Callcenter Team Lead',
    role_ccagent: 'Callcenter Agent',
    role_sub_superadmin: 'Sub Superadmin'
}

const COMPANY_TYPES = {
    RESELLER: 'type_reseller',
    CADMIN: 'type_cadmin',
    SUPERADMIN: 'type_sadmin'
}

//Which role user can create which type of company
const COMPANY_USERS_MAP = {
    [USERS_ROLE.SUPER_ADMIN]: COMPANY_TYPES.RESELLER,
    [USERS_ROLE.RESELLER]: COMPANY_TYPES.CADMIN
}

const PERMISSION_TYPES = {
    READ: 'permission_read',
    CREATE: 'permission_create',
    UPDATE: 'permission_update',
    DELETE: 'permission_delete'
}

const VALIDATIONS = {
    MIN_PASSWORD_LENGTH: 6
}

const MODEL = {
    USERS: 'users',
    COMPANIES: 'companies',
    TRUNKS: 'trunks',
    NUMBERS: 'numbers',
    COUNTRY_CODE: 'countryCode',
    CODEC: 'codecs',
    OPERATORS: 'operators',
    CALLS: 'calls',
    TIMEZONES: 'timezones',
    DATACENTER: 'data_center',
    SERVERMANAGEMENT: 'server_management',
    MODULE: 'module',
    USER_JOURNEY: 'user_journey',
    ACL_SETTINGS: 'acl_setting',
    NUMBER_STATUS: 'number_status',
    NUMBER_FILES_LIST: 'number_files_list',
    DID_USER_MAPPING: 'did_user_mapping',
    AGENTS: 'agents',
    AGENTS_GROUP: 'agent_groups',
    EXTENSION: 'extension',
    LICENCE : 'licence',
    QUEUE: 'queue',
    PROMPT:'prompt',
    FLOWS_EDGES: 'flow_edge',
    LANGUAGE: 'language',
    MEMEBER_SCHEDULES: 'member_schedules',
    SUB_USER_LICENCE: 'sub_user_licence',
    FLOW_JSON: 'flows_json',
    CREDITS: 'credit_history',
    INCOMING_SUMMARY: 'incoming_summary',
    INCOMING_REPORTS: 'incoming_report',
    DOWNLOAD_REPORTS: 'download_report',
    VOIP_PROFILE: 'voip_profile',
    TELEPHONY_PROFILE: 'telephony_profile',
    VOICE_PLAN: 'voice_plans'
}

const AUTH_TYPES = {
    REGISTRATION: 1,
    IP: 2
}

const AUTH_TYPES_LABEL = {
    [AUTH_TYPES.REGISTRATION]: 'Registration',
    [AUTH_TYPES.IP]: 'IP'
}

const TRUNKS_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0
}

const TRUNKS_STATUS_LABEL = {
    [TRUNKS_STATUS.ACTIVE]: "Active",
    [TRUNKS_STATUS.INACTIVE]: "Inactive"
}

const OPERATOR_TYPES = {
    AIRTEL: 1,
    JIO: 2
}

const USER_CREDITS_ACTION = {
    ADD: "addition",
    DEDUCT: "deduction"
  }

const OPERATOR_TYPES_LABEL = {
    [OPERATOR_TYPES.AIRTEL]: 'Airtel',
    [OPERATOR_TYPES.JIO]: 'Jio'
}

const NUBMERS_STATUS = {
    ENABLED: { value: 1, label: 'Enabled' },
    DISABLED: { value: 0, label: 'Disabled' }
}

//Get { 1: 'Enabled', 0: 'Disabled' }
const NUBERS_STATUS_VALUES_LABEL = extractValuesLabelObj(NUBMERS_STATUS);
//Get { ENABLED : 1, DISABLED: 0 }
const NUMBERS_STATUS_KEY_VALUES = extractKeyValuesObj(NUBMERS_STATUS);

const NUMBERS_FORMAT = {
    RANGE: 'RANGE',
    FILE: 'FILE'
}

const NUMBERS_CONSTANTS = {
    FILE_PATH: "assets",
    FILE_NAME: "phone_numbers",
    FILE_EXT: ".txt",
    FULL_PATH: "../utils/upload/phone_numbers.txt",
    MAX_RANGE_LENGTH: 14,
    MIN_RANGE_LENGTH: 7,
    DID_FILE_CLOUMNS: ['Country Code', 'State Code', 'DID', 'Cost', 'Operator'],
    OTHER_FILE_COLUMN: ['Country Code', 'DID', 'Cost', 'Operator'],
    UPLOAD_DID_VMN_COLUMN: ['DID','STATUS','VMN'],
    UPLOAD_DID_TOLLFREE_COLUMN: ['DID','STATUS','TOLL FREE'],
    BULK_UPDATE_DID: ['DID', 'Category', 'Currency' , 'Country Code', 'State Code', 'Cost', 'Operator', 'Status'],
    BULK_UPDATE_OTHERS: ['DID', 'Currency' , 'Country Code', 'Cost', 'Operator', 'Status']
}

const OPERATOR_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0
}

const OPERATORS_STATUS_LABEL = {
    [OPERATOR_STATUS.ACTIVE]: "Active",
    [OPERATOR_STATUS.INACTIVE]: "Inactive"
}

const DATA_CENTER_TYPE = {
    DOMESTIC: 0,
    INTERNATIONAL: 1
}

const DATA_CENTER_TYPE_LABEL = ['Domestic', 'International']

const STATUS = {
    ACTIVE: 1,
    INACTIVE: 0
}

const STATUS_LABEL = {
    [STATUS.ACTIVE]: "Active",
    [STATUS.INACTIVE]: "Inactive"
}

const MODULE_LABEL = {
    USERS: 'Users',
    NUMBERS: 'Numbers',
    TRUNKS: 'Trunks',
    SERVER_MANAGEMENT: 'Server Management',
    DATA_CENTER: 'Data Center',
    IVR: 'ivr',
    CALL_CENTER: 'Call Center',
    MODULE: 'Module',
    OPERATOR: 'Operator',
    COUNTRY_CODE: 'County Code',
    COMPANY: 'Compnany',
    CALLS: 'Calls',
    ACL_SETTINGS: 'Acl Settings',
    NUMBER_FILE_LIST: 'Number Filelist',
    AGENT: 'Agent',
    AGENT_GROUP: 'Agent Group',
    EXTENSION: 'extension',
    QUEUE: 'queue',
    PROMPTS: 'Prompts',
    CREDITS: 'Credits',
    VOICE_PLAN: 'Voice Plan'
}

const ACTION_LABEL = {
    ADD: 'Add',
    EDIT: 'Edit',
    DELETE: 'Delete',
    UPLOAD: 'Upload',
    ASSIGN_BULK_DID: 'Assign Bulk DID',
    ASSIGN_INDIVIDUAL_DID:'Assign Individual DID',
    STATUS_ACTION_APPROVED: 'Status Action Approve',
    STATUS_ACTION_REJECT: 'Status Action Reject',
    STATUS_UPDATE:"status updated",
    LOGIN: 'Login',
    LOGOUT: 'Logout'
}
const BACKEND_API_BASE_URL =
  process.env.NODE_ENV == "production"
    ? "https://voiceboxapi.nspl.cloud"
    : "http://localhost:3900";
    
//  const BACKEND_API_BASE_URL =
//   process.env.NODE_ENV == "production"
//     ? "http://localhost:3900"
//     : "http://localhost:3900";

const NUMBER_STATUS_VALUE = ['status','Available', 'Reserved ', 'Blocked', 'Archived', 'Terminated', 'Demo', 'Live', 'Delete', 'Pending', 'Reject']

const NUMBER_STATUS_LABLE = {
    Available: 1,
    Reserved: 2,
    Blocked: 3,
    Archived: 4,
    Terminated: 5,
    Demo: 6,
    Live: 7,
    Delete: 8,
    Pending: 9,
    Reject: 10
  }

const DID_ALLOCATION_LEVEL= {
   RESELLER: 1,
   COMPANY_ADMIN: 2,
   SUB_COMPANY_ADMIN: 3,
   CALLCENTER: 4
}

const PREFIX_VALUE = 10
const PREFIX_LENGTH = 5

const OPEN_WRAPUP = {
    AFTER_CALL: 1,
    DURING_CALL: 2,
    TURN_OFF: 3
}

const DEFAULT_WRAPUP_TAG = {
    CALL_COMPLETED: 1
}

const ACCESS_CONTROL = {
    ADMIN: "Admin",
    REGULAR:"Regular",
    GROUP_OWNER:"Group Owner"
}


const AGENT_TYPE = {
    NORMAL: "Normal",
    BROWSER_PHONE:"Browser Phone",
    SOFT_PHONE:"Soft Phone"
}

const AGENT_LOGIN_STATUS ={
    ACTIVE:"1",
    INACTIVE:"0"
}

const WEEK_DAYS = {
    DAYS:['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
}

const STORAGE_PATH =  "/home/dev/cloud-telephony/backend/"

const SERVER ={
    PROD:"production",
    DEV:"development"
}

const SUB_LICENCE_ROLE = ["role_cadmin", "role_ccadmin", "role_ccagent", "role_ccteamlead"];

const BACKEND_BASE_URL =
  process.env.NODE_ENV == "production"
    ? "voiceboxapi.nspl.cloud"
    : "voiceboxapi.nspl.cloud";



    const AUTH_TYPE_NUM_TO_STRING = {
        1: 'REGISTRATION',
        2: 'IP',
        '1': 'REGISTRATION',
        '2': 'IP',
        'IP': "IP",
        'Registration': "REGISTRATION"
      };

module.exports = {
    USERS_STATUS,
    USERS_STATUS_VALUES_LABEL,
    USERS_STATUS_KEY_VALUES,
    USERS_ROLE,
    COMPANY_TYPES,
    PERMISSION_TYPES,
    VALIDATIONS,
    MODEL,
    COMPANY_USERS_MAP,
    NUBMERS_STATUS,
    NUBERS_STATUS_VALUES_LABEL,
    NUMBERS_STATUS_KEY_VALUES,
    NUMBERS_FORMAT,
    NUMBERS_CONSTANTS,
    AUTH_TYPES,
    AUTH_TYPES_LABEL,
    TRUNKS_STATUS,
    OPERATOR_TYPES,
    TRUNKS_STATUS_LABEL,
    OPERATOR_TYPES_LABEL,
    OPERATOR_STATUS,
    OPERATORS_STATUS_LABEL,
    DATA_CENTER_TYPE,
    DATA_CENTER_TYPE_LABEL,
    STATUS_LABEL,
    MODULE_LABEL,
    ACTION_LABEL,
    BACKEND_API_BASE_URL,
    NUMBER_STATUS_VALUE,
    NUMBER_STATUS_LABLE,
    DID_ALLOCATION_LEVEL,
    PREFIX_VALUE,
    PREFIX_LENGTH,
    OPEN_WRAPUP,
    DEFAULT_WRAPUP_TAG,
    ACCESS_CONTROL,
    AGENT_TYPE,
    AGENT_LOGIN_STATUS,
    WEEK_DAYS,
    STORAGE_PATH,
    SERVER,
    SUB_LICENCE_ROLE,
    USER_ROLE_VALUE,
    USER_CREDITS_ACTION,
    BACKEND_BASE_URL,
    AUTH_TYPE_NUM_TO_STRING
}