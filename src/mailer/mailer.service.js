const nodeMailer = require("nodemailer");
const path = require("path");
const hbs = require("nodemailer-express-handlebars");
const { generateMailToken } = require("../auth/jwt");

const {
  mailer: { sender, password },
  website: { url },
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

const sendEmail = async ({ to = "", name = "", token = "" }) => {
  const randomToken = Math.floor(100000 + Math.random() * 900000);

  const payload = {
    name,
    toEmail: to,
    token: randomToken,
  };

  const mailToken = generateMailToken(payload);

  var opts = {
    from: sender,
    to,
    subject: "Clothing store notification",
    text: `Hii ${name} !`,
    template: "receiver",
    context: {
      name,
      website: url,
      token: randomToken,
      hrefVerify: `${url}/verify?q=${mailToken}`,
    },
  };

  transporter.sendMail(opts, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  return mailToken;
};

module.exports = sendEmail;
