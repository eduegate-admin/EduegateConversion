// In authInterceptor.js
app.factory("AuthInterceptor", [
  "$q",
  "$injector",
  function ($q, $injector) {
    let isRefreshing = false;
    let deferredRequests = [];

    return {
      request: function (config) {
        var AuthService = $injector.get("AuthService");
        config.headers = config.headers || {};

        return AuthService.getAccessToken()
          .then(function (token) {
            if (token) {
              config.headers.Authorization = "Bearer " + token;
            }
            return config;
          })
          .catch(function () {
            return config;
          });
      },
      responseError: function (rejection) {
        var $http = $injector.get("$http");
        var AuthService = $injector.get("AuthService");
        var $state = $injector.get("$state");
        var rootUrl = $injector.get("rootUrl");
        var originalRequest = rejection.config;

        if (
          rejection.status === 401 &&
          !originalRequest.url.includes("api/auth/token")
        ) {
          if (isRefreshing) {
            var deferred = $q.defer();
            deferredRequests.push(function (newAccessToken) {
              originalRequest.headers.Authorization =
                "Bearer " + newAccessToken;
              deferred.resolve($http(originalRequest));
            });
            return deferred.promise;
          }

          isRefreshing = true;

          return AuthService.getRefreshToken().then(function (refreshToken) {
            if (!refreshToken) {
              AuthService.clearTokens();
              $state.go("identitylogin");
              return $q.reject(rejection);
            }

            var payload = {
              grant_type: "refresh_token",
              refresh_token: refreshToken,
            };

            return $http({
              method: "POST",
              url: rootUrl.IdentityServerUrl + "api/auth/token",
              data: payload,
            })
              .then(function (response) {
                isRefreshing = false;
                var newAccessToken = response.data.access_token;
                var newRefreshToken = response.data.refresh_token;

                return AuthService.saveTokens(
                  newAccessToken,
                  newRefreshToken
                ).then(function () {
                  deferredRequests.forEach(function (callback) {
                    callback(newAccessToken);
                  });
                  deferredRequests = [];

                  originalRequest.headers.Authorization =
                    "Bearer " + newAccessToken;
                  return $http(originalRequest);
                });
              })
              .catch(function () {
                isRefreshing = false;
                deferredRequests = [];
                AuthService.clearTokens();
                $state.go('identitylogin', null, { reload: true }); 
                return $q.reject(rejection);
              });
          });
        }
        return $q.reject(rejection);
      },
    };
  },
]);
