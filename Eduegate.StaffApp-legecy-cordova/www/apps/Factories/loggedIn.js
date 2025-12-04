app.factory("loggedIn", ['$http', '$q', 'GetContext', '$rootScope', function ($http, $q, GetContext, $rootScope) {
  var loginPromise = null;
  
  return {
    CheckLogin: function (Context, rootUrl, takeCurrent) {
        //alert(takeCurrent);
        try {
            if (!(takeCurrent == 0)) {
                Context = GetContext.Context();
            }
        }
        catch (e) {
            console.log(e);
        };
  
        if (Context.EmailID || Context.UserId) {
            return $http({
                method: 'GET',
                url: rootUrl + '/GetUserDetails',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                }
            }).success(function (result) {
                return result;
            }).error(function (err) {
                return null;
            });
        }
        else {
            var deferred = $q.defer();
            var result = {
                data: null
            };
            deferred.resolve(result);
            return deferred.promise;
        }
    }
  };
  }]);