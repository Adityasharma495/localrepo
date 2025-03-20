const userModel = require('./users');
const trunksModel = require('./trunks')
const operatorModel = require('./operator');
const timezoneModel = require('./timezones')
const {FlowModel, FlowControlModel} = require('./flows')
const IvrSettings= require('./ivr-settings')
const {CallStrategy,VoiceCategory} = require('./call-stratergy')
const MemberSchedule = require('./member-schedule')
const PromptModel = require('./prompt')
const FlowsJsonModel = require('./flows-json')
const CreditModel = require('./credits')

module.exports = {
    userModel,
    trunksModel,
    operatorModel,
    timezoneModel,
    FlowModel,
    FlowControlModel,
    IvrSettings,
    CallStrategy,
    VoiceCategory,
    MemberSchedule,
    PromptModel,
    FlowsJsonModel,
    CreditModel
}