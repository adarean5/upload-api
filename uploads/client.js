var http = require('http');

var options = {
  host: 'localhost',
  port: '8081',
  path: '/'
};

var callback = function(response) {
  var body = '';

  // Continuously update stream with data
  response.on('data', function(data) {
    body += data;
  });

  response.on('end', function() {
    console.log(body);
  });
};

var req = http.request(options, callback);
req.end();
