const express = require('express');

const FlowsController = require('../controllers/FlowsController');

const blockValidation = require('../utils/block-validation');

const router = express.Router();

router.get('/', (req, res) => {

    const limit = parseInt(req.query.limit) || 25;
    const offset = parseInt(req.query.offset) || 0;

    FlowsController.get(req.user.id, limit, offset)
        .then(
            (flows) => {

                return res.status(200).json(flows);

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: 'An unexpected error occurred while getting flows.'
                })

            }
        )

});

router.get('/:id', (req, res) => {

    const id = req.params.id;

    FlowsController.getById(id)
        .then(
            (flow) => {

                if (!flow) {
                    return res.status(404).json({
                        messageText: `Unable to find flow with id: ${id}`
                    })
                }

                if (flow.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                return res.status(200).json(flow);

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: `An unexpected error occurred while getting flow with id: ${id}`
                })

            }
        )

});

router.patch('/:id', (req, res) => {

    const id = req.params.id;

    FlowsController.getById(id)
        .then(
            async (flow) => {

                if (!flow) {
                    return res.status(404).json({
                        messageText: `Unable to find flow with id: ${id}`
                    })
                }

                if (flow.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                if (flow.triggerKey) {
                    if ((req.body.triggerKey != null && req.body.triggerValue == null) ||
                    (req.body.triggerValue != null && req.body.triggerKey == null)) {
                        return res.status(400).json({
                            messageText: 'Error(s) occurred while trying to update flow.',
                            details: [
                                'if flow.triggerKey OR flow.triggerValue are not null then both flow.triggerKey AND flow.triggerValue cannot be null'
                            ]
                        })
                    }
                } else {
                    if ((req.body.triggerKey || req.body.triggerValue) && 
                    !(req.body.triggerKey && req.body.triggerValue)) {
                        return res.status(400).json({
                            messageText: 'Error(s) occurred while trying to update flow.',
                            details: [
                                'if flow.triggerKey OR flow.triggerValue are not null then both flow.triggerKey AND flow.triggerValue cannot be null'
                            ]
                        })
                    }
                }

                if (req.body.blocks) {

                    if (!Array.isArray(req.body.blocks)) {
                        return res.status(400).json({
                            messageText: 'Error(s) occurred while trying to update flow.',
                            details: [
                                'flow.blocks must be an array'
                            ]
                        })
                    }
    
                    if (req.body.blocks.length > 1) {
                        return res.status(400).json({
                            messageText: 'Error(s) occurred while trying to update flow.',
                            details: [
                                'flow can only have one root block'
                            ]
                        })
                    }
    
                    const validateBlock = async (flowIndex, blockIndex, block) => {
    
                        let errors = [];
    
                        if (block.children) {
                            for (const i in block.children) {
                                const childResult = await validateBlock(flowIndex + 1, i, block.children[i]);
                                errors = errors.concat(childResult);
                            }
                        }
    
                        if (!block.type) {
                            errors.push(`block [${flowIndex},${blockIndex}] is invalid: type cannot be null`);
                        }
    
                        if (!block.config) {
                            errors.push(`block [${flowIndex},${blockIndex}] is invalid: config cannot be null`);
                        }

                        if (block.type && block.config) {

                            if (!(['Send', 'Wait', 'TransferToFlow'].includes(block.type))) {
                                errors.push(`block [${flowIndex},${blockIndex}] is invalid: invalid type '${block.type}'`);
                            }
        
                            if (block.type in blockValidation) {
                                try {
                                    await blockValidation[block.type](block, flow);
                                } catch (err) {
                                    errors = errors.concat(err.map(error => `block [${flowIndex},${blockIndex}] is invalid: ${error}`));
                                }
                            }

                        }
    
                        return errors;
    
                    }
    
                    if (req.body.blocks.length > 0) {
    
                        const blockValidationDetails = await validateBlock(0, 0, req.body.blocks[0]);
    
                        if (blockValidationDetails.length > 0) {
                            return res.status(400).json({
                                messageText: 'Error(s) occurred while trying to update flow.',
                                details: blockValidationDetails
                            })
                        }
    
                    }

                    const mapToDbBlocks = (block, index) => {

                        let _block = Object.assign({}, block);
                        delete _block.children;
                        _block.parent = index;
                        _block.flowId = flow.id;

                        let blocks = [_block];

                        if (!block.children) {
                            return blocks;
                        }

                        for (const child of block.children) {
                            blocks = blocks.concat(mapToDbBlocks(child, index != null ? index + 1 : 0));
                        }

                        return blocks;

                    }

                    req.body.blocks = mapToDbBlocks(req.body.blocks[0], null);

                }

                FlowsController.update(id, req.body)
                    .then(
                        ([rows, flows]) => {

                            if (JSON.stringify(req.body) == '{}') {
                                return res.status(200).json({
                                    messageText: 'Flow blocks updated successfully.'
                                })
                            }

                            if (flow.enabled && !flows[0].enabled) {
                                FlowsController.stopExecutionsById(flow.id);
                            }

                            return res.status(200).json({
                                messageText: 'Flow updated successfully.',
                                flow: flows[0]
                            })

                        },
                        (error) => {

                            if (error.name != 'SequelizeValidationError') {
                                console.error(error);
                                return res.status(500).json({
                                    messageText: 'An unexpected error occurred while updating flow.'
                                });
                            }
            
                            const details = error.errors.map(err => err.message);
                    
                            return res.status(400).json({
                                messageText: 'Error(s) occurred while trying to update flow.',
                                details
                            });

                        }
                    )

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: `An unexpected error occurred while getting flow with id: ${id}`
                })

            }
        )

});

router.delete('/:id', (req, res) => {

    const id = req.params.id;

    FlowsController.getById(id)
        .then(
            (flow) => {

                if (!flow) {
                    return res.status(404).json({
                        messageText: `Unable to find flow with id: ${id}`
                    })
                }

                if (flow.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                FlowsController.destroy(id)
                    .then(
                        () => {

                            return res.status(200).json({
                                messageText: 'Flow deleted successfully.'
                            })

                        },
                        (error) => {

                            console.error(error);

                            return res.status(500).json({
                                messageText: 'An unexpected error occurred while deleting flow.'
                            })

                        }
                    )

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: 'An unexpected error occurred while deleting flow.'
                })

            }
        )

});

router.post('/create', (req, res) => {

    req.body.userId = req.user.id;

    if ((req.body.triggerKey || req.body.triggerValue) && 
    !(req.body.triggerKey && req.body.triggerValue)) {
        return res.status(400).json({
            messageText: 'Error(s) occurred while trying to create flow.',
            details: [
                'if flow.triggerKey OR flow.triggerValue are not null then both flow.triggerKey AND flow.triggerValue cannot be null'
            ]
        })
    }

    FlowsController.create(req.body)
        .then(
            ([flow, created]) => {

                if (!created) {
    
                    let details = [];
    
                    if (flow.name == req.body.name) {
                        details.push('flow already exists');
                    }

                    if (flow.triggerKey == req.body.triggerKey && flow.triggerValue && flow.triggerValue) {
                        details.push(`flow with trigger '${flow.triggerKey}': '${flow.triggerValue}' already exists`)
                    }
    
                    return res.status(400).json({
                        messageText: 'Error(s) occurred while trying to create flow.',
                        details
                    })
    
                }
    
                return res.status(200).json({
                    messageText: 'Flow created successfully.',
                    flow
                });
    
            },
            (error) => {
    
                if (error.name != 'SequelizeValidationError') {
                    console.error(error);
                    return res.status(500).json({
                        messageText: 'An unexpected error occurred while creating flow.'
                    });
                }
    
                const details = error.errors.map(err => err.message);
    
                return res.status(400).json({
                    messageText: 'Error(s) occurred while trying to create flow.',
                    details
                });
    
            }
        )

});

module.exports = router;