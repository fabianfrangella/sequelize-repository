const SQRepository = require("../src/repository/SQRepository");
const { assert } = require('chai')
describe('SQRepository', () => {
    beforeAll(() => {
        Function.prototype.getBody = function() {
            let m = this.toString().match(/\{([\s\S]*)\}/m)[1];
            return m.replace(/^\s*\/\/.*$/mg,'');
        };
    })
    it('Instantiate a SQRepository should fail', () => {
        assert.throws(() => new SQRepository(), 'Can not instantiate an abstract class')
    })
    it('Instantiate a class that extends from SQRepository should work', () => {
        class Test extends SQRepository {
            constructor() {
                super(Test, {});
            }
        }
        assert.doesNotThrow(() => new Test())
    })
    it('SQRepository should create the named queries based on the methods signatures', () => {
        class Test extends SQRepository {
            constructor() {
                super(Test, { findAll: () => true });
            }
            findAllByName(name) {}
            findByNameAndLastName(name, lastName) {}
            thisMethodShouldNotGenerateANamedQuery(args) {}
        }
        const repository = new Test()
        assert.isTrue(!!repository.findAllByName.getBody())
        assert.isTrue(!!repository.findByNameAndLastName.getBody())
        assert.isFalse(!!repository.thisMethodShouldNotGenerateANamedQuery.getBody())
    })
    it('SQRepository should set the primary key as id if no primary key is passed through the constructor', () => {
        class Test extends SQRepository {
            constructor() {
                super(Test, {});
            }
        }
        const repository = new Test()
        assert.equal(repository.primaryKey, 'id')
    })
    it('SQRepository should set the primary key as the one passed through the constructor', () => {
        class Test extends SQRepository {
            constructor() {
                super(Test, {}, 'unique_key');
            }
        }
        const repository = new Test()
        assert.equal(repository.primaryKey, 'unique_key')
    })
})