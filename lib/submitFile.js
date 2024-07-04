const path = require("path");
const fs = require("fs");
const { SingleBar } = require("cli-progress");
const workDirName = path.join(process.cwd());
const { sftp: sftpConfig } = require(path.join(process.cwd(), "/package.json"));
const { escapePath, getAllFilePath } = require("./utils/tool");
const ManageLog = require("./manageLog");

class SubmitFile {
  constructor(sftp) {
    this.sftp = sftp;
  }
  async submit(submitter, description) {
    const { remotePath, localPath } = sftpConfig;
    const remoteFolderPath = escapePath(path.join(remotePath, localPath));
    const localFolderPath = escapePath(path.join(localPath));
    // 检查文件夹是否存在，存在则删除
    if (await this.sftp.exists(remoteFolderPath)) {
      await this.sftp.deleteFolder(remoteFolderPath);
    }
    await this.sftp.putFolder(localPath, remotePath);
    const pathList = await getAllFilePath(localFolderPath);
    await new ManageLog(this.sftp).addLog(
      submitter,
      description,
      pathList.map((item) => item.path)
    );
  }
}
module.exports = SubmitFile;
