const nodemailer = require("nodemailer")

const nodemailerTransport = nodemailer.createTransport({
  host: process.env.ZIMBRA_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZIMBRA_EMAIL,
    pass: process.env.ZIMBRA_PASSWORD,
  },
})

module.exports = nodemailerTransport
