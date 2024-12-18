const CrudRepository = require('./crud-repository');
const codecModel = require('../db/codecs');

class CodecRepository extends CrudRepository{

    constructor(){
        super(codecModel);
    }

}

module.exports = CodecRepository;