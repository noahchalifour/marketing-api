const FlowsController = require('../controllers/FlowsController');
const TemplatesController = require('../controllers/TemplatesController');

module.exports = {

    Send: (block, flow) => {

        return new Promise(async (resolve, reject) => {

            let errors = [];

            if (!block.config.template && !block.config.text) {
                errors.push(`block.config must have either 'template' or 'text'`);
            }
    
            if (block.config.template != null) {
                const template = await TemplatesController.getByName(block.config.template, flow.userId);
                if (template == null) {
                    errors.push(`cannot find template with name '${block.config.template}'`);
                }
            }
    
            if (!block.config.from) {
                errors.push(`block.config must have 'from'`);
            }

            if (!block.config.subject) {
                errors.push(`block.config must have 'subject'`);
            }

            if (errors.length > 0) {
                return reject(errors);
            }
    
            return resolve();

        });

    },

    Wait: (block, flow) => {

        return new Promise((resolve, reject) => {

            let errors = [];

            if (block.config.milliseconds == null) {
                errors.push(`block.config must have 'milliseconds'`)
            }

            if (errors.length > 0) {
                return reject(errors);
            }

            return resolve();

        })

    },

    TransferToFlow: (block, flow) => {

        return new Promise(async (resolve, reject) => {

            let errors = [];

            if (block.config.flow == null) {
                errors.push(`block.config must have 'flow'`);
            }

            if (block.children != null) {
                errors.push(`block cannot have children`);
            }

            if (errors.length > 0) {
                return reject(errors);
            }
    
            const _flow = await FlowsController.getByName(block.config.flow, flow.userId);
    
            if (_flow == null) {
                return reject([`cannot find flow with name '${block.config.flow}'`]);
            }
    
            return resolve();

        });

    }

}