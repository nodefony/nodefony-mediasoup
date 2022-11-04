const {
  Sequelize,
  DataTypes,
  Model
} = nodefony.Sequelize;
const validator = require('validator');

/*
 *    ENTITY calendar
 */

module.exports = class calendar extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "calendar", "sequelize", "nodefony");
    this.orm.on("onOrmReady", (orm) => {
      try{
        let user = this.orm.getEntity("user");
        if (user) {
          this.model.belongsTo(user, {
            foreignKey: {
              allowNull: false,
              name:"creator"
            },
            targetKey:"username",
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          });
        } else {
          this.log("ENTITY ASSOCIATION user NOT AVAILABLE", "WARNING");
        }
      }catch(e){
        this.log(e,"ERROR")
        throw e
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
      primary:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      hidden:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      deleted:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      etag: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true
      },
      kind: {
        type: DataTypes.STRING,
        defaultValue: "calendar#calendar"
      },
      summary: {
        type: DataTypes.STRING,
        allowNull: false
      },
      location: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.STRING
      },
      timeZone: {
        type: DataTypes.STRING
      },
      /*
        MEETING  , BROADCAST
      */
      conferenceProperties: {
        type: DataTypes.JSON,
        defaultValue: JSON.stringify({allowedConferenceSolutionTypes:["MEETING"]})
      },
      defaultReminders:{
        type: DataTypes.JSON,
        defaultValue:JSON.stringify([])
      }
    };
  }

  registerModel(db) {
    class MyModel extends Model {}
    MyModel.init(this.getSchema(), {
      sequelize: db,
      modelName: this.name,
      hooks: {},
      freezeTableName: true,
      //add indexes
      /*indexes: [{
        unique: true,
        fields: ["id",'creator']
      }]*/
    })
    return MyModel;
  }

  log(pci /*, sequelize*/ ) {
    const msgid = "Entity " + this.name;
    return super.log(pci, "DEBUG", msgid);
  }
};
