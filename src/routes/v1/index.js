const express = require("express");
const router = express.Router();

const userRoutes = require('./user-routes');
const companyRoutes = require('./company-routes');
const callCentreRoutes = require('./call-centre-routes');
const codecRoutes = require('./codec-routes');
const trunksRoutes = require('./trunk-routes');
const countryCodeRoutes = require('./country-code-routes');
const numbersRoutes = require("./numbers-routes");
const ivrRoutes = require("./ivr-routes");
const operatorRoutes = require("./operator-routes");
const callsRoutes = require("./calls-routes");
const timezoneRoutes = require('./timezone-routes');
const stateRoute = require("./state-route");
const cityRoute = require("./city-routes");
const dataCenterRoute = require("./data-center-routes");
const serverManagement = require("./server-management-routes");
const moduleRoute = require("./module-routes");
const aclSettings = require("./acl-settings-routes");
const userJourney = require("./user-journey-route");
const numberFileList =  require("./numbers-filelist-routes");
const exportLists = require("./export-List-routes");
const agentRoute = require("./agent-routes")
const agentGroupRoute = require("./agent-group-routes")
const extentionRoute = require("./extention-routes")
const queueRoute = require('./queue-route')
const callStratergy =require('./call-stratergy')
const VoiceCategory = require('./voice-category')
const saveFile = require('./save-file.js')
const memberSchedule = require('./member-schedule-routes')
const promptRoute = require('./prompts-routes.js')
const languageRoute = require('./language-routes.js')



router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/call-centres', callCentreRoutes);
router.use('/country-codes', countryCodeRoutes);
router.use('/numbers', numbersRoutes);
router.use('/codecs', codecRoutes);
router.use('/trunks', trunksRoutes);
router.use('/ivr', ivrRoutes);
router.use('/operators', operatorRoutes);
router.use('/calls', callsRoutes);
router.use('/timezones', timezoneRoutes);
router.use('/states', stateRoute);
router.use('/city', cityRoute);
router.use('/data-center', dataCenterRoute);
router.use('/server-management', serverManagement);
router.use('/module', moduleRoute);
router.use('/acl-settings', aclSettings);
router.use("/user-journey", userJourney);
router.use("/number-filelist", numberFileList);
router.use("/export", exportLists);
router.use("/agents", agentRoute)
router.use("/agent-group", agentGroupRoute)
router.use("/extention", extentionRoute)
router.use("/queue", queueRoute)
router.use("/call-stratergy",callStratergy)
router.use("/voice-category",VoiceCategory)
router.use('/saveFile', saveFile)
router.use('/member-schedule',memberSchedule)
router.use('/prompt',promptRoute)
router.use('/language', languageRoute)

module.exports = router;
