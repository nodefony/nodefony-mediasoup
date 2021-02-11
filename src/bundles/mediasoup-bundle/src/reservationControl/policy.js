class AutomaticPolicy {
  control(currentControl, client) {
    if (!currentControl) {
      return client;
    }
    return currentControl;
  }

  lost(currentControl) {
    return null;
  }
};

exports.AutomaticPolicy = AutomaticPolicy;