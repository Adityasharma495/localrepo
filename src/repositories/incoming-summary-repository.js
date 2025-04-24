const CrudRepository = require("./crud-repository");
const incomingSummaryModel = require("../db/incoming-summary");
const { constants} = require("../utils/common");
const statusValues = constants.STATUS_LABEL;
const mongoose = require('mongoose');


class IncomingSummaryRepository extends CrudRepository {
  constructor() {
    super(incomingSummaryModel);
  }

  async getAll(userId) {
    try {
      const query = userId ? { user_id: userId } : {};
  
      const response = await incomingSummaryModel.find()
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
        startOfDay.setUTCHours(0, 0, 0, 0);

        let endOfDay = new Date(startDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        console.log("comesss 1");
        try {
            const filters = [
                           { did: incomingdid },
                           { schedule_date: { $gte: startOfDay, $lt: endOfDay } }
            ];

           if(mongoose.Types.ObjectId.isValid(userId)) {
                  filters.push({ user_id: new mongoose.Types.ObjectId(userId) });
           }

           let response = await this.model.findOne({
                   $and: filters
           });
           return response;
        }
        catch (error) {
            throw error;
        }
    }


     async updateSummary(data, startdate) {
        let startOfDay = new Date(startdate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        let endOfDay = new Date(startdate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const filters = [
                           { did: data.did },
                           { schedule_date: { $gte: startOfDay, $lt: endOfDay } }
        ];

        if (mongoose.Types.ObjectId.isValid(data.user_id)) {
                  filters.push({ user_id: new mongoose.Types.ObjectId(data.user_id) });
        }
        const response = await this.model.findOneAndUpdate(
                          {
                            $and: filters
                          }, 
                          data, 
                          { runValidators: true, new: true }
         );
        return response;
    }
}

module.exports = IncomingSummaryRepository;
