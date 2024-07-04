const os = require("os");
const fs = require("fs");
const path = require("path");
// node不支持window反斜杠，需要替换成正斜杠
const escapePath = (path) => {
  return path.replace(/\\/g, "/");
};
// 创建临时文件
const createTempFile = (fileName, content) => {
  return new Promise((resolve) => {
    const tempDir = os.tmpdir();
    const streamFilePath = escapePath(path.join(tempDir, fileName));
    const writeStream = fs.createWriteStream(streamFilePath);
    writeStream.write(content);
    writeStream.end();
    writeStream.on("finish", () => {
      resolve(streamFilePath);
    });
  });
};
// 返回所有文件的路径(相对于工作目录)
const getAllFilePath = async (localPath) => {
  const pathList = [];
  pathList.push({ path: localPath, type: "folder" });
  const dirPath = path.join(process.cwd(), localPath);
  const files = await fs.promises.readdir(dirPath);
  for (const file of files) {
    const filePath = path.join(localPath, file);
    const stat = await fs.promises.stat(filePath);
    if (stat.isFile()) {
      pathList.push({ path: filePath, type: "file" });
    } else {
      pathList.push(...(await getAllFilePath(filePath)));
    }
  }
  return pathList;
};
module.exports = {
  escapePath,
  createTempFile,
  getAllFilePath,
};
