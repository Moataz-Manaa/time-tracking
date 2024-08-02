const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "manaamoataz@gmail.com",
    pass: "kepojprouthxdxwk",
  },
});

module.exports.sendConfirmationEmail = (email, activationCode) => {
  transport
    .sendMail({
      from: "manaamoataz@gmail.com",
      to: email,
      subject: "email activation",
      html: `<h1>confirmation email</h1>
    <h2>Hello</h2>
    <p>To activate your account, please click on this link</p>
    <a href=http://localhost:5173/activate/${activationCode}>click here !</a>
    `,
    })
    .catch((err) => console.log(err));
};
