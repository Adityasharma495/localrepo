const CrudRepository = require('./crud-repository');
const User = require('../c_db/User');
const SubUserLicence = require("../c_db/sub-user-licence")
const Company = require("../c_db/companies")
const { constants, Authentication } = require('../utils/common');
const {USERS_ROLE} = require('../utils/common/constants');

const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

class UserRepository extends CrudRepository{

    constructor(){
        super(User);
    }

    async getByUsername(username){
        try {
            const user = await User.findOne({ where: { username } });
            return user;    

        } catch (error) {
         
            throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);

        }
        
    }

    async getAllByRoles(current_uid, current_user_role, given_user_role) {
        let rolesToQuery;
        if (given_user_role) {
          rolesToQuery = given_user_role;
        } else {
          const PERMISSION_TYPE_READ = constants.PERMISSION_TYPES.READ;
          [rolesToQuery] = Authentication.getUserAccessRoles(current_user_role, PERMISSION_TYPE_READ);
        }
      
        try {
          let whereCondition = {
            is_deleted: false,
          };
      
          if (current_user_role !== 'role_sadmin') {
            whereCondition.created_by = current_uid;
          }
      
          let data = await User.findAll({
            where: whereCondition,
            order: [['created_at', 'DESC']],
            attributes: { exclude: ['password'] },
            include: [
              {
                model: User,
                as: 'createdByUser',
              },
            ],
          });
      
          const plainData = data.map(user => {
            const json = user.toJSON();
          
            return {
              ...json,
              created_by: json.createdByUser || null,
              createdByUser: undefined  
            };
          });
      
          return plainData;
      
        } catch (error) {
          console.error("Error fetching users by roles:", error);
          throw error;
        }
      }
      
      


    async get(id) {
        try {
            const response = await this.model.findByPk(id);
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
            }).sort({ createdAt: -1 }) ;

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
                    if (userData.created_by.toString() !== loggedUser.id.toString()) {
                        throw new Error("One or more users were not created by the logged-in superadmin, so deletion is not allowed.");
                    }
                }
            }
    
            for (const userId of idArray) {
                const parentDetail = await this.findOne({ created_by: userId });

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
            const response = await User.findByPk(id, {
                include: [
                  {
                    model: SubUserLicence,
                    as: 'sub_user_licence',
                  }
                ]
              });
            if (!response) {
                throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
            }
            return response;         
        } catch (error) {
            throw error;
        }

    }

    async getByName(name) {
      try {
        const user = await User.findOne({
          where: { name : name }
        });
    
        return user;
      } catch (error) {
        console.log('error', error);
        throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
      }
    }
    
    

}

module.exports = UserRepository;