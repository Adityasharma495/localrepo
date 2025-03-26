const CrudRepository = require('./crud-repository');
const codecModel = require('../c_db/codecs');

class CodecRepository extends CrudRepository{

    constructor(){
        super(codecModel);
    }


      async getAll() {
        try {
          const response = await codecModel.findAll({
            raw: true
          });
          return response;
        } catch (error) {
          throw error;
        }
      }
}

module.exports = CodecRepository;