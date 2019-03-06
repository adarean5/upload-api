const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const child_process = require('child_process');

//Initiate our app
const app = express();

const CHECK_AUTH_FOR_EVERY_REQUEST = false;
const AUTH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
const AUTH_USERNAME = 'test';
const AUTH_PASSWORD = 'test';

const upload = multer({ dest: 'tmp/' });
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

//CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

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

//Configure our app
app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(checkAuthentication);

// Load the homepage
app.get('/', function(req, res) {
  console.log('Got a GET request for index.html.');
  res.sendFile(__dirname + '/public/index.html');
});

// Load the upload file page
app.get('/upload-page', function(req, res) {
  console.log('Got a GET request for file upload.');
  res.sendFile(__dirname + '/public/upload.html');
});

// Post form
app.post('/process-post', urlEncodedParser, function(req, res) {
  response = {
    first_name: req.body.first_name,
    last_name: req.body.last_name
  };
  console.log(response);
  res.end(JSON.stringify(response));
});

// File upload
app.post('/file-upload', upload.single('file-to-upload'), (req, res) => {
  console.log('Got a POST request for file upload.');
  if (req.file) {
    let originalPath = req.file.path;
    let originalName = req.file.originalname;

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
    });

    res.redirect('/');
  }
  res.end('Please pick a file');
});

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

// Start the server
var server = app.listen(8081, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
