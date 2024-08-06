const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports.sendConfirmationEmail = (email, activationCode) => {
  transport
    .sendMail({
      from: process.env.EMAIL_USER,
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
/*
module.exports.sendJoinEmail = (email, joinUrl) => {
  transport
    .sendMail({
      from: "manaamoataz@gmail.com",
      to: email,
      subject: "Join Project",
      html: `<h1>Join Project</h1>
          <p>You have been invited to join a project. Click the link below to join:</p>
          <a href="${joinUrl}">Join Project</a>`,
    })
    .catch((err) => console.log(err));
};*/
