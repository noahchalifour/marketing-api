const async = require('async');

const db = require('../utils/database');
const blocks = require('../utils/block-execution');

const get = (flowId, limit, offset) => {

    return new Promise((resolve, reject) => {

        db.blocks.findAll({
            limit: limit,
            offset: offset,
            where: {
                flowId
            }
        }).then(resolve, reject);

    });

}

const getById = (id) => {

    return new Promise((resolve, reject) => {

        db.blocks.findByPk(id, {
            include: [db.flows]
        }).then(resolve, reject);

    })

}

const getByParentId = (flowId, id) => {

    return new Promise((resolve, reject) => {

        db.blocks.findOne({
            where: {
                flowId,
                parentId: id
            }
        }).then(resolve, reject);

    })

}

const create = (fields) => {

    return new Promise((resolve, reject) => {

        db.blocks.create({
            type: fields.type || null,
            config: fields.config ? JSON.stringify(fields.config) || null : null,
            flowId: fields.flowId || null,
            parentId: fields.parentId || null
        }).then(resolve, reject);

    });

}

const update = (id, fields) => {

    return new Promise((resolve, reject) => {

        if (fields.config) {
            fields.config = JSON.stringify(fields.config);
        }

        db.blocks.update(fields, {
            where: {
                id
            },
            returning: true
        }).then(resolve, reject);

    })

}

const destroy = (id) => {

    return new Promise((resolve, reject) => {

        db.blocks.destroy({
            where: {
                id
            }
        }).then(resolve, reject);

    })

}

const destroyByFlow = (flowId) => {

    return new Promise((resolve, reject) => {

        db.blocks.destroy({
            where: {
                flowId
            }
        }).then(resolve, reject);

    })

}

const call = (id, contacts) => {

    return new Promise((resolve, reject) => {

        getById(id)
            .then(
                (block) => {

                    block.config = JSON.parse(block.config);

                    async.each(contacts, (contact, callback) => {

                        blocks[block.type](block, contact)
                            .then(callback, callback);

                    }, (err) => {

                        if (err) {
                            return reject(err);
                        }

                        return resolve();

                    })

                },
                reject
            )

    })

}

module.exports = {
    get,
    getById,
    getByParentId,
    create,
    update,
    destroy,
    destroyByFlow,
    call
}