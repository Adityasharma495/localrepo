const CrudRepository = require('./crud-repository');
const { Language } = require('../c_db');

class LanguageRepository extends CrudRepository {
  constructor() {
    super(Language);
  }

  async getAll() {
    try {
      let response = await Language.findAll();
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LanguageRepository;