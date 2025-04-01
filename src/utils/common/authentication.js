const { ServerConfig } = require('../../config');
const { StatusCodes } = require("http-status-codes");
const jwt = require('jsonwebtoken');
const { USERS_ROLE, PERMISSION_TYPES, COMPANY_USERS_MAP } = require('./constants');

/** */
async function verifyJWToken(token) {

    try {
        const decoded = jwt.verify(token, ServerConfig.JWT_SECRET);
        return decoded;
    } catch (error) {
        const ErrorResponse = {}
        if(error.name == 'TokenExpiredError'){
            ErrorResponse.message = 'TokenExpiredError';
            throw ErrorResponse

        }
        throw error;
    }

}


/**
 * List of roles the given user role can access
 */
function getUserAccessRoles(user_role, permission_type) {


    let userAccessRoles = [];
    switch (user_role) {

        case USERS_ROLE.SUPER_ADMIN:
            userAccessRoles = {
                [PERMISSION_TYPES.READ]: [USERS_ROLE.RESELLER, USERS_ROLE.SUB_SUPERADMIN],
                [PERMISSION_TYPES.CREATE]: [USERS_ROLE.RESELLER, USERS_ROLE.SUB_SUPERADMIN],
                [PERMISSION_TYPES.UPDATE]: [USERS_ROLE.RESELLER, USERS_ROLE.SUB_SUPERADMIN],
                [PERMISSION_TYPES.DELETE]: [USERS_ROLE.RESELLER, USERS_ROLE.SUB_SUPERADMIN],
            }
            break;

        case USERS_ROLE.RESELLER:
            userAccessRoles = {
                [PERMISSION_TYPES.READ]: [USERS_ROLE.COMPANY_ADMIN],
                [PERMISSION_TYPES.CREATE]: [USERS_ROLE.COMPANY_ADMIN],
                [PERMISSION_TYPES.UPDATE]: [USERS_ROLE.COMPANY_ADMIN],
                [PERMISSION_TYPES.DELETE]: [USERS_ROLE.COMPANY_ADMIN]
            }
            break;

        case USERS_ROLE.COMPANY_ADMIN:
            userAccessRoles = {
                [PERMISSION_TYPES.READ]: [USERS_ROLE.COMPANY_ADMIN, USERS_ROLE.CALLCENTRE_ADMIN],
                [PERMISSION_TYPES.CREATE]: [USERS_ROLE.COMPANY_ADMIN, USERS_ROLE.CALLCENTRE_ADMIN],
                [PERMISSION_TYPES.UPDATE]: [USERS_ROLE.COMPANY_ADMIN, USERS_ROLE.CALLCENTRE_ADMIN],
                [PERMISSION_TYPES.DELETE]: [USERS_ROLE.COMPANY_ADMIN, USERS_ROLE.CALLCENTRE_ADMIN]
            }
            break;

        case USERS_ROLE.CALLCENTRE_ADMIN:
            userAccessRoles = {
                [PERMISSION_TYPES.READ]: [USERS_ROLE.CALLCENTRE_ADMIN, USERS_ROLE.CALLCENTRE_AGENT, USERS_ROLE.CALLCENTRE_TEAM_LEAD],
                [PERMISSION_TYPES.CREATE]: [USERS_ROLE.CALLCENTRE_ADMIN, USERS_ROLE.CALLCENTRE_AGENT, USERS_ROLE.CALLCENTRE_TEAM_LEAD],
                [PERMISSION_TYPES.UPDATE]: [USERS_ROLE.CALLCENTRE_ADMIN, USERS_ROLE.CALLCENTRE_AGENT, USERS_ROLE.CALLCENTRE_TEAM_LEAD],
                [PERMISSION_TYPES.DELETE]: [USERS_ROLE.CALLCENTRE_ADMIN, USERS_ROLE.CALLCENTRE_AGENT, USERS_ROLE.CALLCENTRE_TEAM_LEAD]
            }
            break;
         
        case USERS_ROLE.SUB_SUPERADMIN:
            userAccessRoles = {
                [PERMISSION_TYPES.READ]: [USERS_ROLE.RESELLER],
                [PERMISSION_TYPES.CREATE]: [USERS_ROLE.RESELLER],
                [PERMISSION_TYPES.UPDATE]: [USERS_ROLE.RESELLER],
                [PERMISSION_TYPES.DELETE]: [USERS_ROLE.RESELLER],
            }
            break;    



    }

    return permission_type ? userAccessRoles[permission_type] : userAccessRoles;

}


function ifAssociateCompany(create_user_role) {
    return Boolean([USERS_ROLE.RESELLER, USERS_ROLE.COMPANY_ADMIN, USERS_ROLE.SUB_SUPERADMIN].includes(create_user_role));
}

//Function to return the company category as per the CREATOR role, i.e is the creator who is creating the user and corresponding company
function getUserAssociatedCompanyCategory(create_user_role){
    return COMPANY_USERS_MAP[create_user_role];
}

function checkPermission(createrRole , userRole){
    const permissions = getUserAccessRoles(createrRole,PERMISSION_TYPES.CREATE);
    if(permissions.includes(userRole)) return true;
    return false;
}


module.exports = {
    verifyJWToken,
    getUserAccessRoles,
    ifAssociateCompany,
    getUserAssociatedCompanyCategory,
    checkPermission
}