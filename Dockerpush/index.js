"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const tl = require("azure-pipelines-task-lib/task");
const uuid_1 = require("uuid");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            console.log("=============== inital t1 ====================");
            console.log(tl);
            //let failOnStderr = tl.getBoolInput('failOnStderr',false);
            console.log("=================failOnStderr with false arg===============");
            //console.log(failOnStderr);
            let failOnStderr = tl.getBoolInput('failOnStderr', false);
            console.log("=================failOnStderr===============");
            console.log(failOnStderr);
            failOnStderr = false;
            console.log("=================failOnStderr after change ===============");
            console.log(failOnStderr);
            let workingDirectory = tl.getPathInput('Tag2', /*required*/ true, /*check*/ true);
            console.log("=================working directory===============");
            console.log(workingDirectory);
            let dockercmd = tl.getInput("dockercommand", true);
            let acrlogin = tl.getInput("acrloginname", true);
            let acrpass = tl.getInput("acrpassword", true);
            let tag = tl.getInput("Tag", true);
            let tag1 = tl.getInput("Tag1", true);
            let inputarg = `"${acrlogin}" "${acrpass}" "${tag1}" "${dockercmd}"`;
            console.log(inputarg);
            console.log(dockercmd);
            console.log(workingDirectory);
            let imageScript = path.join(path.resolve(__dirname), "image.sh");
            console.log("=============== image script ====================");
            console.log(imageScript);
            // Write the script to disk.
            tl.assertAgent('2.115.0');
            let tempDirectory = tl.getVariable('agent.tempDirectory');
            console.log("=============== temp directory====================");
            console.log(tempDirectory);
            tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
            let filePath = path.join(tempDirectory, uuid_1.v4() + '.sh');
            console.log("============tempdirectory================");
            console.log(tempDirectory);
            console.log("============filepath========");
            console.log(filePath);
            let contents;
            contents = `. '${imageScript.replace("'", "'\\''")}' ${inputarg}`.trim();
            console.log("===========i am print the connent==========================");
            console.log(contents);
            //contents = . '${imageScript.replace(
            //    "'",
            //    "'\\''"
            //)}' ${inputarg}`.trim();
            fs.writeFileSync(filePath, contents, // Don't add a BOM. It causes the script to fail on some operating systems (e.g. on Ubuntu 14).
            { encoding: 'utf8' });
            // Create the tool runner.
            console.log('========================== Starting Command Output ===========================');
            let bash = tl.tool(tl.which('bash', true))
                .arg('--noprofile')
                .arg(`--norc`)
                .arg(filePath);
            console.log("=====printing the bash variable =====");
            console.log(bash);
            let options = {
                cwd: workingDirectory,
                failOnStdErr: false,
                errStream: process.stdout,
                outStream: process.stdout,
                ignoreReturnCode: true
            };
            console.log("=====printing the options =====");
            console.log(options);
            console.log("=====printing the failOnStderr =====");
            console.log(failOnStderr);
            // Listen for stderr.
            let stderrFailure = false;
            if (failOnStderr) {
                bash.on('stderr', data => {
                    stderrFailure = true;
                });
            }
            // Run bash. Place where our script runs 
            let exitCode = yield bash.exec(options);
            console.log("=============== exitCode ====================");
            console.log(exitCode);
            let result = tl.TaskResult.Succeeded;
            console.log("=============== inital t1 ====================");
            console.log(tl);
            // Fail on exit code.
            if (exitCode !== 0) {
                tl.error(tl.loc('JS_ExitCode', exitCode));
                result = tl.TaskResult.Failed;
            }
            // Fail on stderr.
            if (stderrFailure) {
                tl.error(tl.loc('JS_Stderr'));
                result = tl.TaskResult.Failed;
            }
            tl.setResult(result, null, true);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message || 'run() failed', true);
        }
    });
}
run();
