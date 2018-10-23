const { Command, flags } = require('@oclif/command');
const { cli } = require('cli-ux');
const gitClone = require('git-clone');
const replaceInFile = require('replace-in-file');
const promisify = require("es6-promisify").promisify;

const promisedClone = promisify(gitClone);

// URL for the EOG starter kit
const REPO_URL = 'https://github.com/smiles21/starter-kit';

class CreateCommand extends Command {
  async run() {
    const { flags } = this.parse(CreateCommand);

    // Use the given application name or prompt the user for one. 
    const appName = flags.name || await cli.prompt('App name');

    // Clone the github repo
    await promisedClone(REPO_URL, appName);

    // Go through the starter kit code and change $APP_NAME to the appName
    try {
      const replacementOptions = {
        files: `${appName}/**/*`,
        from: /\$APP_NAME/g,
        to: appName,
      };

      await replaceInFile(replacementOptions);
    } catch (e) {
      this.error(e);
    }

    this.log(`application created and named ${appName}`);
  }
}

// Add in extra documentation for the help screen
CreateCommand.description = `Clone the EOG starter kit and rename it to given app name 
...
This is a way to initially create your application.  It will set up boilerplate
code for your project using the EOG react starter kit, found at
https://git.eogresources.com/eog/eog-react-starter-kit.
`;

CreateCommand.flags = {
  name: flags.string({char: 'n', description: 'Application name'}),
};

module.exports = CreateCommand;
