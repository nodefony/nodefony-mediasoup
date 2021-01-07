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
    this.orm.on("onOrmReady", ( orm ) => {
      let User = this.orm.getEntity("user");
      let Room = this.orm.getEntity("room");
      //Room.hasMany(User, {as: 'Users'})
      //User.hasMany(Room, {as:'Rooms'})
      Room.belongsToMany(User, {through: 'UserRoom'});
      User.belongsToMany(Room, {through: 'UserRoom'});
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
        allowNull: true,
        validate: {
          min: {
            args: [[4]],
            msg: `password  allow 4 characters min  `
          }
        }
      },
      secure: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      access:{
        type:   DataTypes.ENUM,
        values: ['private', 'public'],
        defaultValue: 'private'
      },
      sticky_cookie:{
        type: DataTypes.STRING(256),
        allowNull: true
      }
    };
  }

  validPassword(value) {
    let valid = validator.isLength(value, {
      min: 4,
      max: undefined
    });
    if (!valid) {
      throw new nodefony.Error("password must have 4 characters min");
    }
    return value;
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
                return room;
              })
              .catch(err => {
                this.logger(err, "ERROR");
                throw err;
              });
          }
          if( ! room.sticky_cookie){
            room.sticky_cookie = `sticky-room-${room.name}`;
          }
          return room;
        },
        beforeBulkUpdate: (roomUpate) => {
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
