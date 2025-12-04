app.controller('AttendanceController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('AttendanceController loaded.');
    $scope.PageName = "My Attendance";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.Leaves = [];
    $scope.HoliDayData = [];
    $scope.AttendenceData = [];
    $scope.AttendanceFullData = [];
    $scope.firstdateday = 0;
    $scope.firstdatedaytext = 0;
    $scope.Years = [];
    $scope.SelectedMonthDate = 0;
    $scope.MonthDays = [];

    $scope.CurrentDate = new Date();
    $scope.CurrentDateMonth = new Date().getMonth();
    $scope.CurrentDateYear = new Date().getFullYear();
    $scope.SelectedDay = new Date().getDate();
    $scope.SelectedYear = new Date().getFullYear();
    $scope.SelectedMonth = new Date().getMonth();
    $scope.SelectedDate = { SelectedYear: new Date().getFullYear().toString(), SelectedMonth: new Date().getMonth().toString() }

    $scope.Months = [

        'January', 'February', 'March', 'April', 'May',

        'June', 'July', 'August', 'September',

        'October', 'November', 'December'

    ];
    $scope.WeakList = [{ daynum: 1, dayName: 'Sunday' }, { daynum: 2, dayName: 'Monday' }, { daynum: 3, dayName: 'Tuesday' }, { daynum: 4, dayName: 'Wednesday' }, { daynum: 5, dayName: 'Thursday' }, { daynum: 6, dayName: 'Friday' }, { daynum: 7, dayName: 'Saturday' }];
    $scope.Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    $scope.WKDays = [{ num: 1, name: 'Sun' }, { num: 2, name: 'Mon' }, { num: 3, name: 'Tue' }, { num: 4, name: 'Wed' }, { num: 5, name: 'Thu' }, { num: 6, name: 'Fri' }, { num: 7, name: 'Sat' }];

    $scope.ShortMonthList = [{ num: 1, name: 'Jan' }, { num: 2, name: 'Feb' }, { num: 3, name: 'Mar' }, { num: 4, name: 'Apr' }, { num: 5, name: 'May' }, { num: 6, name: 'Jun' }, { num: 7, name: 'Jul' }, { num: 8, name: 'Aug' }, { num: 9, name: 'Sep' }, { num: 10, name: 'Oct' }, { num: 11, name: 'Nov' }, { num: 12, name: 'Dec' }];
    //End

    $scope.init = function () {

        for (let i = $scope.CurrentDateYear - 5; i <= $scope.CurrentDateYear; i++) {
            $scope.Years.push(i.toString());
        }

        $scope.MonthDate();
        $scope.GetWeekStartDay();

        $scope.LoadData();

    };

    $scope.MonthDate = function () {
        var date = new Date($scope.SelectedYear, $scope.SelectedMonth + 1, 0).getDate();
        $scope.SelectedMonthDate = date;
    };

    $scope.GetWeekStartDay = function () {
        var filterMonth = $scope.ShortMonthList.find(x => x.num == $scope.SelectedMonth + 1);
        // $scope.WeekStartDay = (new Date("01/"+ $scope.CurrentDate.toLocaleString('default', { month: 'short' }) + "/" + $scope.CurrentDateYear)).getDay();
        $scope.WeekStartDay = (new Date( $scope.SelectedYear +"-" + ('0' + (filterMonth.num)).slice(-2) + "-01T03:24:00")).getDay();
        return $scope.WeekStartDay;
    };

    //To Get Attendance Data
    $scope.GetStaffAttendence = function () {

        if (isNaN(parseInt($("#attendanceYear").val())) || parseInt($("#attendanceYear").val()) == null) {
            return null;
        }
        $scope.SelectedMonth = parseInt($("#attendanceMonth").val());
        $scope.SelectedYear = parseInt($("#attendanceYear").val());

        $scope.MonthDate();
        $scope.GetWeekStartDay();
        $scope.LoadData();
    };

    $scope.LoadData = function () {
        $rootScope.ShowLoader = true;
        $http({
            method: 'GET',
            url: dataService + "/GetAcademicCalenderByMonthYear?month=" + ($scope.SelectedMonth + 1) + '&year=' + $scope.SelectedYear,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        }).then(function (response) {
            $scope.HoliDayData = response.data;
            $scope.LoadAttendenceData(); // similar to jQuery `complete`
        }).catch(function (error) {
            $rootScope.ShowLoader = false;
            console.error("Error fetching academic calendar:", error);
        });


    }

    $scope.LoadAttendenceData = function () {
        $http({
            method: 'GET',
            url: dataService + "/GetStaffAttendenceByYearMonthEmployeeID?month=" +
                $scope.SelectedMonth + '&year=' + $scope.SelectedYear,
            data: $scope.user,
            headers: {
                Accept: "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                CallContext: JSON.stringify(context),
            },
        }).success(function (result) {
            $scope.AttendenceData = result;

            $scope.AttendanceFullData = [];
            if ($scope.AttendenceData.length > 0) {

                var totalDate = $scope.SelectedMonthDate;

                for (var i = 1; i <= totalDate; i++) {
                    var totalDate = $scope.SelectedMonthDate;

                    var attendanceDataNew = $scope.AttendenceData.find(a => i == moment(a.AttendenceDate).format("D") &&
                        ($scope.SelectedMonth + 1) == moment(a.AttendenceDate).format("M") &&
                        $scope.SelectedYear == moment(a.AttendenceDate).format("YYYY")
                    );

                    if (attendanceDataNew != 'undefined' && attendanceDataNew != null) {

                        var dateValue = attendanceDataNew.AdmissionDate != null ? parseInt(attendanceDataNew.AdmissionDate.replace(/\/Date\((\d+)\)\//g, "$1")) : null;
                        var admissionDate = new Date(dateValue);

                        var feeStartDateString = moment(attendanceDataNew.FeeStartDate).format("MM/DD/YYYY");
                        var feeStartDate = new Date(feeStartDateString);

                        if ($scope.HoliDayData != null) {
                            var holiDay = $scope.HoliDayData.find(h =>
                                moment(attendanceDataNew.AttendenceDate).format("D") == h.Day &&
                                ($scope.SelectedMonth + 1) == h.Month &&
                                $scope.SelectedYear == h.Year
                            );
                        }

                        var dataStatus = false; var PresentStatusID = 9;
                        var PresentStatusTitle = 'UM';

                        if (holiDay != 'undefined' && holiDay != null) {
                            if (holiDay.AcademicYearCalendarEventType == '1') {
                                dataStatus = false;
                                PresentStatusID = 3;
                                PresentStatusTitle = 'H';
                            }
                            else if (holiDay.AcademicYearCalendarEventType == '2') {
                                dataStatus = false;
                                PresentStatusID = 10;
                                PresentStatusTitle = 'W';
                            }
                            else {
                                dataStatus = true;
                                PresentStatusID = 9;
                                PresentStatusTitle = 'UM';
                            }

                        }
                        else {
                            dataStatus = true;
                            PresentStatusID = 9;
                            PresentStatusTitle = 'UM';
                        }

                        if (PresentStatusTitle == null || PresentStatusTitle == 'undefined') {
                            dataStatus = true;
                            PresentStatusID = 9;
                            PresentStatusTitle = 'UM';
                        }
                        else {
                            PresentStatusID = attendanceDataNew.PresentStatusID;
                            PresentStatusTitle = attendanceDataNew.PresentStatusTitle;
                        }
                        if (PresentStatusID == null) {
                            PresentStatusID = 9;
                            PresentStatusTitle = 'UM';
                        }

                        $scope.AttendanceFullData.push({
                            month: $scope.SelectedMonth, year: $scope.SelectedYear, day: moment(attendanceDataNew.AttendenceDate).format("D"),
                            status: dataStatus,
                            statusId: PresentStatusID,
                            statusTitle: PresentStatusTitle,
                            reason: (typeof (holiDay) == 'undefined' || holiDay == null) ? ' ' : holiDay.EventTitle,
                            actualDate: new Date(moment(attendanceDataNew.AttendenceDate).format("D") + '/' + $scope.Months[$scope.SelectedMonth] + '/' + $scope.SelectedYear.toString()),
                            feeStartDate: feeStartDate,
                        });
                    }
                    else {

                        if ($scope.HoliDayData != null) {
                            var holiDay = $scope.HoliDayData.find(h => i == h.Day &&
                                ($scope.SelectedMonth + 1) == h.Month &&
                                $scope.SelectedYear == h.Year
                            );
                        }

                        if (holiDay != 'undefined' && holiDay != null) {
                            if (holiDay.AcademicYearCalendarEventType == '1') {
                                dataStatus = false;
                                PresentStatusID = 3;
                                PresentStatusTitle = 'H';
                            }
                            else if (holiDay.AcademicYearCalendarEventType == '2') {
                                dataStatus = false;
                                PresentStatusID = 10;
                                PresentStatusTitle = 'W';
                            }
                            else {
                                dataStatus = true;
                                PresentStatusID = 9;
                                PresentStatusTitle = 'UM';
                            }

                        }
                        else {
                            dataStatus = true;
                            PresentStatusID = 9;
                            PresentStatusTitle = 'UM';
                        }

                        $scope.AttendanceFullData.push({
                            month: $scope.SelectedMonth, year: $scope.SelectedYear, day: i,
                            status: dataStatus,
                            statusId: PresentStatusID,
                            statusTitle: PresentStatusTitle,
                            reason: (typeof (holiDay) == 'undefined' || holiDay == null) ? ' ' : holiDay.EventTitle,
                            actualDate: new Date(i.toString() + '/' + $scope.Months[$scope.SelectedMonth] + '/' + $scope.SelectedYear.toString()),
                            feeStartDate: feeStartDate,
                        });

                    }
                }
            }//IF condition end
            else {

                var totalDate = $scope.SelectedMonthDate;

                for (var i = 1; i <= totalDate; i++) {

                    var dataStatus = true; var PresentStatusID = 9;
                    var PresentStatusTitle = 'UM';

                    if ($scope.HoliDayData.length > 0) {
                        var holiDay = $scope.HoliDayData.find(h => i == h.Day &&
                            ($scope.SelectedMonth + 1) == h.Month &&
                            $scope.SelectedYear == h.Year
                        );

                        if (holiDay != 'undefined' && holiDay != null) {
                            if (holiDay.AcademicYearCalendarEventType == '1') {
                                dataStatus = false;
                                PresentStatusID = 3;
                                PresentStatusTitle = 'H';
                            }
                            else if (holiDay.AcademicYearCalendarEventType == '2') {
                                dataStatus = false;
                                PresentStatusID = 10;
                                PresentStatusTitle = 'W';
                            }
                            else {
                                dataStatus = true;
                                PresentStatusID = 9;
                                PresentStatusTitle = 'UM';
                            }

                        }
                        else {
                            dataStatus = true;
                            PresentStatusID = 9;
                            PresentStatusTitle = 'UM';
                        }
                    }

                    if (PresentStatusTitle == null || PresentStatusTitle == 'undefined') {
                        dataStatus = true;
                        PresentStatusID = 9;
                        PresentStatusTitle = 'UM';
                    }
                    if (PresentStatusID == null) {
                        PresentStatusID = 9;
                        PresentStatusTitle = 'UM';
                    }

                    $scope.AttendanceFullData.push({
                        month: $scope.SelectedMonth, year: $scope.SelectedYear, day: i,
                        status: dataStatus,
                        statusId: PresentStatusID,
                        statusTitle: PresentStatusTitle,
                        reason: ' ',
                        actualDate: new Date(i + '/' + $scope.Months[$scope.SelectedMonth] + '/' + $scope.SelectedYear.toString()),
                        feeStartDate: '',
                    });
                }

            }

            $scope.GetMonthDays();
            $rootScope.ShowLoader = false;
        }).error(function () {
            $rootScope.ShowLoader = false;
        });

    };

    $scope.GetMonthDays = function () {
        $scope.MonthDays = [];
        var days = [].constructor($scope.SelectedMonthDate).length;
        for (var i = 1; i <= days; i++) {
            $scope.MonthDays.push({ 'Day': i, 'StatusData': GetAttendanceSlot(i) })
        }
    }

    function GetAttendanceSlot(day) {

        if ($scope.AttendanceFullData.length > 0) {
            var slot = $scope.AttendanceFullData.find(x => x.day == day);
            if (slot != undefined || slot != null) {
                return slot.statusTitle;
            }
            else {
                return "UM";
            }
        }

        return null;
    };

    // $scope.init();
}]);