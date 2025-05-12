const CrudRepository = require("./crud-repository");
const { IVRData } = require("../c_db");  

class IVRDataRepository extends CrudRepository {
  constructor() {
    super(IVRData);
  }

  async create(data) {
    try {
      
      return super.create({ data });
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
       
      return super.update(id, { data });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = IVRDataRepository;