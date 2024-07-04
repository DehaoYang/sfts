#! /usr/bin/env node
const { program } = require("commander");
const package = require("../package.json");
const submitCommand = require("../commands/submit");
const logCommand = require("../commands/log");
program.version(package.version);
program.addCommand(submitCommand);
program.addCommand(logCommand);
program.parse(process.argv);
