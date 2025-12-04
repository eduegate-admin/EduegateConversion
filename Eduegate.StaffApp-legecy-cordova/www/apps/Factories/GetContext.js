app.factory("GetContext", ['rootUrl', '$http', '$q', "$rootScope", function (rootUrl, $http, $q, $rootScope) {
    return {
        Context: function () {
            var ipaddress = "";
            var context;
            function getIPAddress() {                
                return userip;
            }
            var localStorageContext = window.localStorage.getItem("context");
           
            if (localStorageContext == undefined || localStorageContext == null || localStorageContext == "") {
                context = {
                    CompanyID: "", EmailID: "", IPAddress: getIPAddress(), LoginID: "", GUID: "", CurrencyCode: "", UserId: "0", ApiKey: "", 
                    UserRole: "", UserClaims: "", LanguageCode: "", CompanyID: "", SiteID: "",
                    UserReferenceID  : ""
                };
                
                window.localStorage.setItem("context", JSON.stringify(context));                
            }
            else {
                context = jQuery.parseJSON(localStorageContext);
            }
           
            return context;
        },
        SetContext: function (user, apiKey) {   
            var localStorageContext = jQuery.parseJSON(window.localStorage.getItem("context"));
            localStorageContext.EmailID = user.LoginEmailID;
            localStorageContext.LoginID = user.UserID;
            localStorageContext.UserId = user.LoginUserID;
            localStorageContext.UserClaimSets = user.ClaimSets;
  
            if (user.Customer != null && user.Customer != undefined) {
                localStorageContext.UserId = user.Customer.CustomerIID;
            }
            else {
                localStorageContext.UserId = null;
            }
  
            if (user.Employee != null && user.Employee != undefined) {
              localStorageContext.EmployeeID = user.Employee.EmployeeIID;
  
              if (user.Employee.EmployeeRoles) {
                  var userRoles = "";
                  $.each(user.Employee.EmployeeRoles, function (index, data) { userRoles = userRoles + data.Value; });
                  localStorageContext.UserRoles = userRoles;
              }
          }
          else {
              localStorageContext.EmployeeID = null;
          }
  
            localStorageContext.ApiKey = apiKey;
            window.localStorage.setItem("context", JSON.stringify(localStorageContext));
            return true;           
        },
        GetApiKey: function () {
            var deferred = $q.defer();
            var Context = this.Context();
            var call = $http({
              url: rootUrl.RootUrl + '/GenerateApiKey?uuid=' + device.uuid + "&version=" + device.version,
              method: 'GET',
              headers: {
                  "Accept": "application/json;charset=UTF-8",
                  "Content-type": "application/json; charset=utf-8",
                  "CallContext": JSON.stringify(Context)
              }
          }).success(function (result) {
              return result;
          }).error(function () {
              return "";
          });
            deferred.resolve(call);
            return deferred.promise;
        },
        NewContext: function () {
            var ipaddress = "";
            function getsIPAddress() {               
                return userip;
            }
            var context = {
                CompanyID: "", EmailID: "", 
                IPAddress: getsIPAddress(), 
                LoginID: "", GUID: "", 
                CurrencyCode: $rootScope.UserCurrency, 
                UserId: "0", ApiKey: "", UserRole: "", 
                UserClaims: "", LanguageCode: $rootScope.UserLanguage, 
                CompanyID: $rootScope.UserCountry, 
                SiteID: $rootScope.UserCountry
            };
            window.localStorage.setItem("context", JSON.stringify(context));
            return true;
        }
    };
  }]);