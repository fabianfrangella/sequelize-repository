# sequelize-repository
sequelize-repository is a simple implementation of the repository pattern for sequelize

# Table of contents
- [SQRepository](#SQRepository)
- [Named Queries](#Named Queries)
- [Criteria](#Criteria)

#SQRepository
The SQRepository is the entry point to the library, it contains all repository methods, you must extend from this class to use it.

###Example: 
```
class MyRepository extends SQRepository {
    constructor() {
        super(MyRepository, db.MyModel, 'my_id' })
    }
}

const repository = new MyRepository()

const entities = await this.repository.findById(1)
```

### SQRepository
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

### Named Queries
Named queries are and easy way to generate simple queries without almost any code. You just have to write the method signature and parameters and SQRepository will do the rest.

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