const minutesToAdd = 30;
const onMonth = 30 * 24 * 60;
//const currentDate = new Date();
const moment = require('moment-timezone');
const tz = moment.tz;
const currentDate = moment(new Date());

const addTodate = function (minutesToAdd) {
  return moment(currentDate.valueOf() + minutesToAdd * 60000);
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
const timezone = ["Europe/paris", "America/New_York", "Asia/Dubai"]
const creators = ["admin", "1000", "2000", "3000"]
const calendars = [1, 2, 3];
const attendees = ["admin@nodefony.com", "1000@nodefony.com", null, "2000@nodefony.com"]
const location = ["Paris", "Marseille", "Londres"]
const eventCount = 1000


const icsService = kernel.get("Ics")

const generateEvent = function (start = currentDate, end = addTodate(onMonth * 4)) {
  const events = [];
  const min = start.valueOf()
  const max = end.valueOf()
  const days = (max - min) / 86400000
  //const eventCount = 500 //rnd(days, days + 20)
  for (let i = 0; i < eventCount; i++) {
    const timed = rnd(0, 3) !== 0
    const firstTimestamp = rnd(min, max)
    const secondTimestamp = rnd(2, timed ? 8 : 288) * 900000
    let startDate = moment(firstTimestamp - (firstTimestamp % 900000))
    let endDate = moment(startDate + secondTimestamp)
    let myTZ = `${rndElement(timezone)}`
    //start = tz(start, myTZ) //.toISOString()
    //end = tz(end, myTZ)//.toISOString()
    let start = {
      date: startDate.format("YYYY-MM-DD"),
      dateTime: startDate.valueOf(),
      timeZone: myTZ,
      iso: tz(startDate, myTZ).toISOString()
    }
    let end = null
    //let endTime= false
    if (i % 5) {
      end = {
        date: endDate.format("YYYY-MM-DD"),
        dateTime: endDate.valueOf(),
        timeZone: myTZ,
        iso: tz(endDate, myTZ).toISOString()
      }
    }
    //console.log(start, end)
    //console.log(start, end, myTZ)
    let event = {
      calendarId: `${rndElement(calendars)}`,
      creator: `${rndElement(creators)}`,
      kind: "#calendar/events",
      summary: `${rndElement(names)} #${i}`,
      location: `${rndElement(location)}`,
      description: `mediasoup calendar #${i}`,
      timezone: myTZ,
      colorId: `${rndElement(colors)}`,
      start: start,
      end: end,
      attendees: rndElementTab(attendees)
      //endTimeUnspecified:endTime
    }
    event.iCalUID = icsService.createEvent(event);
    events.push(event)
  }
  //console.log(events)
  return events
}

//const defaultFixtures = generateEvent()

module.exports.default = generateEvent;
