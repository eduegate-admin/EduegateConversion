// app.controller('OnlineStoreController', ['$scope', '$http', 'rootUrl',
//     'GetContext', '$state', '$stateParams', '$sce', '$rootScope', '$q',
//     function ($scope, $http, rootUrl, GetContext, $state, $stateParams, $sce, $rootScope,
//         $q) {
//         console.log('Online Store controller loaded.');
//         var dataService = rootUrl.RootUrl;

//         var pageInfoPromise = null;
//         $rootScope.BoilerPlates = [];
//         $scope.preventLoadBlocks = $stateParams.loadBlocks === 'false';

//         if ($stateParams.loadBlocks === 'true') {
//             $scope.preventLoadBlocks = false;
//         }
//         else {
//             if ($rootScope.BoilerPlates.length > 0) {
//                 $scope.preventLoadBlocks = true;
//             }
//         }
//         $scope.getPageInfo = function () {


//             pageInfoPromise = $http({
//                 url: dataService + '/GetPageInfo?pageID=1&parameter=',
//                 method: 'GET',
//                 headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
//             }).then(function (result) {
//                 pageInfoPromise = null;
//                 result = result.data;
//                 $rootScope.LoadingMessage = "";
//                 if (result != undefined && result != null && result.BoilerPlates != undefined && result.BoilerPlates != null) {
//                     $rootScope.BoilerPlates = result.BoilerPlates;
//                     $rootScope.ShowLoader = false;
//                 }
//                 else {
//                     $rootScope.ShowLoader = false;
//                 }
//             }, function (err) {
//                 pageInfoPromise = null;
//                 $scope.getPageInfo();
//             });

          


//         };

//         $scope.init = function () {
//             Context = GetContext.Context();
//             $scope.RemoveOverlay();
//             $rootScope.ShowLoader = true;
//             $rootScope.BoilerPlates = [];
//             $scope.getPageInfo();
//         }

//         $scope.init();

//     }]);