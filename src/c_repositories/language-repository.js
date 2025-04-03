const CrudRepository = require('./crud-repository');
const { Language } = require('../c_db');

class LanguageRepository extends CrudRepository{

    constructor(){
        super(Language);
    }

}

module.exports = LanguageRepository;