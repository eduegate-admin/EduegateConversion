// apps/Services/authService.js
app.factory("AuthService", [
  "$q",
  function ($q) {
    var secureStorageInstance;
    var isCordova = !!window.cordova;

    const ACCESS_TOKEN_KEY = "access_token";
    const REFRESH_TOKEN_KEY = "refresh_token";

    if (isCordova) {
      document.addEventListener(
        "deviceready",
        function () {
          console.log("Device ready detected. Initializing SecureStorage.");
          secureStorageInstance = new SecureStorage(
            function () {
              console.log("SecureStorage initialized successfully.");
            },
            function (error) {
              console.error("Error initializing SecureStorage: " + error);
            },
            "my_app_storage"
          );
        },
        false
      );
    } else {
      console.warn(
        "Running in browser (not Cordova). SecureStorage not available. Using localStorage fallback."
      );
    }

    function getActiveStorageMethod() {
      if (isCordova && secureStorageInstance) {
        return "local";
      } else {
        return "local";
      }
    }
    function setItem(key, value) {
      var deferred = $q.defer();
      var storageMethod = getActiveStorageMethod();
      if (storageMethod === "secure") {
        secureStorageInstance.set(
          deferred.resolve,
          deferred.reject,
          key,
          value
        );
      } else {
        window.localStorage.setItem(key, value);
        deferred.resolve();
      }
      return deferred.promise;
    }

    function getItem(key) {
      var deferred = $q.defer();
      var storageMethod = getActiveStorageMethod();
      if (storageMethod === "secure") {
        secureStorageInstance.get(deferred.resolve, deferred.reject, key);
      } else {
        deferred.resolve(window.localStorage.getItem(key));
      }
      return deferred.promise;
    }

    function removeItem(key) {
      var deferred = $q.defer();
      var storageMethod = getActiveStorageMethod();
      if (storageMethod === "secure") {
        secureStorageInstance.remove(deferred.resolve, deferred.reject, key);
      } else {
        window.localStorage.removeItem(key);
        deferred.resolve();
      }
      return deferred.promise;
    }

    return {
      saveTokens: function (accessToken, refreshToken) {
        var accessTokenPromise = setItem(ACCESS_TOKEN_KEY, accessToken);
        var refreshTokenPromise = setItem(REFRESH_TOKEN_KEY, refreshToken);
        return $q.all([accessTokenPromise, refreshTokenPromise]);
      },

      getAccessToken: function () {
        return getItem(ACCESS_TOKEN_KEY);
      },

      getRefreshToken: function () {
        return getItem(REFRESH_TOKEN_KEY);
      },
      clearTokens: function () {
        var accessTokenPromise = removeItem(ACCESS_TOKEN_KEY);
        var refreshTokenPromise = removeItem(REFRESH_TOKEN_KEY);
        return $q.all([accessTokenPromise, refreshTokenPromise]);
      },
    };
  },
]);
