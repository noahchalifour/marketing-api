const PROTECTED_ATTRIBUTES = ['userId'];

module.exports = (sequelize, DataTypes) => {

    const Template = sequelize.define('template', {

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },

        html: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: true
            }
        },

        text: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }

    }, {
    
        indexes: [
            {
                unique: true,
                fields: ['name', 'userId']
            }
        ]
    
    });

    Template.prototype.toJSON = function() {

        let template = Object.assign({}, this.get());

        for (let a of PROTECTED_ATTRIBUTES) {
            delete template[a]
        }

        return template;

    }

    return Template;

}