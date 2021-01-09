const {
  Sequelize,
  DataTypes,
  Model
} = require("sequelize");
const validator = require('validator');
/*
 *
 *
 *    ENTITY USER
 *
 *
 */
class roomEntity extends nodefony.Entity {
  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "room", "sequelize", "nodefony");
    this.orm.on("onOrmReady", (orm) => {
      let User = this.orm.getEntity("user");
      let Room = this.orm.getEntity("room");
      Room.belongsToMany(User, {
        through: 'UserRoom'
      });
      User.belongsToMany(Room, {
        through: 'UserRoom'
      });
    });
  }

  getSchema() {
    return {
      name: {
        type: DataTypes.STRING(126),
        primaryKey: true,
        unique: true,
        allowNull: false,
        validate: {
          is: {
            args: /[^\w]|_|-|./g,
            msg: `name allow alphanumeric and ( _ | - | . ) characters`
          }
        }
      },
      type: {
        type: DataTypes.ENUM,
        values: ['WEBRTC'],
        defaultValue: "WEBRTC",
        allowNull: false,
        validate: {
          is: {
            args: /^WEBRTC$/g,
            msg: `description allow WEBRTC`
          }
        }
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: {
            args: /[^\w]|_|-|.|''/g,
            msg: `description allow alphanumeric characters`
          }
        }
      },
      password: {
        type: DataTypes.STRING(256),
        allowNull: true
      },
      secure: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      access: {
        type: DataTypes.ENUM,
        values: ['private', 'public'],
        defaultValue: 'private'
      },
      waitingconnect: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      sticky_cookie: {
        type: DataTypes.STRING(256),
        allowNull: true
      }
    };
  }

  validPassword(value) {
    if (!value) {
      return false;
    }
    let valid = validator.isLength(value, {
      min: 8,
      max: undefined
    });
    if (!valid) {
      throw new nodefony.Error("password must have 8 characters min");
    }
    return true;
  }

  updateRoomBeforeSave(roomUpdate) {
    /*if (!room.sticky_cookie){
      room.sticky_cookie = `sticky-room-${room.name}`;
    }

    if (room.secure) {
      if (!this.validPassword(room.password)) {
        room.password = room.password_pure;
        return room;
      }
      return this.encode(room.password)
        .then(hash => {
          room.password = hash;
          return room;
        })
        .catch(err => {
          this.logger(err, "ERROR");
          throw err;
        });
    }
    return room;*/
  }

  registerModel(db) {
    class MyModel extends Model {}
    let self = this;
    MyModel.init(this.getSchema(), {
      sequelize: db,
      modelName: this.name,
      hooks: {
        beforeCreate: (room) => {
          if (room.secure) {
            this.validPassword(room.password);
            return this.encode(room.password)
              .then(hash => {
                room.password = hash;
              })
              .catch(err => {
                this.logger(err, "ERROR");
                throw err;
              });
          }
        },
        beforeValidate(room, options) {
          //return self.updateRoomBeforeSave(room);
        },
        beforeBulkUpdate: (roomUpate) => {
          this.log(roomUpate);
          if ("password" in roomUpate.attributes) {
            if (roomUpate.secure) {
              this.validPassword(roomUpate.attributes.password);
              return this.encode(roomUpate.attributes.password)
                .then(hash => {
                  roomUpate.attributes.password = hash;
                })
                .catch(err => {
                  this.logger(err, "ERROR");
                  throw err;
                });
            }
          }
        }
      },
      freezeTableName: true,
      //add indexes
      //indexes: [{}]
      // add custom validations
      //validate: {}
    });
    return MyModel;
  }

  logger(pci /*, sequelize*/ ) {
    const msgid = "Entity " + this.name;
    return super.log(pci, "DEBUG", msgid);
  }
}

module.exports = roomEntity;
