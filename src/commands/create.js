const { Command, flags } = require("@oclif/command");
const { cli } = require("cli-ux");

const simpleGit = require("simple-git/promise");
const rimraf = require("rimraf");
const ora = require("ora");
const chalk = require("chalk");
const replaceInFile = require("replace-in-file");
const parameterize = require("parameterize");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const generateTokenBuffer = util.promisify(require("crypto").randomBytes);

// URL for the EOG starter kit
const REPO_URL = "https://github.com/jwo/eog-react-visualization-base";

class CreateCommand extends Command {
  async run() {
    const { flags } = this.parse(CreateCommand);
    const userName = flags.name || (await cli.prompt("What's Your Name?"));
    const directory = [parameterize(userName), "eog-react-assessment"].join(
      "-"
    );

    // Clone the git repo to local
    const spinner = ora("Clone starter repo").start();
    await simpleGit().clone(REPO_URL, directory);

    // Rename all examples of $APP_NAME in the cloned repository
    spinner.succeed().start("Apply naming to assessment");
    try {
      const replacementOptions = {
        files: [
          `${directory}/**/*`,
          `${directory}/.eog.json`,
          `${directory}/README.md`
        ],
        from: /\$USERNAME/g,
        to: userName
      };

      await replaceInFile(replacementOptions);
    } catch (e) {
      this.error(e);
      throw new Error(e);
    }

    try {
      const replacementOptions = {
        files: `${directory}/.eog.json`,
        from: /\$DATECREATED/g,
        to: new Date().getTime().toString()
      };
      await replaceInFile(replacementOptions);
    } catch (e) {
      this.error(e);
      throw new Error(e);
    }

    try {
      const tokenBuffer = await generateTokenBuffer(24);
      const token = tokenBuffer.toString("hex");

      const replacementOptions = {
        files: `${directory}/.eog.json`,
        from: /\$TOKEN/g,
        to: token
      };
      await replaceInFile(replacementOptions);
    } catch (e) {
      this.error(e);
      throw new Error(e);
    }

    // Remove the remote link to the original repository
    spinner.succeed().start("Remove remote link");
    rimraf.sync(`${directory}/.git`);
    await simpleGit(directory).init();
    await simpleGit(directory).raw(["add", "--all", "."]);
    await simpleGit(directory).commit("eog-react initial commit");

    spinner.start("yarn installing");
    process.chdir(directory);
    await exec(`yarn install`);

    spinner.succeed();
    this.log(
      `\n${chalk.green(
        "SUCCESS"
      )}: React App created and in directory "${directory}"`
    );
    this.log(
      `\n${chalk.green(
        "SUCCESS"
      )}: You'll want to yarn install and then yarn start the react app.`
    );

    this.log(`\n${chalk.green("SUCCESS")}: Good luck!`);
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
