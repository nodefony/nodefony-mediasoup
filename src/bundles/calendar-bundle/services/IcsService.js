const ical = require('ical-generator');
const reg = /^(..){1}_?(..)?$/;
const countries = require("i18n-iso-countries");
const moment = require("moment-timezone");

class Ics extends nodefony.Service {

  constructor(container) {
    super("ics", container);
    this.init();
    this.timezones = moment.tz.names();
    this.Alpha2Code = countries.getAlpha2Codes();
    if(this.kernel.ready){
      this.defaultLocale = this.getLocaleDefault()
    }else {
      this.on("onReady", ()=>{
        this.defaultLocale = this.getLocaleDefault()
      })
    }
    this.options = {
      domain: this.kernel.domain,
      prodId: {
        company: this.kernel.package.name,
        product: this.kernel.package.name,
        language:"FR"//this.getLocaleDefaultCountry()
      },
      name: this.kernel.package.name,
      timezone: 'Europe/Paris'
    };
    //this.createTestEvent()
  }

  getLocaleDefault(){
    //let res = this.getLocaleDefaultCountry(this.kernel.settings.system.locale)
    //console.log(res)
    return this.kernel.settings.system.locale
  }

  getLocaleDefaultCountry(locale){
    const res = reg.exec(locale || this.defaultLocale);
    console.log( countries.getName("GB", res[1], {select: "all"}), res[2].toUpperCase(), res[1])
    if( res ){
      if( res[2]){
        return countries.getName(res[2].toUpperCase(), res[1], {select: "all"});
      }
      if( res[1]){
        return countries.getName(res[1].toUpperCase(), null, {select: "all"});
      }
    }
    return null


  }

  getTimeZoneList(){
    return this.timezones;
  }

  init(){
    this.orm = this.kernel.getORM();
    this.calendarEntity = this.orm.getEntity("calendar");
    this.User = this.orm.getEntity("user");
    this.eventsEntity = this.orm.getEntity("events");
  }

  createCalendar(data, options = this.options){
    const calendar = ical(this.options);
    //console.log( calendar.toString() )
    return calendar
  }

  createEvent(event, options){
    const myoptions = nodefony.extend(true,{} ,this.options, options)
    const calendar = this.createCalendar(myoptions);
    /*const myevent = calendar.createEvent({
      start: event.start,
      end: event.end,
      //timestamp: moment(),
      organizer: event.organizer,
      url:`https://${this.kernel.domain}/calendar/events/etag`,
      attendees:
    });*/
    const myevent = calendar.createEvent(event)
    myevent.timestamp = moment().toDate().getTime()
    return JSON.stringify(myevent);
  }

  createTestEvent(options = this.options ) {
    const calendar = this.createCalendar(options);
    // create a new event
    const myevent = calendar.createEvent({
      start: moment(),
      end: moment().add(1, 'hour'),
      timestamp: moment(),
      organizer: this.kernel.package.author,
      url:`https://${this.kernel.domain}/calendar/events/etag`
    });

    // like above, you can also set/change values like this…
    myevent.summary('My Super Mega Awesome Event');

    // get the iCal string
    console.log( calendar.toString())
    const json = JSON.stringify(calendar);
    //console.log(json)
  }
};

module.exports = Ics;
