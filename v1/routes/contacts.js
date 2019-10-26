const express = require('express');

const ListsController = require('../controllers/ListsController');
const ContactsController = require('../controllers/ContactsController');

const router = express.Router();

router.get('/:id', (req, res) => {

    const id = req.params.id;

    ContactsController.getById(id)
        .then(
            (contact) => {

                if (!contact) {
                    return res.status(404).json({
                        messageText: `Unable to find contact with id: ${id}`
                    })
                }

                if (contact.list.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                return res.status(200).json(contact);

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: `An unexpected error occurred while getting contact with id: ${id}`
                })

            }
        )

});

router.patch('/:id', (req, res) => {

    const id = req.params.id;

    ContactsController.getById(id)
        .then(
            (contact) => {

                if (!contact) {
                    return res.status(404).json({
                        messageText: `Unable to find contact with id: ${id}`
                    })
                }

                if (contact.list.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                ContactsController.update(id)
                    .then(
                        ([rows, contacts]) => {

                            return res.status(200).json({
                                messageText: 'Contact updated successfully.',
                                contact: contacts[0]
                            })

                        },
                        (error) => {

                            if (error.name != 'SequelizeValidationError') {
                                console.error(error);
                                return res.status(500).json({
                                    messageText: 'An unexpected error occurred while updating contact.'
                                });
                            }
            
                            const details = error.errors.map(err => err.message);
                    
                            return res.status(400).json({
                                messageText: '',
                                details
                            });

                        }
                    )

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: `An unexpected error occurred while getting contact with id: ${id}`
                })

            }
        )

});

router.delete('/:id', (req, res) => {

    const id = req.params.id;

    ContactsController.getById(id)
        .then(
            (contact) => {

                if (!contact) {
                    return res.status(404).json({
                        messageText: `Unable to find contact with id: ${id}`
                    })
                }

                if (contact.list.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                ContactsController.destroy(id)
                    .then(
                        () => {

                            return res.status(200).json({
                                messageText: 'Contact deleted successfully.'
                            })

                        },
                        (error) => {

                            console.error(error);

                            return res.status(500).json({
                                messageText: 'An unexpected error occurred while deleting contact.'
                            })

                        }
                    )

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: 'An unexpected error occurred while deleting contact.'
                })

            }
        )

})

router.post('/create', (req, res) => {

    if (req.body.listId == null) {
        return res.status(400).json({
            messageText: 'Error(s) occurred while trying to create contact.',
            details: [
                'contact.listId cannot be null'
            ]
        })
    }

    ListsController.getById(req.body.listId)
        .then(
            (list) => {

                if (!list) {
                    return res.status(404).json({
                        messageText: `Unable to find list with id: ${req.body.listId}`
                    })
                }

                if (list.userId != req.user.id) {
                    return res.status(401).json({
                        messageText: 'You are not authorized to access this resource.'
                    })
                }

                ContactsController.create(req.body)
                    .then(
                        ([contact, created]) => {

                            if (!created) {
                
                                let details = [];
                
                                if (contact.value == fields.value) {
                                    details.push('contact already exists');
                                }
                
                                return res.status(400).json({
                                    messageText: 'Error(s) occurred while trying to create contact.',
                                    details
                                })
                
                            }
                
                            return res.status(200).json({
                                messageText: 'Contact created successfully.',
                                contact
                            });
                
                        },
                        (error) => {
                
                            if (error.name != 'SequelizeValidationError') {
                                console.error(error);
                                return res.status(500).json({
                                    messageText: 'An unexpected error occurred while creating contact.'
                                });
                            }
                
                            const details = error.errors.map(err => err.message);
                
                            return res.status(400).json({
                                messageText: 'Error(s) occurred while trying to create contact.',
                                details
                            });
                
                        }
                    )

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: 'An unexpected error occurred while creating contact.'
                })

            }
        )

});

module.exports = router;