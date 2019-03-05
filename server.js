const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const multer = require('multer');
const child_process = require('child_process');

const upload = multer({
  dest: 'tmp/' // this saves your file into a directory called "uploads"
});
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  console.log('Got a GET request for index.html.');
  res.sendFile(__dirname + '/public/index.html');
});

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

var server = app.listen(8081, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
