/**
 *  Firewall Config  service Security
 **/

module.exports = {
  security: {
    /**
     *  FIREWALL strategy
     *  when change security context (usefull with multi firewalls areas)
     *
     *  Strategy can be : none, migrate, invalidate
     */
    session_fixation_strategy: "migrate",
    /**
     *  FIREWALL  PROVIDER
     */
    providers: {
      anonymous: {
        anonymous: {
          provider: "anonymous"
        }
      },
      nodefony: {
        entity: {
          name: "user",
          property: "username"
        }
      }
    },
    encoders: {
      user: {
        algorithm: "bcrypt",
        saltRounds: 13
      }
    },
    /**
     *  FIREWALL  Authorization
     *  Example :
     *    access_control: [{
     *      path: /^\/nodefony/,
     *      roles: ["ROLE_MONITORING"],
     *      requires_channel: "https",
     *      allow_if: {
     *       roles: ["ROLE_ADMIN", "ROLE_USER"]
     *      }
     *    }]
     */
    access_control: [],

    firewalls: {


    }
  }
};
