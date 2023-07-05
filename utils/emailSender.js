const nodemailerTransport = require("../config/nodemailer")
const mailgen = require("mailgen")
const { DateTime } = require("luxon")
const { emailBodyCancel, emailBody } = require("./emailTemplates")

const sendEmailWithGmail = async (
  email,
  name,
  bookingId,
  start,
  end,
  room,
  location,
  emailAdmin,
  title,
  status
) => {
  let body

  const date = DateTime.fromISO(start, { zone: "Asia/Jakarta" }).toFormat(
    "LLL d, yyyy"
  )
  const time = `${DateTime.fromISO(start, { zone: "Asia/Jakarta" }).toFormat(
    "HH:mm"
  )} - ${DateTime.fromISO(end, { zone: "Asia/Jakarta" }).toFormat("HH:mm")}`

  switch (status) {
    case "Confirmation":
      status = `Booking ${status} Room ${room} ${date} ${time}`
      title = `<h1>Meeting Scheduled Successfully</h1>`
      body = emailBody(
        name,
        room,
        bookingId,
        location,
        emailAdmin,
        title,
        start,
        end,
        date,
        time,
        "booked"
      )
      break
    case "Reschedule":
      status = `Booking ${status} Room ${room} ${date} ${time}`
      title = `<h1>Meeting Rescheduled Successfully</h1>`
      body = emailBody(
        name,
        room,
        bookingId,
        location,
        emailAdmin,
        title,
        start,
        end,
        date,
        time,
        "rescheduled"
      )
      break
    default:
      status = `Booking Cancellation ${bookingId}`
      title = `<h1>Meeting Cancelled Successfully</h1>`
      body = emailBodyCancel(
        name,
        room,
        bookingId,
        date,
        time,
        location,
        emailAdmin
      )
      break
  }

  const mailGenerator = new mailgen({
    theme: "default",
    product: {
      name: title,
      link: "https://www.metrodataacademy.id/",
      copyright: "Copyright © 2023 Metrodata Academy. All rights reserved.",
    },
  })

  const emailOptions = {
    from: process.env.ZIMBRA_EMAIL,
    to: email,
    subject: status,
    html: mailGenerator.generate(body),
    text: mailGenerator.generatePlaintext(body),
  }

  await nodemailerTransport.sendMail(emailOptions)

  return emailOptions
}

module.exports = sendEmailWithGmail
