const db = require('../utils/database');

const get = (userId, limit, offset) => {

    return new Promise((resolve, reject) => {

        db.templates.findAll({
            limit: limit,
            offset: offset,
            where: {
                userId: userId
            }
        }).then(resolve, reject);

    });

}

const getById = (id) => {

    return new Promise((resolve, reject) => {

        db.templates.findByPk(id).then(resolve, reject);

    })

}

const getByName = (name, userId) => {

    return new Promise((resolve, reject) => {

        db.templates.findOne({
            where: {
                name, userId
            }
        }).then(resolve, reject);

    })

}

const create = (fields) => {

    return new Promise((resolve, reject) => {

        db.templates.findOrCreate({
            where: {
                name: fields.name || null,
                userId: fields.userId || null
            },
            defaults: {
                name: fields.name || null,
                html: fields.html || null,
                text: fields.text || null,
                userId: fields.userId || null
            }
        }).then(resolve, reject);

    });

}

const update = (id, fields) => {

    return new Promise((resolve, reject) => {

        db.templates.update(fields, {
            where: {
                id
            },
            returning: true
        }).then(resolve, reject);

    })

}

const destroy = (id) => {

    return new Promise((resolve, reject) => {

        db.templates.destroy({
            where: {
                id
            }
        }).then(resolve, reject);

    })

}

module.exports = {
    get,
    getById,
    getByName,
    create,
    update,
    destroy
}