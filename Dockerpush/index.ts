import fs = require('fs');
import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');
import { v4 as uuidV4 } from 'uuid';

async function run() {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));
        console.log("=============== inital t1 ====================");
        console.log(tl);
        //let failOnStderr = tl.getBoolInput('failOnStderr',false);
        console.log("=================failOnStderr with false arg===============");
        //console.log(failOnStderr);
        let failOnStderr = tl.getBoolInput('failOnStderr',false);
        console.log("=================failOnStderr===============");
        console.log(failOnStderr);
        failOnStderr = false
        console.log("=================failOnStderr after change ===============");
        console.log(failOnStderr);
        let workingDirectory = tl.getPathInput('Tag2', /*required*/ true, /*check*/ true);
        console.log("=================working directory===============");
        console.log(workingDirectory);
        let dockercmd = tl.getInput("dockercommand",true)
        let acrlogin = tl.getInput("acrloginname",true)
        let acrpass = tl.getInput("acrpassword",true)
        let tag = tl.getInput("Tag",true)
        let tag1 = tl.getInput("Tag1",true)
        let inputarg = `"${acrlogin}" "${acrpass}" "${tag1}" "${dockercmd}"`;
        console.log(inputarg);
        console.log(dockercmd);
        console.log(workingDirectory);
        let imageScript = path.join(path.resolve(__dirname),"image.sh");
        console.log("=============== image script ====================");
        console.log(imageScript);

        // Write the script to disk.
        tl.assertAgent('2.115.0');
        let tempDirectory = tl.getVariable('agent.tempDirectory');
        console.log("=============== temp directory====================");
        console.log(tempDirectory);
        tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
        let filePath = path.join(tempDirectory, uuidV4() + '.sh');
        console.log("============tempdirectory================");
        console.log(tempDirectory);
        console.log("============filepath========");
        console.log(filePath);
        let contents: string;
        contents = `. '${imageScript.replace(
            "'",
            "'\\''"
        )}' ${inputarg}`.trim();
        console.log("===========i am print the connent==========================");

        console.log(contents);


        //contents = . '${imageScript.replace(
        //    "'",
        //    "'\\''"
        //)}' ${inputarg}`.trim();
        fs.writeFileSync(
            filePath,
            contents, // Don't add a BOM. It causes the script to fail on some operating systems (e.g. on Ubuntu 14).
            { encoding: 'utf8' });

              // Create the tool runner.
        console.log('========================== Starting Command Output ===========================');
        let bash = tl.tool(tl.which('bash', true))
            .arg('--noprofile')
            .arg(`--norc`)
            .arg(filePath);

            console.log("=====printing the bash variable =====");
 console.log(bash);
        let options: tr.IExecOptions = {
            cwd: workingDirectory,
            failOnStdErr: false,
            errStream: process.stdout, // Direct all output to STDOUT, otherwise the output may appear out
            outStream: process.stdout, // of order since Node buffers it's own STDOUT but not STDERR.
            ignoreReturnCode: true
        };

        console.log("=====printing the options =====");
        console.log(options);

 console.log("=====printing the failOnStderr =====")
 console.log(failOnStderr)
                // Listen for stderr.
                let stderrFailure = false;
                if (failOnStderr) {
                    bash.on('stderr', data => {
                        stderrFailure = true;
                    });
                }
        
        
                // Run bash. Place where our script runs 
                let exitCode: number = await bash.exec(options);
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
            result= tl.TaskResult.Failed;
        }

        tl.setResult(result, null, true);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message || 'run() failed', true);
    }

}
run();