const Sequelize = require('sequelize');

const BlocksController = require('../controllers/BlocksController');

const db = require('../utils/database');

let flowExecutions = {};

const get = (userId, limit, offset) => {

    return new Promise((resolve, reject) => {

        db.flows.findAll({
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

        db.flows.findByPk(id, {
            include: [db.blocks]
        }).then(resolve, reject);

    })

}

const getByName = (name, userId) => {

    return new Promise((resolve, reject) => {

        db.flows.findOne({
            where: {
                name, userId
            },
            include: [db.blocks]
        }).then(resolve, reject);

    })

}

const _execute = (flow, contacts) => {

    return new Promise(async (resolve, reject) => {

        let block = null;
        let waitTime = 0;

        do {

            let blockIds = [];

            while (true) {

                block = await BlocksController.getByParentId(flow.id, 
                    block ? block.id : null);

                if (block == null || block.type == 'Wait') {
                    break;
                }

                if (block.id == null) {
                    return reject(block);
                }
                
                blockIds.push(block.id);

            }

            if (!(flow.id in flowExecutions)) {
                flowExecutions[flow.id] = [];
            }

            flowExecutions[flow.id].push(setTimeout(async () => {

                for (const id of blockIds) {
                    const blockErr = await BlocksController.call(id, contacts);
                    if (blockErr != null) {
                        console.error(blockErr);
                    }
                }

            }, waitTime));

            if (block != null) {
                block.config = JSON.parse(block.config);
                waitTime += block.config.milliseconds;
            }

        } while (block != null);

        return resolve(null);

    });

}

const executeByTrigger = (key, value, contacts) => {

    return new Promise((resolve, reject) => {

        db.flows.findOne({
            where: {
                triggerKey: key,
                triggerValue: value,
                enabled: true
            }
        }).then(
            (flow) => {

                if (flow == null) {
                    return reject();
                }

                _execute(flow, contacts)
                    .then(resolve, reject)

            }, reject);

    })

}

const executeByName = (name, userId, contacts) => {

    return new Promise((resolve, reject) => {

        db.flows.findOne({
            where: {
                name, userId,
                enabled: true
            }
        }).then(
            (flow) => {

                if (flow == null) {
                    return reject();
                }

                _execute(flow, contacts)
                    .then(resolve, reject)

            }, reject);

    })

}

const stopExecutionsById = (id) => {

    if (id in flowExecutions) {

        for (const timeout of flowExecutions[id]) {

            clearTimeout(timeout);

        }

        delete flowExecutions[id];

    }
    

}

const create = (fields) => {

    return new Promise((resolve, reject) => {

        db.flows.findOrCreate({
            where: Sequelize.or({
                name: fields.name || null,
                userId: fields.userId || null
            }, {
                triggerKey: fields.triggerValue ? fields.triggerKey || null : null,
                triggerValue: fields.triggerKey ? fields.triggerValue || null : null
            }),
            defaults: {
                name: fields.name || null,
                description: fields.description || '',
                userId: fields.userId || null,
                triggerKey: fields.triggerValue ? fields.triggerKey || null : null,
                triggerValue: fields.triggerKey ? fields.triggerValue || null : null
            }
        }).then(resolve, reject);

    });

}

const update = (id, fields) => {

    return new Promise(async (resolve, reject) => {

        if (fields.blocks) {

            const oldBlocks = await BlocksController.get(id, null, 0);

            for (i in fields.blocks) {

                fields.blocks[i].parentId = fields.blocks[i].parent;
                if (fields.blocks[i].parent != null) {
                    fields.blocks[i].parentId = fields.blocks[fields.blocks[i].parent].id;
                }
                delete fields.blocks[i].parent;

                let newBlock = null;

                if (i < oldBlocks.length) {
                    const updateResult = await BlocksController.update(oldBlocks[i].id, fields.blocks[i]);
                    newBlock = updateResult[1][0];
                } else {
                    newBlock = await BlocksController.create(fields.blocks[i]);
                }

                fields.blocks[i] = newBlock;

            }

            for (const old of oldBlocks.slice(fields.blocks.length)) {
                await BlocksController.destroy(old.id);
            }

            delete fields.blocks;

        }

        db.flows.update(fields, {
            where: {
                id
            },
            returning: true
        }).then(resolve, reject);

    })

}

const destroy = (id) => {

    return new Promise((resolve, reject) => {

        db.flows.destroy({
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
    executeByName,
    executeByTrigger,
    stopExecutionsById,
    create,
    update,
    destroy
}