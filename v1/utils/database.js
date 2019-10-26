const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
        host: process.env.DB_SERVER,
        dialect: process.env.DB_TYPE
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('../models/User')(sequelize, Sequelize);
db.lists = require('../models/List')(sequelize, Sequelize);
db.contacts = require('../models/Contact')(sequelize, Sequelize);

db.users.hasMany(db.lists);
db.lists.belongsTo(db.users);
db.lists.hasMany(db.contacts);
db.contacts.belongsTo(db.lists);

// sequelize.sync();

module.exports = db;