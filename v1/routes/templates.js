const express = require('express');

const TemplatesController = require('../controllers/TemplatesController');

const router = express.Router();

router.get('/', (req, res) => {

    const limit = parseInt(req.query.limit) || 25;
    const offset = parseInt(req.query.offset) || 0;

    TemplatesController.get(req.user.id, limit, offset)
        .then(
            (templates) => {

                return res.status(200).json(templates);

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: 'An unexpected error occurred while getting templates.'
                })

            }
        )

});

router.get('/:id', (req, res) => {

    const id = req.params.id;

    TemplatesController.getById(id)
        .then(
            (template) => {

                if (!template) {
                    return res.status(404).json({
                        messageText: `Unable to find template with id: ${id}`
                    })
                }

                if (template.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                return res.status(200).json(template);

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: `An unexpected error occurred while getting template with id: ${id}`
                })

            }
        )

});

router.patch('/:id', (req, res) => {

    const id = req.params.id;

    TemplatesController.getById(id)
        .then(
            (template) => {

                if (!template) {
                    return res.status(404).json({
                        messageText: `Unable to find template with id: ${id}`
                    })
                }

                if (template.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                TemplatesController.update(id, req.body)
                    .then(
                        ([rows, templates]) => {

                            return res.status(200).json({
                                messageText: 'Template updated successfully.',
                                template: templates[0]
                            })

                        },
                        (error) => {

                            if (error.name != 'SequelizeValidationError') {
                                console.error(error);
                                return res.status(500).json({
                                    messageText: 'An unexpected error occurred while updating template.'
                                });
                            }
            
                            const details = error.errors.map(err => err.message);
                    
                            return res.status(400).json({
                                messageText: 'Error(s) occurred while trying to update template.',
                                details
                            });

                        }
                    )

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: `An unexpected error occurred while getting template with id: ${id}`
                })

            }
        )

});

router.delete('/:id', (req, res) => {

    const id = req.params.id;

    TemplatesController.getById(id)
        .then(
            (template) => {

                if (!template) {
                    return res.status(404).json({
                        messageText: `Unable to find template with id: ${id}`
                    })
                }

                if (template.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                TemplatesController.destroy(id)
                    .then(
                        () => {

                            return res.status(200).json({
                                messageText: 'Template deleted successfully.'
                            })

                        },
                        (error) => {

                            console.error(error);

                            return res.status(500).json({
                                messageText: 'An unexpected error occurred while deleting template.'
                            })

                        }
                    )

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: 'An unexpected error occurred while deleting template.'
                })

            }
        )

});

router.post('/create', (req, res) => {

    req.body.userId = req.user.id;

    TemplatesController.create(req.body)
        .then(
            ([template, created]) => {

                if (!created) {
    
                    let details = [];
    
                    if (template.name == req.body.name) {
                        details.push('template already exists');
                    }
    
                    return res.status(400).json({
                        messageText: 'Error(s) occurred while trying to create template.',
                        details
                    })
    
                }
    
                return res.status(200).json({
                    messageText: 'Template created successfully.',
                    template
                });
    
            },
            (error) => {
    
                if (error.name != 'SequelizeValidationError') {
                    console.error(error);
                    return res.status(500).json({
                        messageText: 'An unexpected error occurred while creating template.'
                    });
                }
    
                const details = error.errors.map(err => err.message);
    
                return res.status(400).json({
                    messageText: 'Error(s) occurred while trying to create template.',
                    details
                });
    
            }
        )

});

module.exports = router;