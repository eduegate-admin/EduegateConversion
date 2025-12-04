app.controller('AttendanceController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('AttendanceController loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    $scope.StudentID = $stateParams.studentID;

    $scope.HoliDayData = [];
    $scope.AttendenceData = [];
    $scope.AttendanceFullData = [];
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

        $scope.GetStudentClassWiseAttendance();
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
        $scope.WeekStartDay = (new Date("01/" + filterMonth.name + "/" + $scope.SelectedYear)).getDay();
        return $scope.WeekStartDay;
    };

    //To Get Attendance Data
    $scope.getStudentAttendance = function () {

        if (isNaN(parseInt($("#attendanceYear").val())) || parseInt($("#attendanceYear").val()) == null) {
            return null;
        }
        $scope.SelectedMonth = parseInt($("#attendanceMonth").val());
        $scope.SelectedYear = parseInt($("#attendanceYear").val());
        $scope.GetWeekStartDay();
        $scope.LoadData();
        $scope.GetCalendarDatas();
    };


    $scope.LoadData = function () {
        $rootScope.ShowLoader = true;
        var url = dataService + "/GetAcademicCalenderByMonthYear?month=" + ($scope.SelectedMonth + 1) + '&year=' + $scope.SelectedYear;

        $http({
            method: 'GET',
            url: url
        }).then(function (response) {
            // success
            $scope.HoliDayData = response.data;
        }, function (error) {
            // error
            $rootScope.ShowLoader = false;
        }).finally(function () {
            // complete
            $scope.LoadAttendenceData();
        });


    }
    $scope.SelectWardAttendance = function(ward) {
        $scope.SelectedWard = ward;
        $scope.getStudentAttendance();
    }


    $scope.LoadAttendenceData = function () {
        $http({
            method: 'GET',
            url: dataService + "/GetStudentAttendenceByYearMonthStudentId?month=" +
            $scope.SelectedMonth + '&year=' + $scope.SelectedYear + "&studentId=" + $scope.StudentID,
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
                        var PresentStatusTitle = 'UM'; var PresentStatusDescription = 'Unmarked';

                        if (holiDay != 'undefined' && holiDay != null) {
                            if (holiDay.AcademicYearCalendarEventType == '1') {
                                dataStatus = false;

                                PresentStatusID = attendanceDataNew.PresentStatusID != null ? attendanceDataNew.PresentStatusID : 3;//Holiday
                                PresentStatusTitle = attendanceDataNew.PresentStatusTitle != null ? attendanceDataNew.PresentStatusTitle : "H";
                                PresentStatusDescription = attendanceDataNew.PresentStatus != null ? attendanceDataNew.PresentStatus : "Holiday";
                            }
                            else if (holiDay.AcademicYearCalendarEventType == '2') {
                                dataStatus = false;

                                PresentStatusID = attendanceDataNew.PresentStatusID != null ? attendanceDataNew.PresentStatusID : 10;//Holiday
                                PresentStatusTitle = attendanceDataNew.PresentStatusTitle != null ? attendanceDataNew.PresentStatusTitle : "W";
                                PresentStatusDescription = attendanceDataNew.PresentStatus != null ? attendanceDataNew.PresentStatus : "Weekend";
                            }
                            else {
                                dataStatus = true;
                                PresentStatusID = 9;
                                PresentStatusTitle = 'UM';
                                PresentStatusDescription = 'Unmarked';
                            }

                        }
                        else {
                            dataStatus = true;
                            PresentStatusID = 9;
                            PresentStatusTitle = 'UM';
                            PresentStatusDescription = 'Unmarked';
                        }

                        if (PresentStatusTitle == null || PresentStatusTitle == 'undefined') {
                            dataStatus = true;
                            PresentStatusID = 9;
                            PresentStatusTitle = 'UM';
                            PresentStatusDescription = 'Unmarked';
                        }
                        else {
                            PresentStatusID = attendanceDataNew.PresentStatusID;
                            PresentStatusTitle = attendanceDataNew.PresentStatusTitle;
                            PresentStatusDescription = attendanceDataNew.PresentStatus;
                        }
                        if (PresentStatusID == null) {
                            PresentStatusID = 9;
                            PresentStatusTitle = 'UM';
                            PresentStatusDescription = 'Unmarked';
                        }

                        $scope.AttendanceFullData.push({
                            month: $scope.SelectedMonth, year: $scope.SelectedYear, day: moment(attendanceDataNew.AttendenceDate).format("D"),
                            status: dataStatus,
                            statusId: PresentStatusID,
                            statusTitle: PresentStatusTitle,
                            statusDescription:PresentStatusDescription,
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
                                PresentStatusDescription = 'Holiday';
                            }
                            else if (holiDay.AcademicYearCalendarEventType == '2') {
                                dataStatus = false;
                                PresentStatusID = 10;
                                PresentStatusTitle = 'W';
                                PresentStatusDescription = 'Weekend';
                            }
                            else {
                                dataStatus = true;
                                PresentStatusID = 9;
                                PresentStatusTitle = 'UM';
                                PresentStatusDescription = 'Unmarked';
                            }

                        }
                        else {
                            dataStatus = true;
                            PresentStatusID = 9;
                            PresentStatusTitle = 'UM';
                            PresentStatusDescription = 'Unmarked';
                        }

                        $scope.AttendanceFullData.push({
                            month: $scope.SelectedMonth, year: $scope.SelectedYear, day: i,
                            status: dataStatus,
                            statusId: PresentStatusID,
                            statusTitle: PresentStatusTitle,
                            statusDescription:PresentStatusDescription,
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
                    var PresentStatusTitle = 'UM'; var PresentStatusDescription = 'Unmarked';

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
                                PresentStatusDescription = 'Holiday';
                            }
                            else if (holiDay.AcademicYearCalendarEventType == '2') {
                                dataStatus = false;
                                PresentStatusID = 10;
                                PresentStatusTitle = 'W';
                                PresentStatusDescription = 'Weekend';
                            }
                            else {
                                dataStatus = true;
                                PresentStatusID = 9;
                                PresentStatusTitle = 'UM';
                                PresentStatusDescription = 'Unmarked';
                            }

                        }
                        else {
                            dataStatus = true;
                            PresentStatusID = 9;
                            PresentStatusTitle = 'UM';
                            PresentStatusDescription = 'Unmarked';
                        }
                    }

                    if (PresentStatusTitle == null || PresentStatusTitle == 'undefined') {
                        dataStatus = true;
                        PresentStatusID = 9;
                        PresentStatusTitle = 'UM';
                        PresentStatusDescription = 'Unmarked';
                    }
                    if (PresentStatusID == null) {
                        PresentStatusID = 9;
                        PresentStatusTitle = 'UM';
                        PresentStatusDescription = 'Unmarked';
                    }

                    $scope.AttendanceFullData.push({
                        month: $scope.SelectedMonth, year: $scope.SelectedYear, day: i,
                        status: dataStatus,
                        statusId: PresentStatusID,
                        statusTitle: PresentStatusTitle,
                        statusDescription:PresentStatusDescription,
                        reason: ' ',
                        actualDate: new Date(i + '/' + $scope.Months[$scope.SelectedMonth] + '/' + $scope.SelectedYear.toString()),
                        feeStartDate: '',
                    });
                }

            }

            $scope.GetCalendarDatas();
            $rootScope.ShowLoader = false;
        }).error(function () {
            $rootScope.ShowLoader = false;
        });

    };

    $scope.FillMonthDaysAttendance = function () {

        $scope.MonthDate();

        $scope.MonthDaysAttendance = [];

        var monthDays = [].constructor($scope.SelectedMonthDate).length;

        for (var day = 1; day <= monthDays; day++) {
            var slotData = $scope.GetAttendanceSlotData(day);
            $scope.MonthDaysAttendance.push({
                'title': slotData.Title, 'start': $scope.SelectedYear + "-" + ('0' + ($scope.SelectedMonth + 1)).slice(-2) + "-" + ('0' + day).slice(-2),
                'color': slotData.Color,
                'textColor': slotData.textColor,
                'className':"bullet bullet-dot w-25px h-25px position-absolute p-0 position-absolute top-50 start-50 translate-middle z-0 mt-n6 me-0 ms-0"
            });
        }
        return $scope.MonthDaysAttendance;
    }

    $scope.GetAttendanceSlotData = function (day) {
        var dayData = {};
        if ($scope.AttendanceFullData.length > 0) {
            var slot = $scope.AttendanceFullData.find(x => x.day == day);
            if (slot != undefined || slot != null) {

                dayData = {
                    "Title": '',
                    "Color": $scope.GetAttendanceSlotColor(day),
                    "textColor": $scope.GetAttendanceSlotTextColor(day),
                    "Description": slot.statusDescription
                };
            }
            else {
                dayData = {
                    "Title": "UM",
                    "Color": "#90a4ae",
                    "Description": "Unmarked"
                };
            }
        }

        return dayData;
    };
    $scope.GetAttendanceSlotTextColor = function (day) {
        var textColor = null
        if ($scope.AttendanceFullData.length > 0) {
            var slot = $scope.AttendanceFullData.find(x => x.day == day);
            if (slot != undefined || slot != null) {

                if (slot.statusTitle == "P")
                {
                    textColor = "#0ead1f";
                }
                else if (slot.statusTitle == "A")
                {
                    textColor = "#f37d1a";
                }
                else if (slot.statusTitle == "AE")
                {
                    textColor = "#f54213";
                }
                else if (slot.statusTitle == "H")
                {
                    textColor = "#ea2b15";
                }
                else if (slot.statusTitle == "L")
                {
                    textColor = "#fa06e0";
                }
                else if (slot.statusTitle == "T")
                {
                    textColor = "#855649";
                }
                else if (slot.statusTitle == "TE")
                {
                    textColor = "#3F4254";
                }
                else if (slot.statusTitle == "W")
                {
                    textColor = "#95b3d7";
                }
                else if (slot.statusTitle == "NA")
                {
                    textColor = "#8e0d0d";
                }
                else if (slot.statusTitle == "UM")
                {
                    textColor = "#4c4646";
                }
                else if (slot.statusTitle == "LE")
                {
                    textColor = "#0eaec7";
                }
                else if (slot.statusTitle == "LA")
                {
                    textColor = "#c2e20d";
                }
                else{
                    textColor = "#3F4254";
                }
            }
            else {
                textColor = "#90a4ae";
            }
        }

        return textColor;
    };

    $scope.GetAttendanceSlotColor = function (day) {
        var color = null;

        if ($scope.AttendanceFullData.length > 0) {
            var slot = $scope.AttendanceFullData.find(x => x.day == day);
            if (slot != undefined || slot != null) {

                if (slot.statusTitle == "P")
                {
                    color = "#0ead1f";
                }
                else if (slot.statusTitle == "A")
                {
                    color = "#f37d1a";
                }
                else if (slot.statusTitle == "AE")
                {
                    color = "#f54213";
                }
                else if (slot.statusTitle == "H")
                {
                    color = "#ea2b15";
                }
                else if (slot.statusTitle == "L")
                {
                    color = "#fa06e0";
                }
                else if (slot.statusTitle == "T")
                {
                    color = "#855649";
                }
                else if (slot.statusTitle == "TE")
                {
                    color = "#3F4254";
                }
                else if (slot.statusTitle == "W")
                {
                    color = "#95b3d7";
                }
                else if (slot.statusTitle == "NA")
                {
                    color = "#8e0d0d";
                }
                else if (slot.statusTitle == "UM")
                {
                    color = "#4c4646";
                }
                else if (slot.statusTitle == "LE")
                {
                    color = "#0eaec7";
                }
                else if (slot.statusTitle == "LA")
                {
                    color = "#c2e20d";
                }
                else{
                    color = "#3F4254";
                }
            }
            else {
                color = "#90a4ae";
            }
        }

        return color ;
    };

    $scope.GetDateByMonth = function () {
        var slot1 =  ''
        slot1 =  $scope.SelectedYear + "-" + ('0'+ ($scope.SelectedMonth + 1)).slice(-2) + "-" + '01';
        return slot1;
    };

    $scope.GetCalendarDatas = function ( ) {
        const element = document.getElementById("calendar");

        var calendarEl = document.getElementById("calendar");
        var calendar = new FullCalendar.Calendar(calendarEl, {
            headerToolbar: {
                left: "",
                center: "title",
                right: ""
            },


            height: 400,
            contentHeight: 400,
            aspectRatio: 3,

            nowIndicator: true,



            initialView: "dayGridMonth",

            // initialDate:"2014-02-01",
            initialDate:$scope.GetDateByMonth(),

            editable: false,
            dayMaxEvents: true, // allow "more" link when too many events
            navLinks: false,
            events: $scope.FillMonthDaysAttendance(),
            eventContent: function (info) {
                var element = $(info.el);

                if (info.event.extendedProps && info.event.extendedProps.description) {
                    if (element.hasClass("fc-day-grid-event")) {
                        element.data("content", info.event.extendedProps.description);
                        element.data("placement", "top");
                        KTApp.initPopover(element);
                    }
                }
            }
        });

        calendar.render();
    }

    $scope.GetStudentClassWiseAttendance = function () {
        $http({
            method: 'GET',
            url: `${dataService}/GetStudentClassWiseAttendance?studentID=${$scope.StudentID}&schoolID=30`,


            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).then(function (result) {
            $scope.GetStudentClassWiseAttendance = result.data;
        });
    }


}]);