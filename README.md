# sequelize-repository
sequelize-repository is a simple implementation of the repository pattern for sequelize

# Table of contents
- [SQRepository](#SQRepository)
- [Query Methods](#Query-Methods)
- [Criteria](#Criteria)
- [TransactionRunner](#TransactionRunner)



### SQRepository
The SQRepository is the entry point to the library, it contains all repository methods, you must extend from this class to use it.

Example: 
```
class MyRepository extends SQRepository {
    constructor() {
        super(MyRepository, db.MyModel, 'my_id' })
    }
}

const repository = new MyRepository()

const entities = await this.repository.findById(1)
```
The SQRepository contains the following methods:
```
save(model,t)
findAll()
findAllWhere(query)
findAllByCriteriaAndPaginated({criteria, page, size, orderAttr})
findAndCountAll({condition, order, page, size, include})
findOne(query)
findById(id)
sum(field, criteria)
```

### Query-Methods
Query methods are and easy way to generate simple queries without almost any code. You just have to write the method signature and parameters and SQRepository will do the rest.


| Keyword     | Sample              | Sequelize Snippet                                                                  | Returns
| :---        | :---                |:---                                                                                |:----
| And         | findAllByNameAndRole|`model.findAll({ where: { name, role }, include: { all: true } })`                  | ```[{entity}]```
| Paginated   | findByNamePaginated |`model.findAndCountAll({ where: { name }, limit, offset, include: { all: true } })` | ```{ totalItems: 10, rows: [{entity}], totalPages: 15, currentPage: 0 }```

Example:
```
class MyRepository extends SQRepository {
    constructor() {
        super(MyRepository, db.MyModel, 'my_id' })
    }
    async findAllByNameAndEmail(name,email) {}
}

const repository = new MyRepository()
    
const entities = await this.repository.findAllByNameAndEmail("John", "Doe")
```

### Criteria
Criteria is a class that represents sequelize queries in a simpler way, the CriteriaBuilder is used to build complex criterias easily. There are methods of the repository that expect a Criteria Object
Examples:
```
const { Op } = require('sequelize')
const criteria = new Criteria([{ field: 'client_id', value: 1234, condition: { [Op.eq]: 1234 }])
criteria.getCriteria() // -> { client_id: { [Op.eq] : 1234 } }
await myRepository.findAllWhere(criteria) // -> [{ client_id: 1234 }]
```
```
const builder = new CriteriaBuilder()
const criteria = builder.add('client_id', clientId, { [Op.eq]: clientId })
   .add('created_date', fromDate, { [Op.eq]: clientId })
   .add('status', 'FAILURE', { [Op.ne]: 'FAILURE' })
   .add('request_id', null, { [Op.ne]: null })
   .build()
criteria.getCriteria() // { client_id:  { [Op.eq]: 1234 }, created_date: { [Op.eq]: 10/10/2021 } ...}
```
### TransactionRunner
The transaction runner is a solution to handle the sequelize transactions in just one place.
In order to use the "save" method of the repository you must execute it inside a transaction.
Example:
```
const db = require('../models')
const result = await TransactionRunner.run(db, async (t) => {
    const entity = await repository.save({ id: 1, name: 'John', lastName: 'Doe' }, t)
    return entity
})
```
