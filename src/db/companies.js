const mongoose = require('mongoose');
const { constants } = require('../utils/common');
const userModel = require('./users');
const COMPANY_TYPES = constants.COMPANY_TYPES;
const USER_MODEL_NAME = constants.MODEL.USERS;
const COMPANY_MODEL_NAME = constants.MODEL.COMPANIES;

  const CompanySchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
        index: { unique: true },
        trim: true, lowercase: true
      },
      phone: {
        type: String,
        required: true,
        trim: true
      },
      pincode: {
        type: String,
        required: true,
        trim: true
      },
      address: {
        type: String,
        required: true,
        trim: true
      },
      category: {
        type: String,
        enum: COMPANY_TYPES
      },
      created_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: USER_MODEL_NAME, 
        default: null 
      },
      created_at: {
        type: Date,
        default: Date.now
      },
      updated_at: {
          type: Date,
          default: Date.now
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_MODEL_NAME
      }]
  },{
    versionKey: false,
    // timestamps: true
  });

  CompanySchema.post('findOneAndUpdate', async function(doc){

    updateUserCompanyName(doc.users, doc.name, doc._id);

  });

  /**
   * When a company is updated, update the correspoding users doc as well
   * Because user docs contains company name as well (embedded)
   * {
   *  ...
   *  companies: { name: name, _id: id }
   * }
   * 
   * @param {*} users : An array containing user ids [ 'userid1', 'userid2', ... ]
   * @param {*} comp_name 
   */
  function updateUserCompanyName(users, comp_name, comp_id){

    //TODO: Optimize this
    users.map( user_id => {

      userModel.findById(user_id).then(doc => {
        
        if(doc.companies && doc.companies._id.equals(comp_id)){
          doc.companies.name = comp_name;
          doc.save();
        }

      });

    } );

  }

  //Only when a new company is created
  CompanySchema.methods.addCompanyToUser = async function(){

    try {
     
      const adminUserId = this.users[0];
      const companyName = this.name;
      const companyId = this._id;
      const user = await userModel.findById(adminUserId);
      if(user) user.addCompany(companyId, companyName);

    } catch (error) {
      
      throw error;

    }


  }

  //Executed once instantiated
  CompanySchema.queue('addCompanyToUser', []); 

    // Pre-save middleware to convert timestamps to IST
    CompanySchema.pre('save', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    // Set created_at and updated_at fields to IST
    if (this.isNew) {
        this.created_at = istDate;
    }
    this.updated_at = istDate;

    next();
  });

  // Pre-update middleware to convert updated_at to IST
  CompanySchema.pre('findOneAndUpdate', function (next) {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
    const istDate = new Date(now.getTime() + istOffset);

    this._update.updated_at = istDate;

    next();
  });

  const companySchema = mongoose.model(COMPANY_MODEL_NAME, CompanySchema);

  module.exports = companySchema;