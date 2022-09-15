const {
  Sequelize,
  DataTypes,
  Model
} = nodefony.Sequelize;
const validator = require('validator');
/*
 *    ENTITY events
 */

module.exports = class events extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "events", "sequelize", "nodefony");
    this.orm.on("onOrmReady", (orm) => {
      const calendar = this.orm.getEntity("calendar");
      const user = this.orm.getEntity("user");
      const room = this.orm.getEntity("room");
      if (calendar && user) {
        this.model.belongsTo(calendar, {
          foreignKey: {
            allowNull: false
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });

        this.model.belongsTo(user, {
          foreignKey: {
            allowNull: false,
            name: "creator"
          },
          targetKey: "username",
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        });

        this.model.belongsTo(room, {
          foreignKey: {
            name: "conferenceData",
            allowNull: true
          },
          constraints: false,
          //as:'room'
        })
        /*this.model.belongsTo(room, {
          foreignKey: {
            name: "conferenceData",
            allowNull: true
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        })*/
        room.belongsTo(this.model, {
          foreignKey: {
            name: "eventId",
            allowNull: true
          },
          as:"event",
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        })

        /*this.model.belongsTo(room, {
          foreignKey: {
            allowNull: true,
            name: "conferenceData"
          },
          //as:'room',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        })*/

        /*room.hasOne(this.model, {
          foreignKey: {
            name: "event",
            allowNull: true
          },
          as: 'conferenceData'
        });
        this.model.belongsTo(room, {
          foreignKey: {
            allowNull: true,
            name: "conferenceData"
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        })*/

      } else {
        this.log("ENTITY ASSOCIATION calendar NOT AVAILABLE", "WARNING");
      }
    });
  }

  getSchema() {
    return {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      kind: {
        type: DataTypes.STRING,
        defaultValue: "calendar#event"
      },
      eventType: {
        type: DataTypes.STRING
      },
      summary: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^[\w-_.#\s]+$/,
            msg: `summary allow alphanumeric and ( _ | - | . ) characters`
          }
        }
      },
      htmlLink: {
        type: DataTypes.STRING
      },
      location: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.STRING,
        validate: {
          is: {
            args: /^[\w-_.#\s]+$/,
            msg: `description allow alphanumeric and ( _ | - | . ) characters`
          }
        }
      },
      colorId: {
        type: DataTypes.STRING
      },
      /* confirmed tentative cancelled */
      status: {
        type: DataTypes.STRING
      },
      /*
        "id": string,
        "email": string,
        "displayName": string,
        "self": boolean
      },*/
      organizer: {
        type: DataTypes.JSON,
        allowNull: true
      },
      /*
        "start": {
        "date": "yyyy-mm-dd",
        "dateTime": Timestamps ,
        "timeZone": "Europe/Zurich"}
      */
      start: {
        type: DataTypes.JSON,
        //allowNull: false
      },
      end: {
        type: DataTypes.JSON,
      },
      timezone: {
        type: DataTypes.STRING,
        defaultValue: "Europe/Paris"
      },
      endTimeUnspecified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      iCalUID: {
        type: DataTypes.STRING
      },
      recurrence: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      /* attendees {
           "id": string,
           "email": string,
           "displayName": string,
           "organizer": boolean,
           "self": boolean,
           "resource": boolean,
           "optional": boolean,
           "responseStatus": string,
           "comment": string,
           "additionalGuests": integer
      }*/
      attendees: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      attendeesOmitted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      attachments: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      /*
        "useDefault": boolean,
        "overrides": [
          {
            "method": string,
            "minutes": integer
          }
        ]
      */
      reminders: {
        type: DataTypes.JSON,
        defaultValue: {}
      },
      /* source
        "url": string,
        "title": string
      */
      source: {
        type: DataTypes.JSON,
        defaultValue: {}
      },
      /*
       extendedProperties {
        "private": {
          (key): string
        },
        "shared": {
          (key): string
        }
      },
      */
      extendedProperties: {
        type: DataTypes.JSON,
        defaultValue: {}
      },
      /* default public private confidential */
      visibility: {
        type: DataTypes.STRING,
        defaultValue: "default"
      },
      /*conferenceData: {
        type: DataTypes.JSON,
        allowNull: true
      },*/
      guestsCanInviteOthers: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      guestsCanModify: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }
  }

  registerModel(db) {
    class MyModel extends Model {}
    MyModel.init(this.getSchema(), {
      sequelize: db,
      modelName: this.name,
      hooks: {
        beforeSave: (event) => {
          if (!event.organizer) {
            event.organizer = event.creator
          }
        },
        beforeCreate: (event) => {
          if (!event.end) {
            event.endTimeUnspecified = true
          }
        }
      },
      freezeTableName: true,
      //add indexes
      //indexes: [{
      //  unique: true,
      //  fields: ['creator',"calendarId","id"]
      //}]
    })
    return MyModel;
  }

  log(pci /*, sequelize*/ ) {
    const msgid = "Entity " + this.name;
    return super.log(pci, "DEBUG", msgid);
  }
};
