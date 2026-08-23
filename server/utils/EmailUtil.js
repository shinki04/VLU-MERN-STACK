const nodemailer = require("nodemailer");
const MyConstants = require("./MyConstants");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use false for STARTTLS; true for SSL on port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const EmailUtil = {
  send(email, id, token) {
    const text = `Thanks for signing up, please input these informations to activate your account:\n\t. id: ${id}\n\t. token: ${token}`;
    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: "Signup | Verification",
        text: text,
      };
      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          return reject(err);
        }
        resolve(result || true);
      });
    });
  },
};

module.exports = EmailUtil;
