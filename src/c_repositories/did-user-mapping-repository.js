const CrudRepository = require("./crud-repository");
const { DIDUserMapping } = require("../c_db"); 
const { Op, fn, col, literal } = require('sequelize');
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const Sequelize = require('../config/sequelize');
const VoicePlansRepository = require('./voice-plans-repository');
const voicePlansRepo = new VoicePlansRepository();

class DIDUserMappingRepository extends CrudRepository {
  constructor() {
    super(DIDUserMapping);
  }

  async insertMany(records) {
    try {
      if (!Array.isArray(records)) {
        throw new AppError("Records must be an array", StatusCodes.BAD_REQUEST);
      }
      return await this.model.bulkCreate(records);
    } catch (error) {
      console.error("Error in insertMany:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const [updatedRows, [updatedRecord]] = await this.model.update(data, {
        where: { id },
        returning: true,
      });

      if (updatedRows === 0) {
        throw new AppError("No record found to update", StatusCodes.NOT_FOUND);
      }

      return updatedRecord;
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  }

  async getForOthers(id) {
    try {
      if (!id) {
        throw new AppError("ID is required", StatusCodes.BAD_REQUEST);
      }
  
      const rows = await this.model.findAll({
        where: {
          mapping_detail: {
            [Op.ne]: null,
          },
        },
        order: [['created_at', 'DESC']],
      });
  

      // console.log("ROWS", rows);
      let data = rows.map(row => row.toJSON());
  
      const filtered = data.filter(item => {
        return item.mapping_detail.some(md => {

          if (md && (md.allocated_to == id)) {
            return true;
          }
          return false;
        });
      });
  
      return filtered;
    } catch (error) {
      console.error("Error in getForOthers:", error);
      throw error;
    }
  }

  async findAll(conditions) {
    try {
      const response = await this.model.findAll(conditions);
  
      if (!response) {
        throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
      }
  
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getForSuperadmin(id) {
    try {
      if (!id) {
        throw new AppError("ID is required", StatusCodes.BAD_REQUEST);
      }
  
      const rows = await this.model.findAll({
        where: literal(`
          EXISTS (
            SELECT 1 FROM jsonb_array_elements("mapping_detail") AS elem
            WHERE 
              (
                elem->>'allocated_to' = '${id}' OR
                elem->>'parent_id' = '${id}'
              )
              AND (elem->>'active')::boolean = true
          )
        `),
        order: [['created_at', 'DESC']],
      });
  
      const data = rows.map(row => row.toJSON());
  
      // Optional: return only matched mapping_detail elements
      const result = data.map(item => ({
        ...item,
        mapping_detail: item.mapping_detail.filter(md =>
          (md.allocated_to == id || md.parent_id == id) && md.active === true
        )
      }));
  
      return result;
  
    } catch (error) {
      console.error("Error in getForSuperadmin:", error);
      throw error;
    }
  }
  

  async findOne(conditions) {
    try {
      return await this.model.findOne({ where: conditions });
    } catch (error) {
      console.error("Error in findOne:", error);
      throw error;
    }
  }

  async get(id) {
    try {
      const response = await this.model.findByPk(id);
      if (!response) {
        throw new AppError("Not able to find the resource", StatusCodes.NOT_FOUND);
      }
      return response;
    } catch (error) {
      console.error("Error in get:", error);
      throw error;
    }
  }




  async addMappingDetail(documentId, newDetail) {
    try {
      const result = await this.model.update(
        { 
          mapping_detail: literal(
            `mapping_detail || '[${JSON.stringify(newDetail)}]'`
          )
        },
        { where: { DID: documentId } }
      );
      return result;              // ← return the raw update result
    } catch (error) {
      console.error("Error adding mapping detail:", error);
      throw error;
    }
  }

  // async addMappingDetail(documentId, newDetail) {

  //   console.log("DOCUEMNT ID NEWDTAIL", documentId, newDetail);
  //   try {
  //     await this.model.update(
  //       {
  //         mapping_detail: Sequelize.jsonb.arrayAppend('mapping_detail', newDetail), // Appends newDetail to the mapping_detail array
  //       },
  //       {
  //         where: {
  //           DID: documentId,
  //         },
  //       }
  //     );
  //     console.log("Mapping detail added successfully.");
  //   } catch (error) {
  //     console.error("Error adding mapping detail:", error);
  //     throw error;
  //   }
  // }
  
  async checkMappingIfNotExists(did, newDetail) {
    try {
      const record = await this.model.findOne({
        where: {
          DID: did,
          mapping_detail: {
            [Op.contains]: [newDetail],
          },
        },
      });
  
      if (!record) return null;

      const filteredMapping = record.mapping_detail.filter(detail => {
        return Object.entries(newDetail).every(([key, value]) => {
          return detail[key]?.toString() === value?.toString();
        });
      });

      const result = {
        ...record.toJSON(), 
        mapping_detail: filteredMapping,
      };
  
      return result;
    } catch (error) {
      console.error("Error in checkMappingIfNotExists:", error);
      throw error;
    }
  }

  
  async deleteMappingDetail(did, newDetail) {
    try {
      const record = await this.model.findOne({
        where: { DID: did },
        raw: false,
      });
  
  
      if (!record) return;
  
      // ✅ Correct way to access mapping_detail
      let originalDetails = record.dataValues?.mapping_detail || record.mapping_detail;
  
      if (typeof originalDetails === 'string') {
        originalDetails = JSON.parse(originalDetails);
      }

  
      if (!Array.isArray(originalDetails)) {
        console.error("mapping_detail is not an array!");
        return;
      }
  
      const updatedDetails = (originalDetails || []).filter(detail => {
        if (!detail || !detail.allocated_to) return true; 
        return !Object.entries(newDetail).every(([key, value]) =>
          detail[key]?.toString() === value?.toString()
        );
    });
  
  
      const updatedstate = await this.model.update(
        { mapping_detail: updatedDetails },
        { where: { DID: did } }
      );

  
    } catch (error) {
      console.error("Error in deleteMappingDetail:", error);
      throw error;
    }
  }
  
  
  
  async countSubCompanyUserEntry(did) {
    try {
      const record = await this.model.findOne({
        where: { DID: did },
        attributes: ['mapping_detail'],
      });
  
      if (!record || !record.mapping_detail) return 0;
  
      const count = await this.model.count({
        where: Sequelize.jsonb('mapping_detail'),
        having: Sequelize.jsonb('mapping_detail.level', {
          [Sequelize.Op.gte]: 4,
        }),
      });
  
      return count;
  
    } catch (error) {
      console.error("Error in countSubCompanyUserEntry:", error);
      throw error;
    }
  }
  
  async getAll(options) {
    try {
      let whereCondition = {};

      if (options?.where) {
        whereCondition = { ...whereCondition, ...options.where };
      }

      let response = await this.model.findAll({
        where: whereCondition,
        order: [["created_at", "DESC"]],
        raw: true,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async findDidMappingDetails(data) {
    try {
        const didMapping = await DIDUserMapping.findOne({
            where: {
                DID: data.did
            },
            raw: true
        });

        if (!didMapping) return {};

        const mappingDetails = didMapping.mapping_detail || [];
        const mappingDetialsPlans = [];

        const voicePlanIds = mappingDetails
            .filter(md => md.voice_plan_id)
            .map(md => md.voice_plan_id);

        const uniqueVoicePlanIds = [...new Set(voicePlanIds)];

        const voicePlans = await voicePlansRepo.find({
            where: {
                id: {
                    [Op.in]: uniqueVoicePlanIds
                }
            },
            attributes: ['id', 'plans', 'user_id'],
            raw: true
        });

        const voicePlanMap = {};
        voicePlans.forEach(plan => {
            voicePlanMap[plan.id] = plan;
        });

        mappingDetails.forEach(mappingDetail => {
            const plan = mappingDetail.voice_plan_id ? voicePlanMap[mappingDetail.voice_plan_id] : null;
            mappingDetialsPlans.push({
                level: String(mappingDetail.level),
                allocated_to: mappingDetail.allocated_to,
                parent_id: mappingDetail.parent_id,
                voice_plan_id: plan,
                voice_plan_user_id: plan ? plan.user_id : null
            });
        });

        return {
            DID: didMapping.DID,
            mapping_detial: mappingDetialsPlans
        };
    } catch (error) {
        throw error;
    }
  }
}

module.exports = DIDUserMappingRepository;
