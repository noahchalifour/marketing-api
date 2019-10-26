const bcrypt = require('bcrypt');

const db = require('../utils/database');

const getById = (id) => {

    return new Promise((resolve, reject) => {

        db.users.findByPk(id).then(resolve, reject)

    });

}

const getByUsername = (username) => {

    return new Promise((resolve, reject) => {

        db.users.findOne({
            where: {
                username: username
            }
        }).then(resolve, reject)

    });

}

const create = (fields) => {

    return new Promise((resolve, reject) => {

        bcrypt.hash(fields.password, 10, (err, hashedPassword) => {

            if (err && fields.password != null) {
                return reject(err);
            }
    
            db.users.findOrCreate({
                where: db.Sequelize.or({ 
                    username: fields.username || null
                }, {
                    email: fields.email || null
                }),
                defaults: {
                    firstName: fields.firstName || null,
                    lastName: fields.lastName || null,
                    username: fields.username || null,
                    email: fields.email || null,
                    password: hashedPassword || null
                }
            }).then(resolve, reject);
    
        });
        
    });

}

const update = (id, fields) => {

    return new Promise((resolve, reject) => {

        if (fields.password) {
            fields.password = bcrypt.hashSync(fields.password, 10);
        }

        db.users.update(fields, {
            where: {
                id: id
            },
            returning: true
        }).then(resolve, reject);

    })

}

const destroy = (id) => {

    return new Promise((resolve, reject) => {

        db.users.destroy({
            where: {
                id: id
            }
        }).then(resolve, reject);

    })

}

module.exports = {
    getById,
    getByUsername,
    create,
    update,
    destroy
}