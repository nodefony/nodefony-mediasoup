const broadcastTask = require(path.resolve(__dirname, "broadcastTask.js"));
class ffmpegCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("ffmpeg", cli, bundle);
    this.setTask("broadcast", broadcastTask);
  }


}
module.exports = ffmpegCommand;
