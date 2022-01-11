/**
 * @classdesc Criteria class used to build complex sequelize queries
 * Must be instantiated with as many objects with the following structure: { field: string, value: any, condition: { [Op.*]: * } Op stands for sequelize operator symbol
 * @example
 * const { Op } = require('sequelize')
 * const criteria = new Criteria([{ field: 'client_id', value: 1234, condition: { [Op.eq]: 1234 }])
 * criteria.getCriteria() // -> { client_id: { [Op.eq] : 1234 } }
 * await myRepository.findAllWhere(criteria) // -> [{ client_id: 1234 }]
 */
class Criteria {
    constructor(...conditions) {
      const condition = {}
      Object.values(conditions).forEach((val) => {
        if (!this.isEmpty(val.value)) {
          condition[val.field] = val.condition
        }
      })
      this.condition = condition
    }
  
    getCriteria() {
      return this.condition
    }
  
    /**
     * @private
     * @param value
     * @returns {boolean}
     */
    isEmpty(value) {
      if (Array.isArray(value)) {
        return value.length < 1
      }
      return value === undefined || value === ''
    }
  }
  
  /**
   * @classdesc Builder class for Criteria Objects
   * @example
   * const builder = new CriteriaBuilder()
   * const criteria = builder.add('client_id', clientId, { [Op.eq]: clientId })
   * .add('created_date', fromDate, { [Op.eq]: clientId })
   * .add('status', 'FAILURE', { [Op.ne]: 'FAILURE' })
   * .add('request_id', null, { [Op.ne]: null })
   * .build()
   * criteria.getCriteria() // { client_id:  { [Op.eq]: 1234 }, created_date: { [Op.eq]: 10/10/2021 } ...}
   */
  class CriteriaBuilder {
    constructor() {
      this.conditions = []
    }
  
    /**
     * @param field: string
     * @param value: any
     * @param condition: { [Op.*]: any }
     * @returns {CriteriaBuilder}
     */
    add(field, value, condition) {
      this.conditions.push({ field, value, condition })
      return this
    }
  
    /**
     * @returns {Criteria}
     */
    build() {
      return new Criteria(...this.conditions)
    }
  
    clean() {
      this.conditions = []
    }
  }
  
  module.exports = { Criteria, CriteriaBuilder }