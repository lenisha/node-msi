var url = require('url');
var ver = 0;

//SQL Server connection to node js by  tedious driver
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var auth = require('./auth');

module.exports = function(req, res) {
  console.log("Got request " + req.url + " to read database via MSI AccessToken authentication.");
  var query = url.parse(req.url,true).query;
  console.log(" with querystring: "+JSON.stringify(query));

  // Get an MSI access token for the azure sql database connection.
  auth.getMSIAccessToken().then(function (token) {
    console.log(" get msi access token for products_query : "+JSON.stringify(token));
    // connect to database
    var config = {
        server: 'd0004d-eastus2-asql-5.database.windows.net',
        // When you connect to Azure SQL Database, you need these next options.
        options: {encrypt: true, database: 'its-td-azure-infrastructure-azcld-nodejsdemo'},
        authentication: {
          type: "azure-active-directory-access-token",
          options: {
            token: token
          }
        }
    };

    var connection = new Connection(config);
    connection.on('error', function(err) {
        if (err) {
            console.log('failed to connect to azure sql server via tedious in /product_query.js');
            console.log(err);
        }else {
            console.log("database connection Error called with no err object.");
        }
    });
    connection.on('debug', function(messagetext) {
        if (messagetext) {
            console.log('database connection debugtext: ' + messagetext);
        }else {
            console.log("database connection Debug called with no messagetext object.");
        }
    });
    connection.on('connect', function(err) {
    // If no error, then good to go...
        executeStatement();
    }
    );


      function executeStatement() {
        request = new Request("select 42, 'hello world'", function(err, rowCount) {
          if (err) {
            console.log(err);
          } else {
            console.log(rowCount + ' rows');
          }
        });

        request.on('row', function(columns) {
          columns.forEach(function(column) {
            console.log(column.value);
          });
        });

        request.on('done', function(rowCount, more) {
          console.log(rowCount + ' rows returned');
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.end('Got ' +rowCount+ ' rows from database. \n<br>\n' + JSON.stringify(more));

        });

        connection.execSql(request);
      }

  });

};
