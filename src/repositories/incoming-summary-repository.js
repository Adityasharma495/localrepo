const CrudRepository = require("./crud-repository");
const incomingSummaryModel = require("../db/incoming-summary");
const { constants} = require("../utils/common");
const statusValues = constants.STATUS_LABEL;


class IncomingSummaryRepository extends CrudRepository {
  constructor() {
    super(incomingSummaryModel);
  }

  async getAll(userId) {
    try {
      const query = userId ? { user_id: userId } : {};
  
      const response = await incomingSummaryModel.find(query)
        .populate('user_id', ["_id", "username"])
        .populate('parent_id', ["_id", "username"])
        .populate('s_parent_id', ["_id", "username"])
        .lean();
  
      return response;
    } catch (error) {
      throw error;
    }
  }

  async isSummaryExist(userId,incomingdid,startDate) {
        
        let startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);

        let endOfDay = new Date(startDate);
        endOfDay.setHours(23, 59, 59, 999);
        try {
            let response = await this.model.findOne({
                $and: [
                    { did: incomingdid },
                    { user_id : userId },
                    {  schedule_date: {
                                       $gte: startOfDay,
                                       $lt: endOfDay      
                                      }
                    }
                ]
            });
            return response;
        }
        catch (error) {
            throw error;
        }
    }


     async updateSummary(data) {
        let startOfDay = new Date(data.schedule_date);
        startOfDay.setHours(0, 0, 0, 0);

        let endOfDay = new Date(data.schedule_date);
        endOfDay.setHours(23, 59, 59, 999);
        const response = await this.model.findOneAndUpdate(
                          {
                            $and: [
                                    { user_id: data.user_id },
                                    { did: data.did },
                                    {  schedule_date:
                                                    {
                                                     $gte: startOfDay,
                                                     $lt: endOfDay
                                                    }
                                    }
                                  ]
                          }, 
                          data, 
                          { runValidators: true, new: true }
                        );
        return response;
    }
}

module.exports = IncomingSummaryRepository;
