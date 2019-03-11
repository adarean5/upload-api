const fs = require('fs');
const child_process = require('child_process');

console.log('Spawning child processes using the exec method');
for (let i = 0; i < 3; i++) {
  const workerProcess = child_process.exec(
    'node support.js ' + i,
    (error, stdout, stderr) => {
      if (error) {
        console.log(error.stack);
        console.log('Error code:' + error.code);
        console.log('Signal recieved:' + error.signal);
      }
      console.log('stdout:' + stdout);
      console.log('stderr:' + stderr);
    }
  );

  workerProcess.on('exit', function(code) {
    console.log('Child process exited with exit code: ' + code);
  });
}

console.log('Spawning child processes using the spawn method');
for (let i = 0; i < 3; i++) {
  const workerProcess = child_process.spawn('node', ['support.js', i]);

  workerProcess.stdout.on('data', data => {
    console.log('stdout: ' + data);
  });

  workerProcess.stderr.on('data', data => {
    console.log('stderr: ' + data);
  });

  workerProcess.on('close', code => {
    console.log('Child process exited with code ' + code);
  });
}
