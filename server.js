const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');

const dotenv = require('dotenv');
dotenv.config();

const v1Router = require('./v1');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(logger('dev'))
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    
    return done(null, user.id);

});

app.use('/v1', v1Router);

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));