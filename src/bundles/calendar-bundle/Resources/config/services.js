module.exports = {
  Ics: {
    class: nodefony.services.Ics,
    arguments: ["@container"]
  },
  calendar: {
    class: nodefony.services.calendar,
    arguments: ["@container", "@cron"]
  },
  events: {
    class: nodefony.services.events,
    arguments: ["@container", "@calendar"]
  }
};
