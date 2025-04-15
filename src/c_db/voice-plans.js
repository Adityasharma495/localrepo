const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const VoicePlan = sequelize.define(
  "VoicePlan",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    plan_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plans: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidPlans(value) {
          if (!Array.isArray(value)) {
            throw new Error("Plans must be an array");
          }

          for (const plan of value) {
            if (
              !["INBOUND", "OUTBOUND", "MISSED"].includes(plan.plan_type) ||
              typeof plan.pulse_price !== "number" ||
              typeof plan.pulse_duration !== "number" ||
              typeof plan.price !== "number"
            ) {
              throw new Error("Invalid plan structure");
            }
          }
        },
      },
    },
    plan_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    req_date: {
      type: DataTypes.DATE,
      defaultValue: () => {
        const now = new Date();
        return new Date(now.getTime());
      },
    },
    update_date: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    is_allocated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: "voice_plans",
    timestamps: false,
  }
);

module.exports = VoicePlan;
