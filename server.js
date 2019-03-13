const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const child_process = require('child_process');
const fs = require('fs');
/** @param file - Model that represents a file. */
const File = require('./models/file');
/**
 * @param multer - Multer is a node.js middleware for handling
 * multipart/form-data, used for uploading files.
 */
const multer = require('multer');

/** @param app - Express instance. */
const app = express();

/** @param TIMEOUT - Timeout used for testing the API. */
const TIMEOUT = 5000;
/** @param UPLOADS_FOLDER - Path to folder that contains uploaded files. */
const UPLOADS_FOLDER = './uploads/';

/**
 * Simple auth params.
 *
 * @param CHECK_AUTH_FOR_EVERY_REQUEST
 * @param AUTH_TOKEN
 * @param AUTH_USERNAME
 * @param AUTH_PASSWORD
 */
const CHECK_AUTH_FOR_EVERY_REQUEST = false;
const AUTH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const AUTH_USERNAME = 'test';
const AUTH_PASSWORD = 'test';

/** @param upload - Multer middleware for the temporary upload folder. */
const upload = multer({ dest: 'tmp/' });

/** @var allowCrossDomain - CORS middleware. */
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

/** @var checkAuthentication - Simple auth middleware. */
var checkAuthentication = function(req, res, next) {
  if (!CHECK_AUTH_FOR_EVERY_REQUEST) {
    next();
    return;
  }

  if (req.headers.authorization) {
    var receivedToken = req.headers.authorization.split(' ')[1];
    if (receivedToken === AUTH_TOKEN) {
      next();
      return;
    }
  }

  console.log('Attempt of unauthorized access!');
  res.sendStatus(401).end();
};

// Server middleware configuration.
app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(checkAuthentication);

// Simple login.
app.post('/login', function(req, res) {
  const user = req.body;

  if (user.userName === AUTH_USERNAME && user.password === AUTH_PASSWORD) {
    res.json({
      userName: user.userName,
      authToken: AUTH_TOKEN
    });
  } else {
    res.sendStatus(401).end();
  }
});

// File upload
app.post('/file-upload', upload.single('file-to-upload'), (req, res) => {
  console.log('Got a POST request for file upload.');
  if (req.file) {
    /** @member originalPath - Path to the file in the /tmp/ folder. */
    let originalPath = req.file.path;
    /**
     * @member originalName - Name of the file before it was saved to /tmp/.
     * (Once the file is saved to the /tmp/ folder it gets a new name.)  */
    let originalName = req.file.originalname;

    // Testing timeout
    setTimeout(() => {
      // Start a new upload process.
      const uploadProcess = child_process.spawn('node', [
        './process/upload.js',
        originalName,
        originalPath
      ]);

      uploadProcess.stdout.on('data', function(data) {
        console.log('Stdout: ' + data);
      });

      uploadProcess.stderr.on('data', function(data) {
        console.log('Stderr: ' + data);
      });

      uploadProcess.on('close', function(code) {
        console.log('Upload process exited with code ' + code);
        res.end();
      });
    }, TIMEOUT);
  } else {
    res.end();
  }
});

// File download
app.post('/download', function(req, res) {
  /** @member fileName - Name of the file that was requested for download. */
  const fileName = req.body.fileName;
  console.log('POST request for ' + fileName);

  // Testing timeout
  setTimeout(() => {
    res.sendFile(__dirname + '/uploads/' + fileName, err => {
      console.log('FIle ' + fileName + ' sent');
    });
  }, TIMEOUT);
});

// Delete file
app.delete('/delete/:fileName', function(req, res) {
  /** @member fileName - Name of the file that was requested for deletion. */
  const fileName = [req.params.fileName].toString();

  console.log('DELETE request for file ' + fileName);

  setTimeout(() => {
    fs.unlink(__dirname + '/uploads/' + fileName, err => {
      res.end();
    });
  }, TIMEOUT);
});

// List all files
app.get('/list-files', function(req, res) {
  console.log(new Date(), ' GET request to list-files');
  // Array with file info to be sent as a response.
  let fileArray = [];
  // How many files are left to process in to the fileArray,
  //  so we know when to end the response in the callback.
  let filesToProcess = -1;
  fs.readdir(UPLOADS_FOLDER, (err, files) => {
    filesToProcess = files.length;
    files.forEach(file => {
      const fileName = file;
      fs.stat(UPLOADS_FOLDER + file, (err, stats) => {
        fileArray.push(new File(fileName, stats['size'], stats['birthtime']));
        console.log(new File(fileName, stats['size'], stats['birthtime']));
        filesToProcess--;
        console.log(filesToProcess);
        if (filesToProcess === 0) {
          res.end(JSON.stringify(fileArray));
        }
      });
    });
  });
});

/** @var server - Start the server. */
var server = app.listen(8081, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
