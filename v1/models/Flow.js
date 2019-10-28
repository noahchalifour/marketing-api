const PROTECTED_ATTRIBUTES = ['userId'];

module.exports = (sequelize, DataTypes) => {

    const Flow = sequelize.define('flow', {

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
        },

        triggerKey: {
            type: DataTypes.ENUM,
            allowNull: true,
            values: ['Add To List'],
            validate: {
                isIn: [['Add To List']]
            }
        },

        triggerValue: {
            type: DataTypes.STRING,
            allowNull: true
        },

        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }

    }, {
    
        indexes: [
            {
                unique: true,
                fields: ['name', 'userId']
            },
            {
                unique: true,
                fields: ['triggerKey', 'triggerValue', 'userId']
            }
        ]
    
    });

    Flow.prototype.toJSON = function() {

        let flow = Object.assign({}, this.get());

        for (let a of PROTECTED_ATTRIBUTES) {
            delete flow[a]
        }

        const mapBlocks = (parentId) => {

            let blocks = flow.blocks.filter(block => block.parentId == parentId);

            for (const i in blocks) {
                blocks[i].dataValues.children = mapBlocks(blocks[i].id);
            }

            return blocks;

        }

        if (flow.blocks) {
            flow.blocks = mapBlocks(null);
        }

        return flow;

    }

    return Flow;

}