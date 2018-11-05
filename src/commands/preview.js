const { Command, flags } = require("@oclif/command");
const { cli } = require("cli-ux");

const simpleGit = require("simple-git/promise");
const rimraf = require("rimraf");
const ora = require("ora");
const chalk = require("chalk");
const replaceInFile = require("replace-in-file");
const parameterize = require("parameterize");
const tmp = require("tmp");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const { spawn } = require("child_process");

class PreviewCommand extends Command {
  async run() {
    const { flags } = this.parse(PreviewCommand);
    const repo =
      flags.repo || (await cli.prompt("What is the link to the Repo"));
    const tmpobj = tmp.dirSync();

    const directory = tmpobj.name;
    const spinner = ora("Clone starter repo").start();
    const editor = process.env.EDITOR;

    await simpleGit().clone(repo, directory);
    spinner.succeed(`project cloned to: ${directory}`);
    spinner.start(`opening editor using ${editor}`);
    await exec(`${editor} ${directory}`);
    spinner.succeed();
    spinner.start("yarn installing");
    process.chdir(directory);
    await exec(`yarn install`);
    spinner.succeed();
    this.log("Opening via yarn start");
    const child = spawn("yarn", ["start"]);
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", chunk => {
      // data from standard output is here as buffers
      this.log(chunk);
    });
  }
}

// Add in extra documentation for the help screen
PreviewCommand.description = `Preview
...
A way to preview your assessment. Will clone, install and run.
`;

PreviewCommand.flags = {
  repo: flags.string({ char: "r", description: "GitHub Repo URL" })
};

module.exports = PreviewCommand;
