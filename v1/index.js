const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { BasicStrategy } = require('passport-http');

const UsersController = require('./controllers/UsersController');

const usersRouter = require('./routes/users');
const listsRouter = require('./routes/lists');
const contactsRouter = require('./routes/contacts');
const flowsRouter = require('./routes/flows');
const templatesRouter = require('./routes/templates');

const router = express.Router();

passport.deserializeUser((id, done) => {

    UsersController.getById(id)
        .then(
            (user) => {
                return done(null, user);
            },
            (error) => {
                return done(error);
            }
        )

});

passport.use(new BasicStrategy((username, password, done) => {

    UsersController.getByUsername(username)
        .then(
            (user) => {

                if (!user) {
                    return done('Access denied due to invalid credentials.');
                }

                bcrypt.compare(password, user.password, (err, res) => {

                    if (err) {
                        console.error(err);
                        return done('An unexpected error occurred while authorizing.');
                    }
        
                    if (res) {

                        return done(null, user);

                    } else {

                        return done('Access denied due to invalid credentials.');

                    }
                
                })

            },
            (error) => {

                console.error(error);
                return done('An unexpected error occurred while authenticating.');

            }
        )

}))

router.use('/users', usersRouter);

router.use(passport.authenticate('basic', { session: false }));

router.use('/lists', listsRouter);
router.use('/contacts', contactsRouter);
router.use('/flows', flowsRouter);
router.use('/templates', templatesRouter);

module.exports = router;