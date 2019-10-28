const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
        host: process.env.DB_SERVER,
        dialect: process.env.DB_TYPE,
        logging: false
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('../models/User')(sequelize, Sequelize);
db.lists = require('../models/List')(sequelize, Sequelize);
db.contacts = require('../models/Contact')(sequelize, Sequelize);
db.flows = require('../models/Flow')(sequelize, Sequelize);
db.blocks = require('../models/Block')(sequelize, Sequelize);
db.templates = require('../models/Template')(sequelize, Sequelize);

db.users.hasMany(db.lists);
db.lists.belongsTo(db.users);

db.lists.hasMany(db.contacts);
db.contacts.belongsTo(db.lists);

db.users.hasMany(db.flows);
db.flows.belongsTo(db.users);

db.flows.hasMany(db.blocks);
db.blocks.belongsTo(db.flows);
db.blocks.belongsTo(db.blocks, { as: 'parent' });

db.users.hasMany(db.templates);
db.templates.belongsTo(db.users);

sequelize.sync();

module.exports = db;