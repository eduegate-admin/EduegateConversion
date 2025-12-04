app.controller('MyWardsController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', "$timeout", function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('Myward controller loaded.');
    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.DashbaordType = 1;
    $scope.FeeDueAmount = 0;
    $scope.TotalFee = 0;
    $scope.UserName = context.EmailID;
    $scope.WardDetailsHeader= "";
    $scope.AttendencePercentage ="";
    $scope.MyWards = [];
    $scope.SelectedWard = {};
    $scope.showAddBtn = false;
    $scope.ErpUrl=rootUrl.ErpUrl;
    $scope.ContentService = rootUrl.ContentServiceUrl;
    $rootScope.ShowLoader = true;
    $scope.CandidateID = 0;


    $scope.init = function() {
        $http({
            method: 'GET',
            url: dataService + "/GetStudentDetailsByAdmissionNumber?admissionNumber=" + $rootScope.UserDetails.LoginUserID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {
            $scope.SelectedWard = result;
            $scope.StudentID = $scope.SelectedWard != null ? $scope.SelectedWard.StudentIID : 0;

            // $scope.SelectedWard = $scope.MyWards[0];
            // $scope.SelectedWard = $scope.MyWards[0];

            $rootScope.ShowLoader = false;
                GetFeeDueAmount(function() {
                $rootScope.ShowPreLoader = false;
            });
            $scope.GetAttendenceSummary();
            $scope.GetLeaveSummary();
            $scope.GetExamCandidateID();
        });

        $scope.MonthDate();
    }
    $scope.GetExamCandidateID = function () {
        $http({
            method: 'GET',
            url: dataService + "/GetExamCandidateID?studentID=" + $scope.StudentID,
            headers: {
                Accept: "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                CallContext: JSON.stringify(context),
            },
        }).success(function (result) {
            $scope.CandidateID = result;
        }).error(function(){
            return false;
        });
    }

    $scope.MonthDate = function () {
        var currentDay = new Date();
        // var previousMonth = new Date(currentDay.setMonth(currentDay.getMonth() - 1))
        $scope.SelectedMonthShort = moment(currentDay).format("M");
        $scope.SelectedDateMonth = moment(currentDay).format("MMM");
        $scope.SelectedDateYear = moment(currentDay).format("YYYY");
    }

    $scope.GetAttendenceSummary = function () {
        $http({
            method: 'GET',
            url: dataService + "/GetStudentAttendenceCountByStudentID?month=" +
                $scope.SelectedMonthShort + '&year=' + $scope.SelectedDateYear + "&studentID=" + $scope.StudentID,
            data: $scope.user,
            headers: {
                Accept: "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                CallContext: JSON.stringify(context),
            },
        }).success(function (result) {
            $scope.AttendenceSummaryData = result;
            const presentCount = $scope.AttendenceSummaryData.StudentPresentCount || 0;
            const absentCount = $scope.AttendenceSummaryData.StudentAbsentCount || 0;
            const totalCount = presentCount + absentCount;

            if (totalCount === 0) {
            $scope.AttendencePercentage = 'No data';

              return 'No data available';
            }

            // const attendancePercentage = (presentCount / totalCount) * 100;
            // const element = document.getElementById('progressbar');
            // element.style.width = attendancePercentage.toFixed(2) + '%';
            // $scope.AttendencePercentage = attendancePercentage.toFixed(2) + '%';
        }).error(function(){
            return false;
        });
    }


    $scope.GetLeaveSummary = function () {
        $http({
            method: 'GET',
            url: dataService + "/GetStudentLeaveCountByStudentID?studentID=" + $scope.StudentID,
            data: $scope.user,
            headers: {
                Accept: "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                CallContext: JSON.stringify(context),
            },
        }).success(function (result) {
            $scope.LeaveSummaryData = result;
        }).error(function(){
            return false;
        });
    }

    $scope.SelectWard = function(ward) {
        $scope.SelectedWard = ward;
        // $(onetime ).attr("src", "");
        $scope.MonthDate();
        $scope.GetAttendenceSummary();
        $scope.GetLeaveSummary();
        GetFeeDueAmount();
    }

    $scope.setMultiColor = function() {
        var colorCode = ["#6684fd","#fc442f","#ffac15","#37dc6e","#6684fd","#fc442f","#ffac15","#37dc6e","#6684fd","#fc442f"];
        var wardListItem = $(".tabScrollItemList ul li span.listWrap");

        $.each(wardListItem, function(index){
            var setColor = colorCode[index % wardListItem.length];
            $(this).css("color", setColor);
        })
    }

    $scope.viewDetails = function(event, detailsHeader) {

        $(".myWardsDetails").removeClass('animate__animated animate__slideOutRight').fadeOut("fast");

        $(".myWardsDetails").fadeIn(0).addClass('animate__animated animate__slideInRight animate__fadeIn');
        $scope.WardDetailsHeader = detailsHeader;
    }

    $scope.hideWardDetails = function() {

        $(".myWardsDetails").removeClass('animate__animated animate__slideInRight').fadeOut("fast");
        $(".myWardsDetails").fadeIn(0).addClass('animate__animated animate__slideOutRight');


        $scope.WardDetailsHeader="";
        $scope.showAddBtn = false;
    }

    function GetFeeDueAmount() {
            $http({
                method: 'GET',
                url: dataService + '/GetFeeDueAmountByStudentID?studentID=' + $scope.StudentID,
                data: $scope.user,
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).success(function (result) {
                $scope.FeeDueAmount = result;
            });
    }

    $scope.LeaveClick = function(){
        $state.go("studentleavestatus", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.StudentProfileViewClick = function(){
        $state.go("studentprofile", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.StudentAttendanceClick = function(){
        $state.go("studentattendance", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.TimeTableViewClick = function(){
        $state.go("timetable", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.TopicViewClick = function(){
        $state.go("topic", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.AssignmentViewClick = function(){
        $state.go("assignment", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.LessonPlanViewClick = function(){
        $state.go("lessonplan", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.ReportCardViewClick = function(){
        $state.go("reportcard", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.ClassTeacherViewClick = function(){
        $state.go("classteacher", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.StudentFeeDueViewClick = function(){
        $state.go("studentfeedue", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.StudentFineViewClick = function(){
        $state.go("studentfines", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.MarkListViewClick = function(){
        $state.go("studentmarklist", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.ExamListViewClick = function(){
        $state.go("studentexams", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.DriverDetailsClick = function () {
        $state.go("driverdetails", { studentID: $scope.SelectedWard.StudentIID });
    }

    $scope.DriverLocationClick = function () {
        $state.go("driverlocation", {  studentID: $scope.SelectedWard.StudentIID});
    }
    // $scope.ExamListLoginViewClick = function () {
    //     $state.go("examlogin");
    // }
    $scope.ExamListLoginViewClick = function () {
        $state.go("studentexamsdashboard", { candidateID: $scope.CandidateID });
    }
    

    $scope.init();
}]);