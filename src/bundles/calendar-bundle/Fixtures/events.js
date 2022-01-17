const minutesToAdd = 30;
const onMonth = 30 * 24 * 60;
const currentDate = new Date();

const addTodate = function (minutesToAdd) {
  return new Date(currentDate.getTime() + minutesToAdd * 60000);
}

const toTime = function (tms) {
  return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime()
}
const rnd = function (a, b) {
  return Math.floor((b - a + 1) * Math.random()) + a
}
const rndElement = function (arr) {
  return arr[rnd(0, arr.length - 1)]
}

const rndElementTab = function (arr, tab = []) {
  let ele = arr[rnd(0, arr.length - 1)]
  if (ele) {
    tab.push(ele)
  }
  return tab
}

const colors = ['#2196F3', '#3F51B5', '#673AB7', '#00BCD4', '#4CAF50', '#FF9800', '#757575'];
const names = ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'];
const timezone = ["Europe/paris", "Europe/zurick"]
const creators = ["admin", "1000", "2000", "3000"]
const calendars = [1, 2, 3];
const attendees = ["admin@nodefony.com", "1000@nodefony.com", null, "2000@nodefony.com"]
const location = ["Paris", "Marseille", "Londres"]


const icsService = kernel.get("Ics")

const generateEvent = function (start = currentDate.toISOString(), end = addTodate(onMonth * 4).toISOString()) {
  const events = [];
  const min = new Date(`${start}`).getTime()
  const max = new Date(`${end}`).getTime()
  const days = (max - min) / 86400000
  const eventCount = 500 //rnd(days, days + 20)
  for (let i = 0; i < eventCount; i++) {
    const timed = rnd(0, 3) !== 0
    const firstTimestamp = rnd(min, max)
    const secondTimestamp = rnd(2, timed ? 8 : 288) * 900000
    const start = firstTimestamp - (firstTimestamp % 900000)
    const end = start + secondTimestamp
    let myTZ = `${rndElement(timezone)}`
    let event = {
      calendarId: `${rndElement(calendars)}`,
      creator: `${rndElement(creators)}`,
      kind: "#calendar/events",
      summary: `${rndElement(names)} #${i}`,
      location: `${rndElement(location)}`,
      description: `mediasoup calendar #${i}`,
      timezone: myTZ,
      colorId: `${rndElement(colors)}`,
      start: new Date(start),
      end: new Date(end),
      attendees: rndElementTab(attendees)
    }
    event.iCalUID = icsService.createEvent(event);
    events.push(event)
  }
  //console.log(events)
  return events
}

const defaultFixtures = generateEvent()

module.exports.default = defaultFixtures;
