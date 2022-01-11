async function run(db, cb) {
    return db.sequelize.transaction(async (t) => cb(t));
}
module.exports = { run }
