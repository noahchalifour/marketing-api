module.exports = (sequelize, DataTypes) => {

    const Block = sequelize.define('block', {

        type: {
            type: DataTypes.ENUM,
            values: ['Wait', 'Send', 'TransferToFlow'],
            allowNull: false,
            validate: {
                isIn: [['Wait', 'Send', 'TransferToFlow']]
            }
        },

        config: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }

    });

    return Block;

}