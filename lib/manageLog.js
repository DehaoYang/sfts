const path = require("path");
const fs = require("fs");
const { escapePath, createTempFile } = require("./utils/tool");
const workDirName = path.join(process.cwd());
const config = require(path.join(workDirName, "/package.json"));
const dayjs = require("dayjs");
const SftpClient = require("ssh2-sftp-client");

class ManageLog {
  constructor(sftp) {
    this.sftp = sftp;
    this.folderName = "log";
  }
  //初始化log文件夹
  async initLog() {
    const { remotePath } = config.sftp;
    const remoteFilePath = escapePath(path.join(remotePath, this.folderName));
    await this.sftp.mkdir(remoteFilePath, true);
  }
  //添加日志文件
  async addLog(submitter, description, pathList) {
    const { remotePath, localPath } = config.sftp;
    const time = dayjs().format(`YYYYMMDDHHmmss`);
    const fileName = this.createFileName(time, submitter);
    const fileList = this.createFileNameList(pathList);
    await this.initLog();
    const content = this.createLogContent(
      time,
      submitter,
      description,
      fileList
    );
    const remoteFilePath = escapePath(
      path.join(remotePath, this.folderName, fileName)
    );
    const streamFilePath = await createTempFile(fileName, content);
    const localFileData = fs.createReadStream(streamFilePath);
    await this.sftp.put(localFileData, remoteFilePath);
  }
  // 创建文件名
  createFileName(time, submitter) {
    return `${time}_${submitter}.log`;
  }
  // 创建日志内容
  createLogContent(time, submitter, description, fileList) {
    return `time:${time}\nsubmitter：${submitter}\ndescription：${description}\n${fileList}`;
  }
  // 创建文件列表文本
  createFileNameList(fileList) {
    return fileList
      .map((path) => {
        return path + "\n";
      })
      .join("");
  }
  //获取日志文件列表
  async getLogList() {
    try {
      await this.sftp.connect(config.sftp);
      const { remotePath } = config.sftp;
      return await this.sftp.list(
        escapePath(path.join(remotePath, this.folderName))
      );
    } catch (error) {
      console.log(error);
    }
  }
  //获取日志文件内容
  async getLogContent(fileName) {
    try {
      await this.sftp.connect(config.sftp);
      const { remotePath } = config.sftp;
      return await this.sftp.get(
        escapePath(path.join(remotePath, "log", fileName))
      );
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = ManageLog;
