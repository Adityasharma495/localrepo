const CrudRepository = require("./crud-repository");
const { Queue, Extension, User } = require("../c_db");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");

class QueueRepository extends CrudRepository {
  constructor() {
    super(Queue);
  }

  async getAll(current_uid) {
    try {
      const response = await this.model.findAll({
        where: {
          is_deleted: false,
          created_by: current_uid,
        },
        include: [
          {
            model: Extension,
            as: "extension",
          },
          {
            model: User,
            as: "created_by_user",
          }
        ],
        order: [["created_at", "DESC"]],
      });

      return response.map(item => item.toJSON());
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    const [_, updated] = await this.model.update(data, {
      where: {
        id,
        is_deleted: false,
      },
      returning: true,
    });

    return updated?.[0] ?? null;
  }

  async get(id) {
    try {
      const response = await this.model.findOne({
        where: { id },
      });

      if (!response) {
        throw new AppError("Not able to find the resource", StatusCodes.NOT_FOUND);
      }

      return response.toJSON();
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const existing = await this.model.findOne({
        where: { id, is_deleted: false },
      });

      if (!existing) {
        const error = new Error("Queue not found");
        error.name = "NotFound";
        throw error;
      }

      await this.update(id, { is_deleted: true });
      return { message: "Queue deleted" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = QueueRepository;
