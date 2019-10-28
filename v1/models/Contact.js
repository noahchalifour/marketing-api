module.exports = (sequelize, DataTypes) => {

    const Contact = sequelize.define('contact', {

        name: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: true
            }
        },
    
        type: {
            type: DataTypes.ENUM,
            values: ['Email'],
            allowNull: false,
            validate: {
                isIn: [['Email']]
            }
        },
    
        value: {
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
                fields: ['value', 'listId']
            }
        ],

        defaultScope: {
            attributes: {
                exclude: ['listId'] 
            }
        }

    });

    return Contact;

}