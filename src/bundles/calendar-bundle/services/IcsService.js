const ical = require('ical-generator');

const moment = require("moment-timezone");

class Ics extends nodefony.Service {

  constructor(container) {
    super("ics", container);
    this.timezones = moment.tz.names();
    const options = {
      domain: 'nodefony.com',
      prodId: {
        company: 'nodefony',
        product: 'nodefony-mediasoup'
      },
      name: 'nodefony-mediasoup',
      timezone: 'Europe/Paris'
    };
    this.ical = ical(options);
    this.createEvent()

  }


  createEvent() {
    // create a new event
    const event = this.ical.createEvent({
      start: moment(),
      end: moment().add(1, 'hour'),
      timestamp: moment(),
      summary: 'My Event',
      organizer: 'christophe camensuli <mail@example.com>'
    });

    // like above, you can also set/change values like this…
    event.summary('My Super Mega Awesome Event');

    // get the iCal string
    console.log( this.ical.toString())
    const json = JSON.stringify(this.ical);
    console.log(json)
  }
};

module.exports = Ics;
