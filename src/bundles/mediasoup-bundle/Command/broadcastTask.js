class broadcastTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.bundle = command.bundle;
  }

  showHelp() {
    this.setHelp("ffmpeg:broadcast:file",
      "ffmpeg  nodefony ffmpeg:broadcast:file ./video.mp4 "
    );
    super.showHelp();
  }

  file(args = null) {
    return new Promise(async (resolve, reject) => {
      try {
        this.log(args);
        return resolve(true);
      } catch (error) {
        this.logger(error, "ERROR");
        return reject(error);
      }
    });
  }
}

module.exports = broadcastTask;
