const {
  googleCalendarGenerator,
  outlookCalendarGenerator,
} = require("./calendarGenerator")

function emailBody(
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
  status
) {
  const googleCalendar = googleCalendarGenerator(
    start,
    end,
    `${room} Room ${location}`,
    `${title} - ROOME`
  )
  const outlookCalendar = outlookCalendarGenerator(
    start,
    end,
    `${room} Room ${location}`,
    `${title} - ROOME`
  )

  return {
    body: {
      intro: `Congratulations <span style="color: #16a34a; font-weight: 600;">${name}</span>! You have successfully ${status} room ${room}.
      <table style="font-size: 16px; border-collapse: collapse; width: 100%;">
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0 12px 0;">Booking ID</td>
          <td style="padding: 12px 0 12px 0; text-align: right;">${bookingId}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0 12px 0;">Date</td>
          <td style="padding: 12px 0 12px 0; text-align: right;">${date}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0 12px 0;">Time</td>
          <td style="padding: 12px 0 12px 0; text-align: right;">${time}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0 12px 0;">Room</td>
          <td style="padding: 12px 0 12px 0; text-align: right;">${room}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0 12px 0;">Location</td>
          <td style="padding: 12px 0 12px 0; text-align: right;">${location}</td>
        </tr>
      </table>`,
      action: [
        {
          instructions:
            "To add the meeting into your calendar, please click the button below",
          button: {
            text: "Add to Google",
            link: googleCalendar,
          },
        },
        {
          button: {
            text: `Add to Outlook`,
            link: outlookCalendar,
          },
        },
      ],
      outro: `<p>If you have question or need help, please <a style="color: #16a34a;" href="mailto:${emailAdmin}">contact the administrator.</a></p>`,
      signature: false,
      greeting: false,
    },
  }
}

function emailBodyCancel(
  name,
  room,
  bookingId,
  date,
  time,
  location,
  emailAdmin
) {
  return {
    body: {
      intro: `Congratulations <span style="color: #16a34a; font-weight: 600;">${name}</span>! You have successfully cancel your booking in room ${room}.
      <table style="font-size: 16px; border-collapse: collapse; width: 100%;">
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0 12px 0;">Booking ID</td>
          <td style="padding: 12px 0 12px 0; text-align: right;">${bookingId}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0 12px 0;">Date</td>
          <td style="padding: 12px 0 12px 0; text-align: right;">${date}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0 12px 0;">Time</td>
          <td style="padding: 12px 0 12px 0; text-align: right;">${time}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0 12px 0;">Room</td>
          <td style="padding: 12px 0 12px 0; text-align: right;">${room}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 12px 0 12px 0;">Location</td>
          <td style="padding: 12px 0 12px 0; text-align: right;">${location}</td>
        </tr>
      </table>
      <br>`,
      outro: `<p>If you have question or need help, please <a style="color: #16a34a;" href="mailto:${emailAdmin}">contact the administrator.</a></p>`,
      signature: false,
      greeting: false,
    },
  }
}

module.exports = {
  emailBody,
  emailBodyCancel,
}
