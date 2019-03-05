const fs = require('fs');

const originalName = process.argv[2];
const originalPath = process.argv[3];

const newPath = __dirname + '/../uploads/' + originalName;

fs.readFile(originalPath, (err, data) => {
  fs.writeFile(newPath, data, err => {
    if (err) {
      console.log(err);
    } else {
      fs.unlink(originalPath, err => {
        if (err) {
          throw err;
        } else {
          console.log('File: "' + originalName + '" uploaded successfully.');
        }
      });
    }
  });
});
