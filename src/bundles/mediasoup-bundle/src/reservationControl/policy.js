class AutomaticPolicy {
  control(currentControl, client) {
    if (!currentControl) {
      return client;
    }
    return currentControl;
  }

  allowed(client) {
    return true;
  }

  lost(currentControl) {
    return null;
  }
};

class AdminAutomaticPolicy {
  constructor() {
    this.autoPolicy = new AutomaticPolicy();
  }

  control(currentControl, client) {
    if (this.allowed(client)) {
      return this.autoPolicy.control(currentControl, client);
    }
    return currentControl;
  }

  allowed(client) {
    return !client || client && client.admin;
  }

  lost(currentControl) {
    return null;
  }
};

exports.AutomaticPolicy = AutomaticPolicy;
exports.AdminAutomaticPolicy = AdminAutomaticPolicy;
