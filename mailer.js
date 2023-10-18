const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  secure: true,
  port: 465,
  auth: {
    user: 'john@tigrissolution.com',
    pass: 'Metalic@123',
  },
});

module.exports = transporter;
