const { Op } = require("sequelize");
const CrudRepository = require("./crud-repository");
const { Numbers, VoicePlan , Company} = require("../c_db");
const { constants } = require("../utils/common");
const numberStatusValues = constants.NUMBER_STATUS_VALUE;

class NumbersRepository extends CrudRepository {
  constructor() {
    super(Numbers);
  }

  async getAll(options) {
    try {
      let whereCondition = { is_deleted: false };
  
      if (options?.where) {
        whereCondition = { ...whereCondition, ...options.where };
      }
  
      
      let response = await this.model.findAll({
        where: whereCondition,
        include: [
          {
            model: VoicePlan,  
            as: 'voice_plan',     
            attributes: ['id', 'plan_name', 'plans'], 
          },
        ],
        order: [['created_at', 'DESC']],
        raw: true,  
      });
  
      response = response.map((item) => {
        const voicePlan = {};
        Object.keys(item).forEach((key) => {
          if (key.startsWith('voice_plan.')) {
            const nestedKey = key.replace('voice_plan.', '');
            voicePlan[nestedKey] = item[key];
            delete item[key];
          }
        });
        item.voice_plan = voicePlan;
        return item;
      });
  
      return response;
    } catch (error) {
      throw error;
    }
  }
  

  async deleteMany(idArray) {
    try {
      const check = await this.model.findAll({
        where: {
          id: { [Op.in]: idArray },
          is_deleted: false,
        },
      });
      if (check.length !== idArray.length) {
        const checkData = check.map((obj) =>
          typeof obj.dataValues.id === "string"
            ? obj.dataValues.id
            : obj.dataValues.id.toString()
        );
        const notFoundElement = idArray.filter((x) => !checkData.includes(x));
        const error = new Error();
        error.name = `Data with id ${notFoundElement} not found.`;
        throw error;
      }
      const response = await this.model.update(
        { is_deleted: true },
        { where: { id: { [Op.in]: idArray } } }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteNumber(id) {
    try {
      const response = await this.model.update(
        { is_deleted: true },
        { where: { id } }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async isActualNumberExist(actNumber, isDeleted) {
    try {
      const response = await this.model.findOne({
        where: { actual_number: actNumber, is_deleted: isDeleted },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async insertMany(records) {
    try {
      const response = await this.model.bulkCreate(records);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getParticularTypeNumber(numberType) {
    try {
      const response = await this.model.findAll({
        where: { is_deleted: false, number_type: numberType },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findOne(conditions) {
    try {
      const response = await this.model.findOne({
        where: { is_deleted: false, ...conditions },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteNumberByFileId(idArray) {
    try {
      const check = await this.model.findAll({
        where: { uploaded_file_id: { [Op.in]: idArray }, is_deleted: false },
        attributes: ["id"],
      });

      if (check.length === 0) {
        throw new Error(`Data Not found in numbers table with this file`);
      }

      const response = await this.model.update(
        { is_deleted: true },
        { where: { uploaded_file_id: { [Op.in]: idArray } } }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async bulkWrite(operations) {
    try {
      const result = await this.model.bulkCreate(operations, {
        updateOnDuplicate: Object.keys(operations[0]),
      });
      return result;
    } catch (error) {
      throw new Error("Error executing bulk write: " + error.message);
    }
  }

  async bulkCreate(records) {
    try {
        if (records.length === 0) {
            throw new Error("No records to insert");
        }

        const insertedRecords = await this.model.bulkCreate(records, {
            ignoreDuplicates: true,
        });

        return insertedRecords;
    } catch (error) {
        console.error("Error in bulkCreate:", error);
        throw error;
    }
  }

  async getAllocatedNumbers(id) {
    try {
      const response = await this.model.findAll({
        where: { is_deleted: false, allocated_to: id },
        order: [["created_at", "DESC"]],
        include: [
          {
            model: VoicePlan,
            as: 'voice_plan'
          }
        ]
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAllData(role, id) {
    let response;
    if (role === constants.USERS_ROLE.SUPER_ADMIN) {
      response = await this.model.findAll();
    } else {
      response = await this.model.findAll({
        where: { created_by: id }
      });
    }

    response = response.map(item => {
      const createdAt = new Date(item.dataValues.createdAt);
      const updatedAt = new Date(item.dataValues.updatedAt);

      const formattedCreatedAt = createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const formattedUpdatedAt = updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      item.dataValues.createdAt = formattedCreatedAt;
      item.dataValues.updatedAt = formattedUpdatedAt;

      return item;
    });
    return response;
  }

  async findMany(ids) {
    const cleanedIds = ids.map(id => Number(id));

    try {
      const response = await this.model.findAll({
        where: {
          id: { [Op.in]: cleanedIds },
          is_deleted: false,
        },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: VoicePlan,
            as: 'voice_plan', 
            attributes: ['id', 'plan_name', 'plans'],
          },
        ],
        raw: false, 
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findOneWithVoicePlan(conditions) {
    try {
        const response = await this.model.findOne({
            where: {
                is_deleted: false,
                ...conditions
            },
            include: [
                {
                    model: VoicePlan,
                    as: 'voice_plan'
                }
            ],
            raw: true, 
            nest: true
        });

        return response;
    } catch (error) {
        throw error;
    }
}

}

module.exports = NumbersRepository;
