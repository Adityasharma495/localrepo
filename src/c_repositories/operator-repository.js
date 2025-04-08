const CrudRepository = require("./crud-repository");
const {Operator} = require("../c_db");

class OperatorsRepository extends CrudRepository {
    constructor() {
        super(Operator);
    }

    async getAll() {
        try {
            let response = await Operator.findAll({
                where: { is_deleted: false },
                order: [['created_at', 'DESC']],
                raw: true
            });
            return response;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const check = await Operator.findOne({ where: { id, is_deleted: false } });
            if (!check) {
                const error = new Error('Operator not found');
                throw error;
            }
            
            const response = await Operator.update(
                { is_deleted: true },
                { where: { id } }
            );
            return response;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OperatorsRepository;
