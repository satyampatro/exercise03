let pg = require('pg');
let Promise = require('bluebird')
Object.keys(pg).forEach(function (key) {
    var Class = pg[key];
    if (typeof Class === "function") {
        Promise.promisifyAll(Class.prototype);
        Promise.promisifyAll(Class);
    }
});
Promise.config({ longStackTraces: true });
Promise.promisifyAll(pg);

let config = {
    host: process.env.postgres_db_host,
    user: process.env.postgres_db_username,
    password: process.env.postgres_db_pass,
    database: process.env.postgres_db,
    port: process.env.port,
    max: process.env.postgres_db_pool_size
}

async function setUpPostgres() {
    global.pgInstance = null;

    let pool = new pg.Pool(config)
    pgInstance = await pool.connect();

    pgInstance.on('end', () => {
        console.error('Postgres pool has drained.');
    });
}
setUpPostgres().catch((e) => { console.error(e); process.exit(0); })


exports.checkDbConnectivity = function () {
    if (pgInstance != null && !pgInstance._connected) {
        console.debug('postgres connection borken, reconnecting');
        setUpPostgres().catch((e) => { console.error(e); process.exit(0); })
    }
}