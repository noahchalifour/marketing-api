const db = require('../utils/database');

const get = (userId, limit, offset) => {

    return new Promise((resolve, reject) => {

        db.lists.findAll({
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

        db.lists.findByPk(id, {
            include: [db.contacts]
        }).then(resolve, reject);

    })

}

const create = (fields) => {

    return new Promise((resolve, reject) => {

        db.lists.findOrCreate({
            where: {
                name: fields.name || null,
                userId: fields.userId || null
            },
            defaults: {
                name: fields.name || null,
                description: fields.description || '',
                userId: fields.userId || null
            }
        }).then(resolve, reject);

    });

}

const update = (id, fields) => {

    return new Promise((resolve, reject) => {

        db.lists.update(fields, {
            where: {
                id
            },
            returning: true
        }).then(resolve, reject);

    })

}

const destroy = (id) => {

    return new Promise((resolve, reject) => {

        db.lists.destroy({
            where: {
                id
            }
        }).then(resolve, reject);

    })

}

module.exports = {
    get,
    getById,
    create,
    update,
    destroy
}