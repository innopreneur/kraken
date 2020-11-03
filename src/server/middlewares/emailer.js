require('dotenv').config()
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


function sendSubmissionEmail(to, name, id) {
    const msg = {
        to,
        from: 'innoprenuer@example.com',
        templateId: 'd-0b01c70f69c3423d8a0df87ac71129c5',
        dynamic_template_data: {
            name,
            id
        }

    };
    sgMail.send(msg);
}

function sendApprovalEmail(to, name, category) {
    const msg = {
        to,
        from: 'innoprenuer@example.com',
        templateId: 'd-de82a8896e1543d98553cdeff9c1eab3',
        dynamic_template_data: {
            name,
            category
        }

    };
    sgMail.send(msg);
}


function sendRejectionEmail(to, name, reason) {
    const msg = {
        to,
        from: 'innoprenuer@example.com',
        templateId: 'd-bd0b71a772ff40d7897ada4d90f13772',
        dynamic_template_data: {
            name,
            reason
        }

    };
    sgMail.send(msg);
}

function sendAdminEmail(to, data) {
    const { oappid, name, description, logourl,
        sourceurl, homepage, category, email } = data
    const msg = {
        to,
        from: 'innoprenuer@example.com',
        templateId: 'd-f0ba6ebf0b7b49e1aff39e9bf776ef7d',
        dynamic_template_data: {
            id: oappid,
            name,
            description,
            logourl,
            sourceurl,
            homepage,
            category,
            email
        }

    };
    sgMail.send(msg);
}

export {
    sendAdminEmail,
    sendApprovalEmail,
    sendRejectionEmail,
    sendSubmissionEmail
}