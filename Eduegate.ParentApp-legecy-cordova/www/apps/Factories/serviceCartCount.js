app.factory("serviceCartCount", ['rootUrl', '$http', '$q', "$rootScope",'GetContext','$timeout' ,'$translate', function (rootUrl, $http, $q, $rootScope,GetContext,$timeout , $translate) {
    var productCountPromise = null;
    var countsDeferred = null;

    return {
      getProductCount: function (context, rootUrl) {

            if(productCountPromise && productCountPromise.resolve) {
                productCountPromise.resolve();
            }

            productCountPromise = $http({
                method: 'GET',
                url: rootUrl + '/GetShoppingCartCount',
                timeout : productCountPromise,
                headers: {
                    "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                productCountPromise = null;
                return result.data;
            }, function (err) {
                if(err.xhrStatus != 'abort') {
                    $timeout(function () {
                        $translate(['ADCSserverisnotreachablecurrently']).then(function (translation) {
                            // $rootScope.ShowToastMessage($rootScope.ErrorMessage);
                            productCountPromise = null;
                        });
                    });
                }
        });
        return productCountPromise;
      },
      getSaveForLaterCount: function (Context, rootUrl) {
          Context = GetContext.Context();
          if (Context.ApiKey != null && Context.ApiKey != undefined && Context.ApiKey != "") {
              var deferred = $q.defer();
              var result = {
                  data: 0
              };
              deferred.resolve(result);
              return deferred.promise;
          }
          else {
              var deferred = $q.defer();
              var result = {
                  data: 0
              };
              deferred.resolve(result);
              return deferred.promise;
          }
      },
      getCounts: function (context, rootUrl) {
        countsDeferred = $q.defer();

        $http({
            method: 'GET',
            url: rootUrl + '/GetCounts',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (result) {
            $rootScope.Counts = result.data;
            countsDeferred.resolve(result.data);
        }, function (err) {
            $timeout(function () {
                $translate(['ADCSserverisnotreachablecurrently']).then(function (translation) {
                    // $rootScope.ShowToastMessage($rootScope.ErrorMessage);
                });
            });
            countsDeferred.resolve();
        });

        return countsDeferred.promise;
    },
  }
}]);