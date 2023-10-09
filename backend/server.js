const {PythonShell} = require('python-shell')
const express = require("express");
const formidable = require("formidable");
const cors = require("cors");
const server = express();
server.use(express.static('public'));
server.use(cors());

server.get("/", function (request, response) {
  console.log("received");
  response.send("hi")
});

server.post("/", function (request, response) {
  console.log(request);
  const form = new formidable.IncomingForm();
  form.parse(request, async function (err, input, inputtype) {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log(input);

    response.send(await magicPrediction(input.temp, input.grav));

    //attributes can be found in input.[attribute]
  });
});

async function magicPrediction(temperature, gravity){

  var promiseResolve, promiseReject;

  var promise = new Promise(function(resolve, reject){
    promiseResolve = resolve;
    promiseReject = reject;
  });

  let options = {
  };

  let pyshell = new PythonShell('notebook.py', options);

  // sends a message to the Python script via stdin
  pyshell.send(temperature);
  pyshell.send(gravity);

  var names = [];
  var genes = [];
  var sequence = [];
  var chromosome = [];
  var i = 0;

  pyshell.on('message', function (message) {
    switch(i){
      case 0:
        names = eval(message);
        break;
      case 1:
        genes = eval(message);
        break;
      case 2:
        sequence = eval(message);
        break;
      case 3:
        chromosome = eval(message);
        break;
    }
    i++;
  });

  // end the input stream and allow the process to exit
  pyshell.end(function (err,code,signal) {
    if (err) throw err;
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('finished');
    
    promiseResolve();
  });

  await promise;
  return {
    names: names,
    genes: genes,
    sequence: sequence,
    chromosome: chromosome
  }
}

// Start the server
const PORT = parseInt(process.env.PORT) || 8080;
server.listen(PORT, function () {
  console.log("Server is listening on port " + PORT);
});