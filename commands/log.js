const path = require("path");
const SftpService = require("../lib/utils/sftp");
const ManageLog = require("../lib/manageLog");
const { sftp: sftpConfig } = require(path.join(process.cwd(), "/package.json"));
const { Command } = require("commander");
const dayjs = require("dayjs");
const logCommand = new Command("log")
  .argument("[name]", "log name")
  .description("submit file to SFTP")
  .action(async (name) => {
    const sftp = SftpService.getInstance(sftpConfig);
    await sftp.connect();
    const manageLog = new ManageLog(sftp);
    if (name) {
      const data = await manageLog.getLogContent(name);
      console.log(`========== ${name} ==========`);
      console.log(data.toString());
      console.log(`========== end ==========`);
    } else {
      const list = await manageLog.getLogList();
      list
        .sort((a, b) => b.modifyTime - a.modifyTime)
        .forEach((item) => {
          console.log(
            item.name +
              "  " +
              dayjs(item.modifyTime).format(`YYYY-MM-DD HH:mm:ss`)
          );
        });
    }
    await sftp.disconnect();
  });
module.exports = logCommand;
