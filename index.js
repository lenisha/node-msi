var url = require('url');

var ver = 0;

//SQL Server connection to node js by  tedious driver
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var auth = require('./auth');
var appconfig = require('./appconfig');
var express = require('express');

var app = express();
app.get('/', function (req, res) {

  console.log("Got request " + req.url + " to test add data to database via MSI AccessToken authentication.");
 
  // Get an MSI access token for the azure sql database connection.
  auth.getMSIAccessToken().then(function (token) {
    console.log(" get MSI access token for request : "+JSON.stringify(token));
    // connect to database
    var config = {
        server: appconfig.SQLSERVER,
        options: {
          database: appconfig.SQLDATABASE,
          encrypt: true, //indicates if the connection should be encrypted
          port: 1433, //port to establish connection
          rowCollectionOnRequestCompletion: true, //returns rows object on the new Request callback
          useColumnNames: true //returns columns names within the rows object on the new Request callback
        },
        authentication: {
          type: "azure-active-directory-access-token",
          options: {
            token: token
          }
        }
    };
    console.log(" connect to database in request /add with config: "+JSON.stringify(config));

    var connection = new Connection(config);
    connection.on('error', function(err) {
        if (err) {
            console.log('failed to connect to azure sql server via tedious in request /add: ');
            console.log(err);
        }else {
            console.log("database connection Error called with no err object.");
        }
    });
    connection.on('debug', function(messagetext) {
        if (messagetext) {
            console.log('request database connection debugtext: ' + messagetext);
        }else {
            console.log("request database connection Debug called with no messagetext object.");
        }
    });
    connection.on('connect', function(err) {
    // If no error, then good to go...
        console.log('>>> Got connection azure sql server via tedious in request /add, next go to execute sql query statement ');
        executeStatement();
     } 
    );

    });
});


function executeStatement() {
    var sqlstr = "INSERT INTO CLOUD_ENG(name, email) VALUES('test', 'test')";
    console.log("go to write a row to database via MSI");
    // create Request object
    var sqlRequest = new Request();
    sqlRequest.query(sqlstr, function (err, recordset) {
      if (err) {
        console.log('failed to insert a row to azure sql server via tedious');
        console.log(err);
      }
      // send records as a response
      console.log(recordset);
      res.end(JSON.stringify(recordset));

      connection.close();

    });
  }



// Start application
var port = process.env.PORT || 9000;
app.listen(port, function () {
  console.log("Server running at http://localhost:%d", port);
});
