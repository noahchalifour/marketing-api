const express = require('express');

const ListsController = require('../controllers/ListsController');

const router = express.Router();

router.get('/', (req, res) => {

    const limit = parseInt(req.query.limit) || 25;
    const offset = parseInt(req.query.offset) || 0;

    ListsController.get(req.user.id, limit, offset)
        .then(
            (lists) => {

                return res.status(200).json(lists);

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: 'An unexpected error occurred while getting lists.'
                })

            }
        )

});

router.get('/:id', (req, res) => {

    const id = req.params.id;

    ListsController.getById(id)
        .then(
            (list) => {

                if (!list) {
                    return res.status(404).json({
                        messageText: `Unable to find list with id: ${id}`
                    })
                }

                if (list.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                return res.status(200).json(list);

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: `An unexpected error occurred while getting list with id: ${id}`
                })

            }
        )

});

router.patch('/:id', (req, res) => {

    const id = req.params.id;

    ListsController.getById(id)
        .then(
            (list) => {

                if (!list) {
                    return res.status(404).json({
                        messageText: `Unable to find list with id: ${id}`
                    })
                }

                if (list.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                ListsController.update(id)
                    .then(
                        ([rows, lists]) => {

                            return res.status(200).json({
                                messageText: 'List updated successfully.',
                                list: lists[0]
                            })

                        },
                        (error) => {

                            if (error.name != 'SequelizeValidationError') {
                                console.error(error);
                                return res.status(500).json({
                                    messageText: 'An unexpected error occurred while updating list.'
                                });
                            }
            
                            const details = error.errors.map(err => err.message);
                    
                            return res.status(400).json({
                                messageText: 'Error(s) occurred while trying to update list.',
                                details
                            });

                        }
                    )

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: `An unexpected error occurred while getting list with id: ${id}`
                })

            }
        )

});

router.delete('/:id', (req, res) => {

    const id = req.params.id;

    ListsController.getById(id)
        .then(
            (list) => {

                if (!list) {
                    return res.status(404).json({
                        messageText: `Unable to find list with id: ${id}`
                    })
                }

                if (list.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                ListsController.destroy(id)
                    .then(
                        () => {

                            return res.status(200).json({
                                messageText: 'List deleted successfully.'
                            })

                        },
                        (error) => {

                            console.error(error);

                            return res.status(500).json({
                                messageText: 'An unexpected error occurred while deleting list.'
                            })

                        }
                    )

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: 'An unexpected error occurred while deleting list.'
                })

            }
        )

})

router.post('/create', (req, res) => {

    req.body.userId = req.user.id;

    ListsController.create(req.body)
        .then(
            ([list, created]) => {

                if (!created) {
    
                    let details = [];
    
                    if (list.name == fields.name) {
                        details.push('list already exists');
                    }
    
                    return res.status(400).json({
                        messageText: 'Error(s) occurred while trying to create list.',
                        details
                    })
    
                }
    
                return res.status(200).json({
                    messageText: 'List created successfully.',
                    list
                });
    
            },
            (error) => {
    
                if (error.name != 'SequelizeValidationError') {
                    console.error(error);
                    return res.status(500).json({
                        messageText: 'An unexpected error occurred while creating list.'
                    });
                }
    
                const details = error.errors.map(err => err.message);
    
                return res.status(400).json({
                    messageText: 'Error(s) occurred while trying to create list.',
                    details
                });
    
            }
        )

});

module.exports = router;