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


    $scope.init = function() {
        let storedWard = localStorage.getItem('selectedWard');  
        if (storedWard) {  
            try {
                $scope.SelectedWard = JSON.parse(storedWard);  
            } catch (error) {
                console.error("Error parsing storedWard:", error);
                localStorage.removeItem('selectedWard'); // Clear corrupted data
            }
        }
    
        $http({
            method: 'GET',
            url: dataService + '/GetMyStudents',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (response) {
            $scope.MyWards = response.data;
        
            let storedWard = localStorage.getItem('selectedWard');
            if (storedWard) {
                try {
                    storedWard = JSON.parse(storedWard);
                    const foundStudent = $scope.MyWards.find(w => w.StudentIID === storedWard.StudentIID);
                    $scope.SelectedWard = foundStudent || $scope.MyWards[0];
                } catch (error) {
                    console.error("Error parsing storedWard:", error);
                    $scope.SelectedWard = $scope.MyWards[0];
                }
            } else {
                $scope.SelectedWard = $scope.MyWards[0];
            }
        
            localStorage.setItem('selectedWard', JSON.stringify($scope.SelectedWard));
            $rootScope.ShowLoader = false;
        
            GetFeeDueAmount();
            $scope.GetAttendenceSummary();
            $scope.GetLeaveSummary();
        });
    
        $scope.MonthDate();
    };
    
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
                $scope.SelectedMonthShort + '&year=' + $scope.SelectedDateYear + "&studentID=" + $scope.SelectedWard.StudentIID,
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

            const attendancePercentage = (presentCount / totalCount) * 100;
            const element = document.getElementById('progressbar');
            element.style.width = attendancePercentage.toFixed(2) + '%';
            $scope.AttendencePercentage = attendancePercentage.toFixed(2) + '%';
        }).error(function(){
            return false;
        });
    }


    $scope.GetLeaveSummary = function () {
        $http({
            method: 'GET',
            url: dataService + "/GetStudentLeaveCountByStudentID?studentID=" + $scope.SelectedWard.StudentIID,
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
        localStorage.setItem('selectedWard', JSON.stringify(ward)); // Store in localStorage
    
        $scope.MonthDate();
        $scope.GetAttendenceSummary();
        $scope.GetLeaveSummary();
        GetFeeDueAmount();
    };
    

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
                url: dataService + '/GetFeeDueAmountByStudentID?studentID=' + $scope.SelectedWard.StudentIID,
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

    // $scope.init();
}]);