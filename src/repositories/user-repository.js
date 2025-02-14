const CrudRepository = require('./crud-repository');
const userModel = require('../db/users');
const { constants, Authentication } = require('../utils/common');
const {USERS_ROLE} = require('../utils/common/constants');

const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

class UserRepository extends CrudRepository{

    constructor(){
        super(userModel);
    }

    async getByUsername(username){
        
        try {
            
            const user = await userModel.findOne({ username });
            return user;    

        } catch (error) {
         
            throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);

        }
        
    }

    async getAllByRoles(current_uid, current_user_role, given_user_role){
        

        //Get user status as {0: 'Inactive', 1: 'Active'}
        const userStatusValues = constants.USERS_STATUS_VALUES_LABEL;

        //Get role specified as the param
        if(given_user_role){
            var currentUserReadAccessRoles = given_user_role;
        }
        //If role is not specified, get user roles which can be READ by the current user
        else{
            const PERMISSION_TYPE_READ = constants.PERMISSION_TYPES.READ;
            var [currentUserReadAccessRoles] = Authentication.getUserAccessRoles(current_user_role, PERMISSION_TYPE_READ);
        }


        try {
            let data;
            // If role is "Superadmin show all the users"
            if (current_user_role === 'role_sadmin') {
                data = await userModel.find({
                    is_deleted: false,
                }).sort({ createdAt: -1 }).lean();
            } else {
                data = await userModel.find({

                    is_deleted: false,
                    createdBy: current_uid
                }).sort({ createdAt: -1 }).lean();
            }
            
            
            
            //Remove password field and convert status to its corresponding label
            //{0: 'Inactive', 1: 'Active'}
            data = data.map( val => {
                val['status'] = userStatusValues[ val['status'] ];
                val['password'] = undefined;
                return val;
            } );
            
            return data;

        } catch (error) {

            throw error;

        }

    }


    async get(id) {

        try {
            const response = await this.model.findById(id).populate('companies._id').exec();
            if (!response) {
                throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
            }
            return response;         
        } catch (error) {
            throw error;
        }

    }


    async getCallCentreUsers(call_centre_id) {

        try {

            //Get user status as {0: 'Inactive', 1: 'Active'}
            const userStatusValues = constants.USERS_STATUS_VALUES_LABEL;
            
            let data = await this.model.find({
                createdBy: call_centre_id, is_deleted: false
            }).sort({ createdAt: -1 }).lean();

            //TODO: Make it dynamic (modular)
            //Remove password field and convert status to its corresponding label
            data = data.map(val => {
                val['status'] = userStatusValues[val['status']];
                val['password'] = undefined;
                return val;
            });

            return data;

        } catch (error) {

            throw error;
            
        }
        
    }

    async getByUserRole(userRole){
        
        try {
            
            const user = await userModel.findOne({ role:  userRole});
            return user;    

        } catch (error) {
         
            throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);

        }
        
    }

    async deleteMany(idArray, loggedUser) {
        try {
            if (loggedUser.role === USERS_ROLE.SUPER_ADMIN || loggedUser.role === USERS_ROLE.SUB_SUPERADMIN) {
                for (const userId of idArray) {
                    const userData = await this.get(userId);
                    if (userData.createdBy.toString() !== loggedUser.id.toString()) {
                        throw new Error("One or more users were not created by the logged-in superadmin, so deletion is not allowed.");
                    }
                }
            }
    
            for (const userId of idArray) {
                const parentDetail = await this.findOne({ createdBy: userId });

                if (parentDetail !== null) {
                    throw new Error("One or more records cannot be deleted as they have child records.");
                }
            }
    
            const response = await super.deleteMany(idArray);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getForLicence(id) {

        try {
            const response = await this.model.findById(id).populate('sub_user_licence_id').exec();
            if (!response) {
                throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
            }
            return response;         
        } catch (error) {
            throw error;
        }

    }
    

}

module.exports = UserRepository;