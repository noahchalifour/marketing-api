const PROTECTED_ATTRIBUTES = ['userId'];

module.exports = (sequelize, DataTypes) => {

    const List = sequelize.define('list', {

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
    
        description: {
            type: DataTypes.STRING,
            allowNull: false
        }
    
    }, {
    
        indexes: [
            {
                unique: true,
                fields: ['name', 'userId']
            }
        ]
    
    });

    List.prototype.toJSON = function() {

        let list = Object.assign({}, this.get());

        for (let a of PROTECTED_ATTRIBUTES) {
            delete list[a]
        }

        return list;

    }

    return List;

}