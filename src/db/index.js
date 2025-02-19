const userModel = require('./users');
const trunksModel = require('./trunks')
const ivrModel = require('./ivr');
const operatorModel = require('./operator');
const ivrDataModel = require('./ivr-data');
const timezoneModel = require('./timezones')
const {FlowModel, FlowControlModel} = require('./flows')
const IvrSettings= require('./ivr-settings')
const {CallStrategy,VoiceCategory} = require('./call-stratergy')
const MemberSchedule = require('./member-schedule')
const PromptModel = require('./prompt')
const FlowsJsonModel = require('./flows-json')

module.exports = {
    userModel,
    trunksModel,
    ivrModel,
    operatorModel,
    ivrDataModel,
    timezoneModel,
    FlowModel,
    FlowControlModel,
    IvrSettings,
    CallStrategy,
    VoiceCategory,
    MemberSchedule,
    PromptModel,
    FlowsJsonModel
}