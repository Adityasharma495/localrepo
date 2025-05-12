const CrudRepository = require("./crud-repository");
const TelephonyProfileItem = require("../c_db/telephony-profile-items")
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");

class TelephonyProfileItems extends CrudRepository
{
    constructor() {
        super(TelephonyProfileItem)
      }
      async create(telephonyProfileId, data) {
        try {
          let response;
      
          if (Array.isArray(data)) {
            const dataWithProfileId = data.map((item) => ({
              ...item,
              telephony_profile_id: telephonyProfileId,
            }));
            response = await this.model.bulkCreate(dataWithProfileId);
          } else {
            response = await this.model.create({
              ...data,
              telephony_profile_id: telephonyProfileId,
            });
          }
      
          return response;
        } catch (error) {
          throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
      }
      

}

module.exports = TelephonyProfileItems