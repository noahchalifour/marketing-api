const PROTECTED_ATTRIBUTES = ['password', 'confirmed'];

module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('user', {

        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },

        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },

        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            lowercase: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }

    });

    User.prototype.toJSON = function() {

        let user = Object.assign({}, this.get());

        for (let a of PROTECTED_ATTRIBUTES) {
            delete user[a]
        }

        return user;

    }

    return User;

}