const express = require('express');
const passport = require('passport');

const UsersController = require('../controllers/UsersController');

const router = express.Router();

router.post('/create', (req, res) => {

    if (!req.body.password) {
        return res.status(400).json({
            messageText: 'Error(s) occurred while trying to create user.',
            details: [
                'user.password cannot be null'
            ]
        })
    }

    UsersController.create(req.body)
        .then(
            ([user, created]) => {

                if (!created) {

                    let details = [];
        
                    if (user.email == req.body.email) {
                        details.push('email already taken');
                    }
        
                    if (user.username == req.body.username) {
                        details.push('username already taken');
                    }
        
                    return res.status(400).json({
                        messageText: 'Error(s) occurred while trying to create user.',
                        details
                    })

                }
        
                return res.status(200).json({
                    messageText: 'User created successfully.',
                    user
                });

            },
            (error) => {

                if (error.name != 'SequelizeValidationError') {
                    console.error(error);
                    return res.status(500).json({
                        messageText: 'An unexpected error occurred while creating user.'
                    });
                }
        
                const details = error.errors.map(err => err.message);
        
                return res.status(400).json({
                    messageText: 'Error(s) occurred while trying to create user.',
                    details
                });

            }
        )

});

router.use(passport.authenticate('basic', { session: false }));

router.get('/me', (req, res) => {

    return res.status(200).json(req.user);

});

router.patch('/me', (req, res) => {

    UsersController.update(req.user.id, req.body)
        .then(
            ([rows, users]) => {

                return res.status(200).json({
                    messageText: 'User updated successfully.',
                    user: users[0]
                })

            },
            (error) => {

                if (error.name != 'SequelizeValidationError') {
                    console.error(error);
                    return res.status(500).json({
                        messageText: 'An unexpected error occurred while updating user.'
                    });
                }

                const details = error.errors.map(err => err.message);
        
                return res.status(400).json({
                    messageText: 'Error(s) occurred while trying to update user.',
                    details
                });

            }
        )

});

router.delete('/me', (req, res) => {

    UsersController.destroy(req.user.id)
        .then(
            () => {

                return res.status(200).json({
                    messageText: 'User deleted successfully.'
                })

            },
            (error) => {

                console.error(error);

                return res.status(500).json({
                    messageText: 'An unexpected error occurred while deleting user.'
                })

            }
        )

})

module.exports = router;