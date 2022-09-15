const {
  Sequelize,
  DataTypes,
  Model
} = nodefony.Sequelize;
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
      const User = this.orm.getEntity("user");
      const Room = this.orm.getEntity("room");
      const Event = this.orm.getEntity("events");
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
            args: /^[\w-_.#\s]+$/,
            msg: `Name allow alphanumeric and ( _ | - | . | #) characters`
          }
        }
      },
      locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
            args: /^[\w-_.#\s]+$/,
            msg: `Description allow alphanumeric and ( _ | - | . ) characters`
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

  registerModel(db) {
    class MyModel extends Model {}
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
          if (!room.sticky_cookie) {
            room.sticky_cookie = `sticky-room-${room.name}`;
          }
        },
        beforeBulkUpdate: (roomUpate) => {
          if (("password" in roomUpate.attributes) && roomUpate.attributes.secure) {
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
    return super.logger(pci, "DEBUG", msgid);
  }
}

module.exports = roomEntity;
