const path = require("path");
const SubmitFile = require("../lib/submitFile");
const inquirer = require("inquirer");
const { Command } = require("commander");
const SftpService = require("../lib/utils/sftp");
const { sftp: sftpConfig } = require(path.join(process.cwd(), "/package.json"));
const imputOptions = async (submitterDefault, descriptionDefault) => {
  return await inquirer.prompt([
    {
      type: "input",
      name: "submitter",
      message: "Enter submiter name",
      default: submitterDefault,
      validate: function (value) {
        return !!value || "Please enter your name";
      },
    },
    {
      type: "input",
      name: "description",
      message: "Enter description: ",
      default: descriptionDefault,
      validate: function (value) {
        return !!value || "Please enter description";
      },
    },
  ]);
};
const submitCommand = new Command("submit")
  .description("submit file to SFTP")
  .option("-s, --submitter <submitter>", "submitter name")
  .option("-d, --description <description>")
  .action(async (options) => {
    const { submitter: submitterDefault, description: descriptionDefault } =
      options;
    let submitter = "";
    let description = "";
    if (!submitterDefault || !descriptionDefault) {
      ({ submitter, description } = await imputOptions(
        submitterDefault,
        descriptionDefault
      ));
    } else {
      submitter = submitterDefault;
      description = descriptionDefault;
    }
    const sftp = SftpService.getInstance(sftpConfig);
    await sftp.connect();
    const submitFile = new SubmitFile(sftp);
    await submitFile.submit(submitter, description);
    await sftp.disconnect();
  });
module.exports = submitCommand;
