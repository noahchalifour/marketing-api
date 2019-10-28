const nodemailer = require('nodemailer');

const TemplatesController = require('../controllers/TemplatesController');

module.exports = {

    Send: (block, contact) => {

        return new Promise(async (resolve, reject) => {

            if (contact.type == 'Email') {

                let transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT,
                    secure: process.env.SMTP_PORT == 465 ? true : false,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASSWORD
                    }
                });

                let text, html;

                if (block.config.template != null) {
                    const template = await TemplatesController.getByName(block.config.template, block.flow.userId);
                    text = template.text;
                    html = template.html;
                } else {
                    html = block.config.text;
                    text = block.config.text;
                }
    
                transporter.sendMail({
                    from: block.config.from,
                    to: contact.value,
                    subject: block.config.subject,
                    text: text,
                    html: html
                }).then(resolve, reject)

            }

            reject();

        });

    },

    TransferToFlow: (block, contact) => {

        const FlowsController = require('../controllers/FlowsController');

        return new Promise((resolve, reject) => {

            FlowsController.executeByName(block.config.flow, block.flow.userId, [contact])
                .then(resolve, reject);

        })

    }

}