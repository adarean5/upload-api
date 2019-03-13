const fs = require('fs');

const originalName = process.argv[2];
const originalPath = process.argv[3];

const newPath = __dirname + '/../uploads/' + originalName;

// Testing timeout
setTimeout(() => {
  // Check if file already exists
  fs.access(newPath, fs.F_OK, err => {
    if (err) {
      console.error(err);
      // Delete the old file, to be replaced with the new one
      fs.unlink(newPath, err => {
        if (err) {
          console.error(err);
        }

        // Read the old file, save it as new file and delete the old file
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
}, 15000);
