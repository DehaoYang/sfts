const fs = require("fs");
const path = require("path");
const Client = require("ssh2-sftp-client");
const workDirName = path.join(process.cwd());
const { escapePath, getAllFilePath } = require("./tool");
class SftpService extends Client {
  constructor(config) {
    super();
    this.config = config;
    this.isConnected = false;
  }

  connect() {
    if (this.isConnected) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      super
        .connect(this.config)
        .then(() => {
          this.isConnected = true;
          console.log("Connected to SFTP server");
          resolve();
        })
        .catch((error) => {
          console.error("Failed to connect to SFTP server:", error);
          reject(error);
        });
    });
  }

  disconnect() {
    if (!this.isConnected) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      super
        .end()
        .then(() => {
          this.isConnected = false;
          console.log("Disconnected from SFTP server");
          resolve();
        })
        .catch((error) => {
          console.error("Failed to disconnect from SFTP server:", error);
          reject(error);
        });
    });
  }
  async putFile(localPath, remotePath) {
    return new Promise((resolve, reject) => {
      const localFileData = fs.createReadStream(
        path.join(workDirName, localPath)
      );
      super
        .put(localFileData, remotePath)
        .then(() => {
          console.log(`Success: ${localPath} -> ${remotePath}`);
          resolve();
        })
        .catch((error) => {
          console.error(`Failed: ${localPath} -> ${remotePath}`);
          console.log(error);
          reject(error);
        });
    });
  }
  async putFolder(localPath, remotePath) {
    const localFolderPath = escapePath(path.join(workDirName, localPath)); // 本地文件夹路径
    const remoteFolderPath = escapePath(path.join(remotePath, localPath)); // 远程文件夹路径
    await super.mkdir(remoteFolderPath, true);
    const files = await fs.promises.readdir(localFolderPath);
    for (const file of files) {
      const relativePath = escapePath(path.join(localPath, file));
      const localFilePath = escapePath(path.join(localFolderPath, file)); // 远程文件路径
      const remoteFilePath = escapePath(path.join(remoteFolderPath, file)); // 远程文件路径
      const stat = await fs.promises.stat(localFilePath);
      if (stat.isDirectory()) {
        await this.putFolder(relativePath, remotePath);
      } else {
        await this.putFile(relativePath, remoteFilePath);
      }
    }
  }
  async deleteFile(remotePath) {
    return new Promise((resolve, reject) => {
      super
        .delete(remotePath)
        .then(() => {
          console.log(`Delete: ${remotePath}`);
          resolve();
        })
        .catch((error) => {
          console.log("Delete error", error);
          reject(error);
        });
    });
  }
  async deleteFolder(remotePath) {
    const files = await super.list(remotePath);
    for (const file of files) {
      const filePath = escapePath(path.join(remotePath, file.name));
      if (file.type === "d") {
        await this.deleteFolder(filePath);
      } else {
        await this.deleteFile(filePath);
      }
    }
    await super.rmdir(remotePath);
  }
  static getInstance(config) {
    if (!SftpService.instance) {
      SftpService.instance = new SftpService(config);
    }
    return SftpService.instance;
  }
}

SftpService.instance = null; // 初始化时设置实例为null
module.exports = SftpService;
