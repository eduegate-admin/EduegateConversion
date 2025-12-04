app.controller('EnrollController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('EnrollController loaded.');
    $scope.PageName = "HR";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

$scope.Profile = null;
$scope.WardDetailsHeader= "";
$scope.onProfileFilling = true;

$rootScope.ShowLoader = true;

$rootScope.UserClaimSets = context.UserClaimSets;
$rootScope.Driver = false
$scope.Teacher = false
$rootScope.Admin = false


if ($rootScope.UserClaimSets.some(code => code.Value === 'Driver')){
    $rootScope.Driver = true
}
if ($rootScope.UserClaimSets.some(code => code.Value === 'Class Teacher')){
    $scope.Teacher = true
}
if ($rootScope.UserClaimSets.some(code => code.Value === 'Super Admin')){
    $rootScope.Admin = true
  }

$scope.init = function() {
    $rootScope.ShowLoader = false;
}

$scope.LoadProfileInfo = function() {
    $http({
        method: 'GET',
        url: dataService + '/GetStaffProfile',
        headers: {
            "Accept": "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            "CallContext": JSON.stringify(context)
        }
    }).success(function (result) {
       $scope.Profile= result;
       if($scope.Profile == null)
       {
        $scope.onProfileFilling = false;
       }
    });
}

$scope.setMultiColor = function() {
    var colorCode = ["#6684fd","#fc442f","#ffac15","#37dc6e","#6684fd","#fc442f","#ffac15"];
    var wardListItem = $(".tabScrollItemList ul li span.listWrap");

    $.each(wardListItem, function(index){
        var setColor = colorCode[index % wardListItem.length];
        $(this).css("color", setColor);
    })
}

$scope.viewDetails = function(event, detailsHeader, title) {
    $(".myWardsDetails").fadeIn("fast").addClass('showPanel');
    $scope.WardDetailsHeader = detailsHeader;
    $scope.WardDetailsTitle = title ?? detailsHeader;
}

$scope.hideWardDetails = function() {
    $(".myWardsDetails").removeClass('showPanel').fadeOut("fast");
    $scope.WardDetailsHeader="";
    $scope.WardDetailsTitle = "";
    $scope.showAddBtn = false;
}

$scope.back = function() {
    $scope.onClassDetails = false;
}

$scope.init();
}]);