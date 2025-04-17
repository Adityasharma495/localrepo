const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const { MODEL } = require("../utils/common/constants");
const User = require("./User");
const Agent = require("./Agents");
const MemberSchedule = require("./member-schedule");
const Prompt = require("./prompt");

const AgentsGroup = sequelize.define(MODEL.AGENTS_GROUP, {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  group_schedule_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: MemberSchedule,
      key: "id",
    },
  },
  group_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  manager: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  group_owner: {
    type: DataTypes.STRING,
    defaultValue: "Not Assigned",
  },
  strategy: {
    type: DataTypes.ENUM(
      "ROUNDROBIN RINGING",
      "SEQUENTIAL RINGING",
      "RANDOM RINGING",
      "LEAST OCCUPIED RINGING",
      "LEAST IDLE RINGING"
    ),
    defaultValue: "ROUNDROBIN RINGING",
  },
  answered: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  missed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  sticky: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  whisper_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Prompt,
      key: "id",
    },
  },
  music_on_hold: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Prompt,
      key: "id",
    },
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: "id",
    },
  },
  agents:{
    type:DataTypes.JSONB,
    allowNull:true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: MODEL.AGENTS_GROUP,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// const AgentGroupAgents = sequelize.define("agent_group_agents", {
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true,
//   },
//   agent_group_id: {
//     type: DataTypes.UUID,
//     allowNull: false,
//     references: {
//       model: AgentsGroup,
//       key: "id",
//     },
//   },
//   agent_data:{
//     type:DataTypes.JSONB,
//     allowNull:true,
//   },
//   // agent_id: {
//   //   type: DataTypes.UUID,
//   //   allowNull: true,
//   //   references: {
//   //     model: Agent,
//   //     key: "id",
//   //   },
//   // },
//   // member_schedule_id: {
//   //   type: DataTypes.UUID,
//   //   allowNull: true,
//   //   references: {
//   //     model: MemberSchedule,
//   //     key: "id",
//   //   },
//   // },
//   // priority: {
//   //   type: DataTypes.INTEGER,
//   //   defaultValue: 0,
//   // },
// }, {
//   tableName: "agent_group_agents",
//   timestamps: false,
// });

// Associations
// AgentsGroup.hasMany(AgentGroupAgents, { foreignKey: "agent_group_id", as: "agents" });
// AgentGroupAgents.belongsTo(AgentsGroup, { foreignKey: "agent_group_id" });

module.exports = { AgentsGroup };
