const { Command, flags } = require('@oclif/command');
const { cli } = require('cli-ux');

const simpleGit = require('simple-git/promise');
const ora = require('ora');
const chalk = require('chalk');
const replaceInFile = require('replace-in-file');

// URL for the EOG starter kit
const REPO_URL = 'https://github.com/smiles21/starter-kit';

class CreateCommand extends Command {
  async run() {
    const { flags } = this.parse(CreateCommand);
    const appName = flags.name || await cli.prompt('App name');

    // Clone the git repo to local
    const spinner = ora('Clone starter repo').start();
    await simpleGit().clone(REPO_URL, appName, ['--depth', '1']);

    // Rename all examples of $APP_NAME in the cloned repository
    spinner.succeed().start('Apply naming to repo');
    try {
      const replacementOptions = {
        files: `${appName}/**/*`,
        from: /\$APP_NAME/g,
        to: appName,
      };

      await replaceInFile(replacementOptions);
    } catch (e) {
      this.error(e);
      throw new Error(e);
    }
    
    // Remove the remote link to the original repository
    spinner.succeed().start('Remove remote link');
    simpleGit(appName).removeRemote('origin');
    
    spinner.succeed();
    this.log(`\n${chalk.green('SUCCESS')}: Application created and in directory "${appName}"\n`);
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
