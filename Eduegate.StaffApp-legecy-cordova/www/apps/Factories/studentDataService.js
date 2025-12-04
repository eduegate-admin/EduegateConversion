// In your services.js or app.js
app.factory('studentDataService', function($http,  rootUrl, GetContext) { // Assuming 'dataService' holds your base URL
  var service = {};
    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
  
  // This function calls your new, lightweight API endpoint
  service.getStudentIdentifiers = function() {
    return $http({
      method: "GET",
      // IMPORTANT: Use the new endpoint. Pass the loginID as a query parameter.
      url: dataService + "/GetStudentIdentifiersForOfflineUse",
      headers: {
        Accept: "application/json;charset=UTF-8",
        "Content-type": "application/json; charset=utf-8",
        CallContext: JSON.stringify(context),
      },
    });
  };

  return service;
});