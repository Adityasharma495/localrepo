const { StatusCodes } = require("http-status-codes");
const { SuccessRespnose, ErrorResponse } = require("../../shared/utils/common");
const { Logger } = require("../../shared/config");
const { Op } = require("sequelize");

const {
  OutboundReportJanuaryW1Repository,
  OutboundReportJanuaryW2Repository,
  OutboundReportJanuaryW3Repository,
  OutboundReportJanuaryW4Repository,

  OutboundReportFebruaryW1Repository,
  OutboundReportFebruaryW2Repository,
  OutboundReportFebruaryW3Repository,
  OutboundReportFebruaryW4Repository,

  OutboundReportMarchW1Repository,
  OutboundReportMarchW2Repository,
  OutboundReportMarchW3Repository,
  OutboundReportMarchW4Repository,

  OutboundReportAprilW1Repository,
  OutboundReportAprilW2Repository,
  OutboundReportAprilW3Repository,
  OutboundReportAprilW4Repository,

  OutboundReportMayW1Repository,
  OutboundReportMayW2Repository,
  OutboundReportMayW3Repository,
  OutboundReportMayW4Repository,

  OutboundReportJuneW1Repository,
  OutboundReportJuneW2Repository,
  OutboundReportJuneW3Repository,
  OutboundReportJuneW4Repository,

  OutboundReportJulyW1Repository,
  OutboundReportJulyW2Repository,
  OutboundReportJulyW3Repository,
  OutboundReportJulyW4Repository,

  OutboundReportAugustW1Repository,
  OutboundReportAugustW2Repository,
  OutboundReportAugustW3Repository,
  OutboundReportAugustW4Repository,

  OutboundReportSeptemberW1Repository,
  OutboundReportSeptemberW2Repository,
  OutboundReportSeptemberW3Repository,
  OutboundReportSeptemberW4Repository,

  OutboundReportOctoberW1Repository,
  OutboundReportOctoberW2Repository,
  OutboundReportOctoberW3Repository,
  OutboundReportOctoberW4Repository,

  OutboundReportNovemberW1Repository,
  OutboundReportNovemberW2Repository,
  OutboundReportNovemberW3Repository,
  OutboundReportNovemberW4Repository,

  OutboundReportDecemberW1Repository,
  OutboundReportDecemberW2Repository,
  OutboundReportDecemberW3Repository,
  OutboundReportDecemberW4Repository,

  UserRepository,
  AgentRepository,
} = require("../../shared/c_repositories");

const userRepository = new UserRepository();
const agentRepo = new AgentRepository();

const allOutboundRepositories = {
  janW1: new OutboundReportJanuaryW1Repository(),
  janW2: new OutboundReportJanuaryW2Repository(),
  janW3: new OutboundReportJanuaryW3Repository(),
  janW4: new OutboundReportJanuaryW4Repository(),
  febW1: new OutboundReportFebruaryW1Repository(),
  febW2: new OutboundReportFebruaryW2Repository(),
  febW3: new OutboundReportFebruaryW3Repository(),
  febW4: new OutboundReportFebruaryW4Repository(),
  marW1: new OutboundReportMarchW1Repository(),
  marW2: new OutboundReportMarchW2Repository(),
  marW3: new OutboundReportMarchW3Repository(),
  marW4: new OutboundReportMarchW4Repository(),
  aprW1: new OutboundReportAprilW1Repository(),
  aprW2: new OutboundReportAprilW2Repository(),
  aprW3: new OutboundReportAprilW3Repository(),
  aprW4: new OutboundReportAprilW4Repository(),
  mayW1: new OutboundReportMayW1Repository(),
  mayW2: new OutboundReportMayW2Repository(),
  mayW3: new OutboundReportMayW3Repository(),
  mayW4: new OutboundReportMayW4Repository(),
  junW1: new OutboundReportJuneW1Repository(),
  junW2: new OutboundReportJuneW2Repository(),
  junW3: new OutboundReportJuneW3Repository(),
  junW4: new OutboundReportJuneW4Repository(),
  julW1: new OutboundReportJulyW1Repository(),
  julW2: new OutboundReportJulyW2Repository(),
  julW3: new OutboundReportJulyW3Repository(),
  julW4: new OutboundReportJulyW4Repository(),
  augW1: new OutboundReportAugustW1Repository(),
  augW2: new OutboundReportAugustW2Repository(),
  augW3: new OutboundReportAugustW3Repository(),
  augW4: new OutboundReportAugustW4Repository(),
  sepW1: new OutboundReportSeptemberW1Repository(),
  sepW2: new OutboundReportSeptemberW2Repository(),
  sepW3: new OutboundReportSeptemberW3Repository(),
  sepW4: new OutboundReportSeptemberW4Repository(),
  octW1: new OutboundReportOctoberW1Repository(),
  octW2: new OutboundReportOctoberW2Repository(),
  octW3: new OutboundReportOctoberW3Repository(),
  octW4: new OutboundReportOctoberW4Repository(),
  novW1: new OutboundReportNovemberW1Repository(),
  novW2: new OutboundReportNovemberW2Repository(),
  novW3: new OutboundReportNovemberW3Repository(),
  novW4: new OutboundReportNovemberW4Repository(),
  decW1: new OutboundReportDecemberW1Repository(),
  decW2: new OutboundReportDecemberW2Repository(),
  decW3: new OutboundReportDecemberW3Repository(),
  decW4: new OutboundReportDecemberW4Repository(),
};

const { constants } = require("../../shared/utils/common");
const { USERS_ROLE } = require("../backup/utils/common/constants");

// async function getAll(req, res) {
//   try {
//     const userRole = req.user.role;
//     const userId = req.user.id;


//     let agentId;

//     if(userRole===USERS_ROLE.CALLCENTRE_AGENT)
//     {
//     const user = await userRepository.findOne({id:userId})
//     const agent = await agentRepo.findOne({agent_name:user.username})
//     agentId = agent.id;
//     }


//     let userIds = [];

//     if (userRole !== constants.USERS_ROLE.SUPER_ADMIN) {
//       userIds = await userRepository.getAllDescendantUserIds(userId);
//     }
//     const where =
//      userRole === constants.USERS_ROLE.SUPER_ADMIN
//     ? {}
//     : userRole === constants.USERS_ROLE.CALLCENTRE_AGENT
//     ? { agent_id: agentId }
//     : {
//         [Op.or]: [
//           { user_id: userId },
//           ...(userIds.length > 0
//             ? [{ user_id: { [Op.in]: userIds } }]
//             : []),
//         ],
//       };

//       const allData = await Promise.all(
//         Object.values(allOutboundRepositories).map((repo) =>
//         repo.getAllData({ where })
//       )
//     );

//     const combinedData = allData.flat();
//     SuccessRespnose.data = combinedData;
//     SuccessRespnose.message = "Success";



//     Logger.info(`Outgoing Calls -> retrieved all successfully`);
//     return res.status(StatusCodes.OK).json(SuccessRespnose);
//   } catch (error) {
//     ErrorResponse.message = error.message;
//     ErrorResponse.error = error;

//     Logger.error(
//       `Outgoing Calls -> unable to get Outgoing Calls list, error: ${JSON.stringify(
//         error
//       )}`
//     );

//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
//   }
// }


async function getAll(req, res) {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    let agentId;

    if (userRole === USERS_ROLE.CALLCENTRE_AGENT) {
      const user = await userRepository.findOne({ id: userId });
      const agent = await agentRepo.findOne({ agent_name: user.username });
      agentId = agent.id;
    }

    let userIds = [];
    if (userRole !== constants.USERS_ROLE.SUPER_ADMIN) {
      userIds = await userRepository.getAllDescendantUserIds(userId);
    }

    // Base where condition based on role
    let where =
      userRole === constants.USERS_ROLE.SUPER_ADMIN
        ? {}
        : userRole === constants.USERS_ROLE.CALLCENTRE_AGENT
        ? { agent_id: agentId }
        : {
            [Op.or]: [
              { user_id: userId },
              ...(userIds.length > 0
                ? [{ user_id: { [Op.in]: userIds } }]
                : []),
            ],
          };

    // Add date range filter if provided


    const { startDate, endDate } = req.query;
    
    const startUtc = new Date(`${startDate}T00:00:00+05:30`);
    const endUtc = new Date(`${endDate}T23:59:59+05:30`);
    if (startDate && endDate) {
      where = {
        start_time: {
          [Op.gte]: startUtc,
          [Op.lte]: endUtc
        }
      };
    }

    // Fetch from all outbound repositories
    const allData = await Promise.all(
      Object.values(allOutboundRepositories).map((repo) =>
        repo.getAllData({ where })
      )
    );



    const combinedData = allData.flat();

    SuccessRespnose.data = combinedData;
    SuccessRespnose.message = "Success";
    Logger.info(`Outgoing Calls -> retrieved all successfully`);
    return res.status(StatusCodes.OK).json(SuccessRespnose);

  } catch (error) {
    ErrorResponse.message = error.message;
    ErrorResponse.error = error;
    Logger.error(
      `Outgoing Calls -> unable to get list, error: ${JSON.stringify(error)}`
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
  }
}







module.exports = {
  getAll,
};
