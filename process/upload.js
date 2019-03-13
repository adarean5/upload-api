const fs = require('fs');

const originalName = process.argv[2];
const originalPath = process.argv[3];

const newPath = __dirname + '/../uploads/' + originalName;

// Check if file already exists
fs.access(newPath, fs.F_OK, err => {
  if (err) {
    console.error(err);
    // If the file already exists delete and replace it with a newer version.
    fs.unlink(newPath, err => {
      if (err) {
        console.log('File did not previously exist.');
      }

      /* 
      Read the file from /tmp/, 
        copy it to /uploads/ and rename it to it's original name,
        delete the file in /tmp/.
      */

      fs.readFile(originalPath, (err, data) => {
        fs.writeFile(newPath, data, err => {
          if (err) {
            console.log(err);
          } else {
            fs.unlink(originalPath, err => {
              if (err) {
                throw err;
              } else {
                console.log(
                  'File: "' + originalName + '" uploaded successfully.'
                );
              }
            });
          }
        });
      });
    });
  }
});
