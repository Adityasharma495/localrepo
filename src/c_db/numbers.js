const { DataTypes, STRING } = require("sequelize");
const sequelize = require("../config/sequelize");
const { constants } = require("../utils/common");

const USER_MODEL_NAME = constants.MODEL.USERS;
const NUMBER_FILES_LIST = constants.MODEL.NUMBER_FILES_LIST;
const NUMBER_MODEL_NAME = constants.MODEL.NUMBERS;
const VOICE_PLAN_MODEL_NAME = constants.MODEL.VOICE_PLAN;

const Numbers = sequelize.define(
  NUMBER_MODEL_NAME,
  {
    id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    actual_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    routing_id: {
      type: STRING,
      allowNull: true,
      defaultValue: null,
    },
    routing_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    routing_destination: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cost: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    number_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uploaded_file_id: {
      type: DataTypes.BIGINT,
      references: {
        model: NUMBER_FILES_LIST,
        key: "id",
      },
      allowNull: true,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    allocated_to: {
      type: DataTypes.UUID,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
      allowNull: true,
    },
    allocated_company_id: {
      type: DataTypes.UUID,
      references: {
        model: 'companies', // or constants.MODEL.COMPANIES if using constants
        key: 'id',
      },
      allowNull: true,
    },
    voice_plan_id: {
      type: DataTypes.BIGINT,
      references: {
        model: VOICE_PLAN_MODEL_NAME,
        key: "id",
      },
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull:true,
      references: {
        model: USER_MODEL_NAME,
        key: "id",
      },
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (record) => {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        record.created_at = new Date(now.getTime() + istOffset);
        record.updated_at = new Date(now.getTime() + istOffset);
      },
      beforeUpdate: (record) => {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        record.updated_at = new Date(now.getTime() + istOffset);
      },
    },
  }
);

module.exports = Numbers;
