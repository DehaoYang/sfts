# sfts

Submit files to sftp using commands

通过命令提交文件到sftp并自动生成提交日志

## Documentation

安装

```shell
npm install @zhweb/sfts --save-dev
yarn add @zhweb/sfts --save-dev
```

配置

在工作目录的package.json中进行如下配置

```json
{
    ...otherConfig,
    "sftp": {
    	"host": "sftp host",
    	"port": sftp port(default:22),
    	"username": "link name",
    	"password": "link password",
    	"remotePath": "web path", //远程路径
    	"localPath": "localPath" //需要上传的文件夹的路径
  	}
}
```

命令

submit: 提交文件

| name        | options                         | description |
| ----------- | ------------------------------- | ----------- |
| submitter   | -s/--submitter <submitter>      | 提交者      |
| description | -d/ --description <description> | 提交描述    |

```shell
sfts submit -s yourName -d first-submit
```

tip:若命令中未带有"submitter"或"description",在提交时需要填写相关信息否则无法提交



log:查看提交日志

| name          | options | description      |
| ------------- | ------- | ---------------- |
| -             | -       | 查看所有日志文件 |
| [logFileName] | -       | 查看日志具体内容 |

```shell
sfts log
sfts log [logFileName]
```

