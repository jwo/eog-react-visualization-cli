const { Command, flags } = require("@oclif/command");
const { cli } = require("cli-ux");

const simpleGit = require("simple-git/promise");
const rimraf = require("rimraf");
const ora = require("ora");
const chalk = require("chalk");
const replaceInFile = require("replace-in-file");
const parameterize = require("parameterize");

// URL for the EOG starter kit
const REPO_URL = "https://github.com/jwo/eog-react-visualization-base";

class CreateCommand extends Command {
  async run() {
    const { flags } = this.parse(CreateCommand);
    const userName = flags.name || (await cli.prompt("What's Your Name?"));
    const directory = parameterize(userName);

    // Clone the git repo to local
    const spinner = ora("Clone starter repo").start();
    await simpleGit().clone(REPO_URL, directory);

    // Rename all examples of $APP_NAME in the cloned repository
    spinner.succeed().start("Apply naming to assessment");
    try {
      const replacementOptions = {
        files: `${directory}/**/*`,
        from: /\$USERNAME/g,
        to: userName
      };

      await replaceInFile(replacementOptions);
    } catch (e) {
      this.error(e);
      throw new Error(e);
    }

    // Remove the remote link to the original repository
    spinner.succeed().start("Remove remote link");
    rimraf.sync(`${appName}/.git`);
    await simpleGit(appName).init();
    await simpleGit(appName).raw(["add", "--all", "."]);
    await simpleGit(appName).commit("eog-react initial commit");

    spinner.succeed();
    this.log(
      `\n${chalk.green(
        "SUCCESS"
      )}: Application created and in directory "${directory}"\n`
    );
  }
}

// Add in extra documentation for the help screen
CreateCommand.description = `EOG React Starter Assessment
...
This is a way to initially create your assessment. It wil ask you your name and create you a
local repository to start you off.
`;

CreateCommand.flags = {
  name: flags.string({ char: "n", description: "Your Name" })
};

module.exports = CreateCommand;
