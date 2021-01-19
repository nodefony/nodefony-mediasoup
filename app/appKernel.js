/*
 *  ENTRY POINT FRAMEWORK APP KERNEL
 */
"use strict;";
class appKernel extends nodefony.kernel {
  constructor(environment, cli, settings) {
    // kernel constructor
    super(environment, cli, settings);
    this.on('onTerminate', async () => {
      let hot = path.resolve(this.appPath, "Resources", "public", "hot");
      try{
        const dir = new nodefony.File(hot);
        if(dir){
          await this.cli.rm('-rf', hot);
          this.log(`Delete HMR Directory files`);
        }
      }catch(e){
        return ;
      }
    });
  }
}

module.exports = appKernel;
