var request = require('request');
var Q = require('q');
var config = require('./config');

// The auth module object.
module.exports = {

// @name getMSIAccessToken
// @desc Makes a request for a token using MSI.
getMSIAccessToken: function () {
  var deferred = Q.defer();

  // Make a request to the MSI token issuing endpoint.
  var msi_endpoint = config.MSI_ENDPOINT + '?resource='+config.RESOURCE+'&api-version='+config.APIVERSION;
  // console.log(process.env);
  console.log('send request for MSI access token: ' + msi_endpoint);
  request.get({url: config.MSI_ENDPOINT,
               qs: {
                 'resource': config.RESOURCE,
                 'api-version': config.APIVERSION
               },
               headers: {
                 'Secret': config.MSI_SECRET
               },
               json: true}, function (err, response, body) {

    console.log('got response of MSI access token request: '+ response);
    console.log(body);
    if (err) {
      console.log('failed to get MSI acccess Token: ');
      console.log(err);
      deferred.reject(err);
    } else if (response.statusCode  != 200) {
      console.log('got failure when request MSI acccess Token: ');
      console.log(response.statusCode);
      console.log(response);
      deferred.reject(response.statusCode);
    } else {
      console.log(body.access_token);
      deferred.resolve(body.access_token);

    }

  });

  return deferred.promise;
}
};
