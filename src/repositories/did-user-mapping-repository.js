const CrudRepository = require("./crud-repository");
const numberUserMappingModel = require("../db/did-user-mapping");

class NumberUserMappingRepository extends CrudRepository {
  constructor() {
    super(numberUserMappingModel);
  }

  async insertMany(records) {
    try {
        const response = await this.model.insertMany(records);
        return response;
    } catch (error) {
        throw error;
    }
  }

  async update(id, data) {
    const response = await this.model.findOneAndUpdate({ _id: id}, data, { runValidators: true, new: true });
    return response;
  }


  async getForOthers(id) {
    try {
      const totalNumbers = await this.model.find({
        'mapping_detail.allocated_to': id,
        'mapping_detail.active': true
      })
      .populate('mapping_detail.allocated_to', '_id username')
      .populate('mapping_detail.voice_plan_id')
      .populate('DID')
      .exec();
  
      // Filter & format
      const filtered = totalNumbers
        .map(item => {
          const filteredMapping = item.mapping_detail.filter(md =>
            md.allocated_to?._id?.toString() === id.toString() && md.active
          );
          return {
            ...item.toObject(),
            mapping_detail: filteredMapping
          };
        })
        .filter(item => item.mapping_detail.length > 0); // <-- remove entries with no matching mapping_detail
  
      return filtered;
  
    } catch (error) {
      throw error;
    }
  }
  

  async getForSuperadmin(id) {
    try {
      const totalNumbers = await this.model.find({
        mapping_detail: {
          $elemMatch: {
            $or: [
              { allocated_to: id },
              { parent_id: id }
            ],
            active: true
          }
        }
      })
      .populate('mapping_detail.allocated_to', '_id username')
      .populate('mapping_detail.voice_plan_id')
      .populate('DID')
      .exec();
  
      // Optional: filter only relevant mapping_detail entries
      const filtered = totalNumbers.map(item => {
        const filteredMapping = item.mapping_detail.filter(md =>
          (md.allocated_to?.toString() === id.toString() ||
           md.parent_id?.toString() === id.toString()) &&
          md.active
        );
        return {
          ...item.toObject(),
          mapping_detail: filteredMapping
        };
      });
  
      return filtered;
    } catch (error) {
      throw error;
    }
  }
  

  async findOne(conditions) {
    try {
        const response = await this.model.findOne({ ...conditions}).populate("DID").exec();
        return response;
    } catch (error) {
        throw error;
    }
  }

  async get(data) {

    try {

      const response = await this.model.findById(data);
      if (!response) {
        throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
      }
      return response;

    } catch (error) {

      throw error;

    }

  }

  async addMappingDetail(documentId, newDetail) {
    await this.model.updateOne(
      { DID: documentId },
      {
        $push: {
          mapping_detail: newDetail
        }
      }
    );
  }

  async updateMappingDetail(did, newDetail) {
    await this.model.updateOne(
      {
        DID: did,
        'mapping_detail.allocated_to': newDetail.allocated_to
      },
      {
        $set: {
          'mapping_detail.$.active': newDetail.active,
          'mapping_detail.$.voice_plan_id': newDetail.voice_plan_id
        }
      }
    );
  }

  async checkMappingIfNotExists(did, newDetail) {
    const record = await this.model.findOne({
      DID: did,
      mapping_detail: {
        $elemMatch: { ...newDetail }
      }
    });
  
    if (!record) return null;
  
    const filteredMapping = record.mapping_detail.filter(detail => {
      return Object.entries(newDetail).every(([key, value]) => {
        return detail[key]?.toString() === value?.toString();
      });
    });
  
    const result = {
      ...record.toObject(),
      mapping_detail: filteredMapping
    };
  
    return result;
  }
  

}

module.exports = NumberUserMappingRepository;