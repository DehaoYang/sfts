const path = require("path");
const SftpService = require("../lib/utils/sftp");
const ManageLog = require("../lib/manageLog");
const { sftp: sftpConfig } = require(path.join(process.cwd(), "/package.json"));
const sftp = SftpService.getInstance(sftpConfig);
const fn = async () => {
  let list = [];
  await sftp.connect();
  const manageLog = new ManageLog(sftp);
  list = await manageLog.getLogList();
  list.forEach((item) => {
    console.log(item.name);
  });
  const data = await manageLog.getLogContent("20240415100250_ydh.log");
  console.log(data.toString());
  await sftp.disconnect();
};
fn();
