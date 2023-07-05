const { DateTime } = require("luxon")

const googleCalendarGenerator = (start, end, location, title) => {
  start = DateTime.fromISO(start).toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")
  end = DateTime.fromISO(end).toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")
  title = title.replace(/ /g, "%20")
  location = location.replace(/ /g, "%20")
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${start}%2F${end}&details=&location=${location}&text=${title}`
}

const outlookCalendarGenerator = (start, end, location, title) => {
  start = DateTime.fromISO(start).toUTC().toISO({ suppressMilliseconds: true }).replace(/:/g, "%3A").replace(/Z/g, "%2B00%3A00")
  end = DateTime.fromISO(end).toUTC().toISO({ suppressMilliseconds: true }).replace(/:/g, "%3A").replace(/Z/g, "%2B00%3A00")
  title = title.replace(/ /g, "%20")
  location = location.replace(/ /g, "%20")
  return `https://outlook.live.com/calendar/0/deeplink/compose?allday=false&body=&enddt=${end}&location=${location}&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&startdt=${start}&subject=${title}`
}

module.exports = {
  googleCalendarGenerator,
  outlookCalendarGenerator,
}
