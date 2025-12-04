app.service("serviceAddToCart", ['$http', '$q', 'GetContext', '$rootScope', function ($http, $q, GetContext, $rootScope) {
    return {

      GetGUID: function (Context, rootUrl) {
          var promise = this.GUID(Context, rootUrl);
          promise.then(function (result) {
              Context.GUID = result.data;
              window.localStorage.setItem("context", JSON.stringify(Context));
              Context = GetContext.Context();
              return Context;
          });
      },

      GUID: function (Context, rootUrl) {
          var deferred = $q.defer();
          var call = $http({
              method: 'GET',
              url: rootUrl + '/GenerateGUID',
              headers: {
                  "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context)
              }
          }).then(function (result) {
              result = result.data;
              return result;
          }, function (err) {
              return "";
          });
          deferred.resolve(call);
          return deferred.promise;
      },

      addToCart: function (productID, quantity, rootUrl, Context, $root) {
          var deferred = $q.defer();
          var cartDTO = {
              SKUID: productID,
               Quantity: quantity, 
               Currency: Context.CurrencyCode,
              BranchID : $root.StoreID
            };

          if ((Context.EmailID == "" || Context.EmailID == undefined || Context.EmailID == null) && (Context.GUID == "" || Context.GUID == undefined || Context.GUID == null) && (Context.LoginID == ""||Context.LoginID == undefined || Context.LoginID == null)) {
              //var myDataPromise = this.GUID(Context,rootUrl);
              
              this.GUID(Context, rootUrl).then(function (result) {

                  Context.GUID = result.data;
                  window.localStorage.setItem("context", JSON.stringify(Context));
                  Context = GetContext.Context();		
                  
                  $http({
                      url: rootUrl + '/AddToCart',
                      method: 'POST',
                      data: cartDTO,
                      headers: {
                          "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context)
                      }

                  }).then(function (result) {            
                      result = result.data;
                      var finalResult = {
                          data: {
                              operationResult: 0, Message: ""
                          }
                      };

                      if (result.data != undefined && result.data != null && result.data != '') {
                          if (result.data.operationResult != undefined && result.data.operationResult != null && result.data.operationResult != '') {
                              finalResult.data = result.data;
                          }
                      }
                      else {
                          if (result.operationResult != undefined && result.operationResult != null && result.operationResult != '') {
                              finalResult.data.operationResult = result.operationResult;
                              finalResult.data.Message = result.Message;
                          }
                      }

                      if(result.WarningMessage) {
                        $timeout(function() {
                            $(".licartClick").notify( result.WarningMessage, 
                            { 
                                position:"bottom right", 
                                arrowSize: 8, 
                                className:"info", 
                                autoHide: false,  
                                clickToHide: false 
                            });
                       },500);
                    }

                    deferred.resolve(finalResult);
                  }, function (err) {
                      deferred.reject(null);
                  });
              });
          }
          else {
              $http({
                  url: rootUrl + '/AddToCart',
                  method: 'POST',
                  data: cartDTO,
                  headers: {
                      "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context)
                  }
              }).then(function (result) {
                  result = result.data;

                  if (result.operationResult == 1) {
                    $rootScope.SuccessMessage = result.Message;
                    const toastLiveExample = document.getElementById('liveToast')
                    const toast = new bootstrap.Toast(toastLiveExample , {
                        delay:2000,
                    })

                    toast.show()
                   
    
                }
                else {
    
                    $rootScope.ErrorMessage = result.Message;
                    $(".error-msg").removeClass('showMsg');
                    $(".error-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });
    
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                }

                  deferred.resolve(result);
              }, function (err) {
                  //return null;
                  deferred.reject(null);
              });

          }

          return deferred.promise;
      },

      mergeCart: function () {
          var deferred = $q.defer();
          var Context = GetContext.Context();
          var call = $http({
              url: rootUrl.RootUrl + '/MergeCart',
              method: 'GET',
              headers: {
                  "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context)
              }

          }).then(function (result) {
              result = result.data;
              return result;
          }, function (err) {
              return false;
          });

          deferred.resolve(call);
          return deferred.promise;
      }
  }
}]);