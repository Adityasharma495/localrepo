const CrudRepository = require('./crud-repository');
const callCentreModel = require('../db/call-centres');

class CallCentreRepository extends CrudRepository{

    constructor(){
        super(callCentreModel);
    }

    async getAll(){

        try {
            const response = await this.model.find().sort({createdAt: -1});
            return response;            
        } catch (error) {
            throw error;
        }

    }

}

module.exports = CallCentreRepository;