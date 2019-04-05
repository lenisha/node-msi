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
        console.log('>>> Got connection azure sql server via tedious in request, next go to execute sql query statement ');
        executeStatement();
        connection.close();
     } 
    );

    });
});


function executeStatement() {
  console.log("Connected");
 
  var results = [];
  var request = new Request("SELECT * FROM CLOUD_ENG", function (err, rowCount, rows) {
      if (err) {
        //Error occured 
        console.log('Error performing select: ');
        console.log(err);
        res.send(err);
      } else 
       //Successful request
        rows.forEach(function(row) {
          var name = row.name.value;
          var email = row.email.value;
          results.push({name, email})
        });

        //Display results
        console.log('Row count = ' + rowCount);
        console.log('Results = ' +  JSON.stringify(results));

        res.send( JSON.stringify(results) );
    });
    connection.execSql(request);
    });
  }



// Start application
var port = process.env.PORT || 9000;
app.listen(port, function () {
  console.log("Server running at http://localhost:%d", port);
});
