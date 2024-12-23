const CrudRepository = require('./crud-repository');
const languageModel = require('../db/languages');

class LanguageRepository extends CrudRepository{

    constructor(){
        super(languageModel);
    }

}

module.exports = LanguageRepository;