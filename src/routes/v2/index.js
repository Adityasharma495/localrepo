const express = require("express");
const router = express.Router();


const userRoutes = require('./user-routes');
const creditRoutes = require('./credit-routes');
const userJourney = require('./user-journey-route');
const serverManagement = require('./server-management-routes');
const dataCenter = require('./data-center-routes');
const trunkRoutes = require('./trunk-routes');
const agentRoutes = require("./agent-routes")
const CodecRoutes = require("./codec-routes")
const prompt = require('./prompts-routes');
const numbers = require('./numbers-routes');
const ivrRoutes = require("./ivr-routes");
const cityRoute = require("./city-routes");
const stateRoute = require("./state-route");
const timezoneRoutes = require('./timezone-routes');
const languageRoute = require('./language-routes.js');
const codecRoutes = require('./codec-routes');
const moduleRoute = require("./module-routes");
const operatorRoutes = require("./operator-routes");
const exportLists = require("./export-List-routes");
const downloadReportRoute = require('./download-report-routes.js');
const incomingSummaryRoute = require('./incoming-summary-routes.js');
const callCentreRoutes = require('./call-centre-routes');
const acl_settings = require("./acl-settings-routes.js");
const countryCodeRoutes = require('./country-code-routes');
const numberFileListRoutes = require("./number-file-routes.js");
const voicePlanRoutes = require('./voice-plan-routes.js');
const VoiceCategory = require('./voice-category');
const extensionRoute = require("./extension-routes");
const agentGroupRoutes = require('./agent-group-routes.js')
const callStratergy =require('./call-stratergy')
const callsRoutes = require("./calls-routes");
const queueRoute = require('./queue-route');


router.use('/users', userRoutes);
router.use('/credits', creditRoutes);
router.use('/user-journey', userJourney);
router.use('/server-management', serverManagement);
router.use('/data-center', dataCenter);
router.use('/trunks', trunkRoutes);
router.use('/agents', agentRoutes);
router.use('/agent-group', agentGroupRoutes);
router.use('/operators', operatorRoutes);
router.use('/codecs', CodecRoutes);
router.use('/prompt', prompt);
router.use('/numbers', numbers);
router.use('/number-filelist',numberFileListRoutes)
router.use('/ivr', ivrRoutes);
router.use('/city', cityRoute);
router.use('/states', stateRoute);
router.use('/timezones', timezoneRoutes);
router.use('/language', languageRoute);
router.use('/codecs', codecRoutes);
router.use('/module', moduleRoute);
router.use('/operators', operatorRoutes);
router.use("/export", exportLists);
router.use('/download-report', downloadReportRoute);
router.use('/incoming-summary', incomingSummaryRoute);
router.use('/call-centres', callCentreRoutes);
router.use('/acl-settings', acl_settings);
router.use('/country-codes', countryCodeRoutes);
router.use('/voice-plan', voicePlanRoutes);
router.use("/voice-category",VoiceCategory);
router.use("/extension", extensionRoute);
router.use("/call-stratergy",callStratergy)
router.use('/calls', callsRoutes);
router.use("/queue", queueRoute);

module.exports = router;
