const db = require('../utils/database');

const get = (listId, limit, offset) => {

    return new Promise((resolve, reject) => {

        db.contacts.findAll({
            limit: limit,
            offset: offset,
            where: {
                listId: listId
            }
        }).then(resolve, reject);

    });

}

const getById = (id) => {

    return new Promise((resolve, reject) => {

        db.contacts.findByPk(id, {
            include: [db.lists]
        }).then(resolve, reject);

    })

}

const create = (fields) => {

    return new Promise((resolve, reject) => {

        db.contacts.findOrCreate({
            where: {
                value: fields.value || null,
                listId: fields.listId || null
            },
            defaults: {
                name: fields.name || null,
                type: fields.type || null,
                value: fields.value || null,
                listId: fields.listId || null
            }
        }).then(resolve, reject);

    });

}

const update = (id, fields) => {

    return new Promise((resolve, reject) => {

        db.contacts.update(fields, {
            where: {
                id
            },
            returning: true
        }).then(resolve, reject);

    })

}

const destroy = (id) => {

    return new Promise((resolve, reject) => {

        db.contacts.destroy({
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