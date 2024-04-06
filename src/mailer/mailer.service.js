const nodeMailer = require("nodemailer");
const path = require("path");
const hbs = require("nodemailer-express-handlebars");

const {
  mailer: { sender, password },
} = require("../config/config.env");

const transporter = nodeMailer.createTransport({
  service: "Gmail",
  auth: {
    user: sender,
    pass: password,
  },
});

// point to the template folder
const handlebarOptions = {
  viewEngine: {
    partialsDir: path.resolve("./src/mailer/templates/"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./src/mailer/templates/"),
};

// use a template file with nodemailer
transporter.use("compile", hbs(handlebarOptions));

const sendEmail = async ({ to = "", name = "" }) => {
  console.log({ to });
  var opts = {
    from: sender,
    to,
    subject: "Clothing store notification",
    text: `Hii ${name} !`,
    template: "receiver",
    context: {
      name,
      website: "jewelrystorevn.io.vn",
      token: "512344",
    },
  };

  transporter.sendMail(opts, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = sendEmail;
