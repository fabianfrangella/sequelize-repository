const pagination = {
  getPagination: (page, size) => {
    const limit = size ? +size : 10
    const offset = page ? page * limit : 0

    return { limit, offset }
  },
  getPagingData: (data, page, limit) => {
    const { count: totalItems, rows } = data
    const currentPage = page ? +page : 0
    const totalPages = Math.ceil(totalItems / limit)

    return {
      totalItems, rows, totalPages, currentPage,
    }
  },
}

const initNamedQueries = (that) => {
  Object.getOwnPropertyNames(that.clazz.prototype).forEach(n => {
    if (n.startsWith("findBy") || n.startsWith("findAllBy")) {
      that[n] = function(...args) {
        const splitted = n.split("By")
        const joined = splitted.join("")
        const properties = joined.split(splitted[0]).join("").split('And')
        const queryConnectors = []
        connectors.forEach(con => {
          if (n.includes(con)) {
            queryConnectors.push(con)
          }
        })
        const query = { where: {}, include: {all: true}}
        for (let i = 0; i < args.length; i++) {
          if (Array.isArray(args[i])) {
            query.where[properties[i]] = { in: args[i]}
            continue
          }
          query.where[properties[i]] = args[i]
        }
        return model.findAll(query)
      }
    }
  })
}
/**
 * @summary Abstract repository for Sequelize entities with all basic persistence methods
 * In order to use this class you must extend from it and instantiate it with the corresponding model and the name of the primary key
 * @example
 * class MyRepository extends SQRepository {
 *   constructor() {
 *     super(MyRepository, db.MyModel, 'my_id' })
 *   }
 * }
 */
class SQRepository {
  constructor(clazz, model, primaryKey = 'id') {
    if (this.constructor === BaseRepository) throw new Error('Can not instantiate an abstract class')
    this.primaryKey = primaryKey
    this.clazz = clazz
    this.model = model
    initNamedQueries(this)
  }

  /**
   * Saves a {model} instance into the database, if it already exists performs an update
   * if the upsert fails returns null
   * @param model
   * @param t
   * @returns {Promise<null|Model>}
   */
   async save(model, t) {
    let val = model
    if (model.dataValues) {
      val = { ...model.dataValues }
    }
    if (!val[this.primaryKey]) val[this.primaryKey] = uuidv4().replace(/-/g, '')
    const res = await this.model.upsert({ ...val, updated_date: new Date() }, { transaction: t })
    return res[1] ? res[0] : null
  }

  /**
   * Returns a list of {model} instances including all its associations
   * @returns {Promise<*|Model[]>}
   */
  async findAll() {
    return this.model.findAll({ include: { all: true } })
  }

  /**
   * Given a query object Returns a list of {model} instances including all its associations
   * @param query: {fields}
   * @returns {Promise<*|Model[]>}
   */
  async findAllWhere(query) {
    return this.model.findAll({ where: query, include: { all: true } })
  }

  /**
   * Given a criteria returns all items that match the criteria, the total pages, the total items and the current page
   * If no order attribute is given it will use the database default
   * @param criteria
   * @param page
   * @param size
   * @param orderAttr
   * @returns {Promise<{totalItems: *, totalPages: number, rows: *, currentPage: number}>}
   */
  async findAllByCriteriaAndPaginated({
    criteria, page, size, orderAttr,
  }) {
    const { limit, offset } = pagination.getPagination(page, size)
    const condition = criteria.getCriteria()
    let order
    let response
    if (orderAttr) {
      order = [[orderAttr, 'DESC']]
      response = await this.model.findAndCountAll({
        where: condition, limit, offset, order, include: { all: true },
      })
      return pagination.getPagingData(response, page, limit)
    }
    response = await this.model.findAndCountAll({
      where: condition, limit, offset, include: { all: true },
    })
    return pagination.getPagingData(response, page, limit)
  }

  async findAndCountAll({
    condition, order, page, size, include,
  }) {
    const { limit, offset } = pagination.getPagination(page, size)
    const response = await this.model.findAndCountAll({
      where: condition, limit, offset, order, include,
    })
    return pagination.getPagingData(response, page, limit)
  }

  /**
   * Given a query object returns the first occurrence of {model}
   * @param query
   * @returns {Promise<*|Model|null>}
   */
  async findOne(query) {
    return this.model.findOne({ where: query, include: { all: true } })
  }

  /**
   * Given an id returns corresponding {model}, null otherwise
   * @param id
   * @returns {Promise<*|Model|null>}
   */
  async findById(id) {
    const where = {}
    where[this.primaryKey] = id
    return this.model.findOne({ where, include: { all: true } })
  }

  /**
   * Given a field and an optional criteria, returns the sum of all occurrences of field
   * @param field
   * @param criteria
   * @returns {Promise<number>}
   */
  async sum(field, criteria) {
    if (criteria) {
      return this.model.sum(field, criteria.getCriteria())
    }
    return this.model.sum(field)
  }
}

module.exports = SQRepository