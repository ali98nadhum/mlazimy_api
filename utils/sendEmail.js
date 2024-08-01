const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define email options
  const mailOptions = {
    from: "Mlazimy Platform <alinadhum19@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
