const CrudRepository = require("./crud-repository");
const { ivrDataModel } = require("../db");

class IVRDataRepository extends CrudRepository {

  constructor() {
    super(ivrDataModel);
  }

  async create(data){

    try {
      return super.create({data: data});      
    } catch (error) {
      throw error;
    }

  }

  async update(id, data){

    try {
      return super.update(id, {data: data});      
    } catch (error) {
      throw error;
    }    

  }

}

module.exports = IVRDataRepository;
