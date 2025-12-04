app.controller('StudentApplicationController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', '$q', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $q) {
    console.log('Student Application Controller loaded.');
    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.DashbaordType = 1;
    $scope.UserName = context.EmailID;
    $scope.applicationsDetailsHeader= "";
    $scope.showAddBtn = false;
    $scope.ErpUrl=rootUrl.ErpUrl;
    $rootScope.ShowLoader = true;
    $scope.StudentApplications = [];
    $scope.TransportApplications = [];

    $scope.StudentsApplicationCount = 0;
    $scope.TransportApplicationCount = 0;

    $rootScope.ShowLoader = true;
    
    $scope.init = function() {
        // $rootScope.ShowLoader = false;
        $q.all([
            GetStudentApplicationsCount(),
            GetTransportApplicationsCount(),
        ]).then(function () {
            $rootScope.ShowPreLoader = false;
        });
    };

    function GetStudentApplicationsCount() {
        return $q(function (resolve, reject) {
            $http({
                method: 'GET',
                url: dataService + '/GetStudentApplicationCount',
                data: $scope.user,
                headers: { 
                    "Accept": "application/json;charset=UTF-8", 
                    "Content-type": "application/json; charset=utf-8", 
                    "CallContext": JSON.stringify(context) 
                }
            }).success(function (result) {
                $scope.StudentsApplicationCount = result;

                $rootScope.ShowLoader = false;
            })
            .error(function(){
                $rootScope.ShowLoader = false;
            });

            // $rootScope.ShowLoader = false;
        });
    };

    function GetTransportApplicationsCount() {
        return $q(function (resolve, reject) {
            $http({
                method: 'GET',
                url: dataService + '/GetTransportApplicationCount',
                data: $scope.user,
                headers: { 
                    "Accept": "application/json;charset=UTF-8", 
                    "Content-type": "application/json; charset=utf-8", 
                    "CallContext": JSON.stringify(context) 
                }
            }).success(function (result) {
                $scope.TransportApplicationCount = result;   
                
                $rootScope.ShowLoader = false;
            })
            .error(function(){
                $rootScope.ShowLoader = false;
            });

            // $rootScope.ShowLoader = false;
        });
    };

    $scope.setMultiColor = function() {
        var colorCode = ["#6684fd","#fc442f","#ffac15","#37dc6e","#6684fd","#fc442f","#ffac15"];
        var applicationListItem = $(".tabScrollItemList ul li span.listWrap");
        
        $.each(applicationListItem, function(index){
            var setColor = colorCode[index % applicationListItem.length];
            $(this).css("color", setColor);
        });
    };
    
    $scope.viewDetails = function(event, detailsHeader) {    
        $(".applicationsDetails").fadeIn("fast").addClass('showPanel');
        $scope.applicationsDetailsHeader = detailsHeader;   
    };

    $scope.hideapplicationsDetails = function() {
        $(".applicationsDetails").removeClass('showPanel').fadeOut("fast"); 
        $scope.applicationsDetailsHeader="";
        $scope.showAddBtn = false;
    };
 
    $scope.init();   
}]);