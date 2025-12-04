app.controller("StudentAttendanceController", [
  "$scope",
  "$http",
  "$state",
  "rootUrl",
  "$location",
  "$rootScope",
  "$stateParams",
  "GetContext",
  "$sce",
  "$timeout",
  function (
    $scope,
    $http,
    $state,
    rootUrl,
    $location,
    $rootScope,
    $stateParams,
    GetContext,
    $sce,
    $timeout
  ) {
    console.log("StudentAttendanceController loaded.");
    $scope.PageName = "Student attendance";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    $scope.ContentService = rootUrl.ContentServiceUrl;

    $scope.Students = [];
    $scope.Staffs = [];
    $scope.CurrentAttendence = {};
    $scope.Model = {};

    $scope.CurrentDate = moment();
    $scope.CurrentDateMonth = new Date().getMonth();
    $scope.CurrentDateYear = new Date().getFullYear();
    $scope.SelectedDay = new Date().getDate();
    $scope.SelectedYear = new Date().getFullYear();
    $scope.SelectedMonth = new Date().getMonth();
    $scope.SelectedDate = {
      SelectedYear: new Date().getFullYear().toString(),
      SelectedMonth: new Date().getMonth().toString(),
      SelectedDay: new Date().getDate().toString(),
    };

    $scope.AttendenceData = [];
    $scope.AttendenceReasons = [];
    $scope.PresentStatuses = [];
    $scope.Classes = [];
    $scope.Sections = [];
    $scope.selectedClass = "";
    $scope.selectedSection = "";
    $scope.disablebutton = true;

    $rootScope.ErrorMessage = "";
    $scope.Message = "";

    $rootScope.ShowLoader = true;

    $scope.onStatusChange = false;

    $scope.Reason = null;
    $scope.type = null;
    $scope.PresentStatus = null;
    $scope.PStatus = 0;
    $scope.updateStatus = 0;
    $scope.HoliDayData = [];
    $scope.SelectedMonthDate = 0;
    $scope.MonthDays = [];
    $scope.firstdateday = 0;
    $scope.firstdatedaytext = 0;

    $scope.Years = [];

    $scope.Months = [
      "January",
      "February",
      "March",
      "April",
      "May",

      "June",
      "July",
      "August",
      "September",

      "October",
      "November",
      "December",
    ];
    $scope.WeakList = [
      { daynum: 1, dayName: "Sunday" },
      { daynum: 2, dayName: "Monday" },
      { daynum: 3, dayName: "Tuesday" },
      { daynum: 4, dayName: "Wednesday" },
      { daynum: 5, dayName: "Thursday" },
      { daynum: 6, dayName: "Friday" },
      { daynum: 7, dayName: "Saturday" },
    ];
    $scope.Days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    $scope.WKDays = [
      { num: 1, name: "Sun" },
      { num: 2, name: "Mon" },
      { num: 3, name: "Tue" },
      { num: 4, name: "Wed" },
      { num: 5, name: "Thu" },
      { num: 6, name: "Fri" },
      { num: 7, name: "Sat" },
    ];

    $scope.dateRange = [];
    $scope.NotificationButton = "Send today's attendance to parents";

    $scope.init = function () {
      $scope.LoadDropdownList();
      $scope.GetListData();

      $scope.Years = [];

      for (
        let i = $scope.CurrentDateYear - 5;
        i <= $scope.CurrentDateYear;
        i++
      ) {
        $scope.Years.push(i.toString());
      }

      $scope.MonthDate();
      // $scope.GetWeekStartDay();
      $scope.generateDateRange();
    };

    $scope.dateRange = [];

    // Call the function to generate date range

    $scope.MonthDate = function () {
      var date = new Date(
        $scope.SelectedYear,
        $scope.SelectedMonth + 1,
        0
      ).getDate();
      $scope.SelectedMonthDate = date;
    };

    // $scope.GetWeekStartDay = function () {
    //     var filterMonth = $scope.ShortMonthList.find(x => x.num == $scope.SelectedMonth + 1);
    //     // $scope.WeekStartDay = (new Date("01/"+ $scope.CurrentDate.toLocaleString('default', { month: 'short' }) + "/" + $scope.CurrentDateYear)).getDay();
    //     $scope.WeekStartDay = (new Date("01/" + filterMonth.name + "/" + $scope.SelectedYear)).getDay();
    //     return $scope.WeekStartDay;
    // };

    $scope.StatusChange = function () {
      $rootScope.ErrorMessage = "";
    };

    $scope.GetListData = function () {
      var ClassList = [];
      var SectionList = [];
      var count = 0;

      //Get class and section lookup data
      $http({
        method: "GET",
        url: dataService + "/GetClassTeacherClass",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          var dataList = result;
          $rootScope.ShowLoader = false;

          if (dataList.length > 0) {
            dataList.forEach((x) => {
              if (x.ClassID != null) {
                ClassList.push({
                  Key: x.ClassID,
                  Value: x.ClassName,
                });
              }

              if (x.SectionID != null) {
                SectionList.push({
                  Key: x.SectionID,
                  Value: x.SectionName,
                });
              }
            });

            //Get distinct data of class lookup data start
            if (ClassList.length > 0) {
              var distinctClassList = [];
              var start = false;

              for (j = 0; j < ClassList.length; j++) {
                for (k = 0; k < distinctClassList.length; k++) {
                  if (ClassList[j].Key == distinctClassList[k].Key) {
                    start = true;
                  }
                }
                count++;
                if (count == 1 && start == false) {
                  distinctClassList.push(ClassList[j]);
                }
                start = false;
                count = 0;
              }

              distinctClassList.forEach((x) => {
                if (x.Key != null) {
                  $scope.Classes.push({
                    Key: x.Key,
                    Value: x.Value,
                  });
                }
              });
            }
            //Get distinct data of class lookup data end

            //Get distinct data of section lookup data start
            if (SectionList.length > 0) {
              var distinctSectionList = [];
              var start = false;

              for (j = 0; j < SectionList.length; j++) {
                for (k = 0; k < distinctSectionList.length; k++) {
                  if (SectionList[j].Key == distinctSectionList[k].Key) {
                    start = true;
                  }
                }
                count++;
                if (count == 1 && start == false) {
                  distinctSectionList.push(SectionList[j]);
                }
                start = false;
                count = 0;
              }

              distinctSectionList.forEach((x) => {
                if (x.Key != null) {
                  $scope.Sections.push({
                    Key: x.Key,
                    Value: x.Value,
                  });
                }
              });
            }
            //Get distinct data of section lookup data end

            if ($scope.Classes.length > 0 && $scope.Sections.length > 0) {
              $rootScope.ShowLoader = false;
            }
          }
        })
        .error(function () {
          $rootScope.ShowLoader = false;
        });

      //Present Status
      var attnStatuses = [];
      var attnStatusesFiltered = [];
      $http({
        method: "GET",
        url: dataService + "/GetPresentStatuses",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {
        $scope.PresentStatuses = result;
        $scope.PresentStatuses.forEach((x) => {
          if (
            x.StatusTitle !== "H" &&
            x.StatusTitle !== "W" &&
            x.StatusTitle !== "LA" &&
            x.StatusTitle !== "UM" &&
            x.StatusTitle !== "P" &&
            x.StatusTitle !== "A"
          )
            attnStatuses.push({
              PresentStatusID: x.PresentStatusID,
              StatusDescription: x.StatusDescription,
              StatusTitle: x.StatusTitle,
            });
        });
        $scope.PresentStatuses.forEach((x) => {
          if (x.StatusTitle === "P" || x.StatusTitle === "A")
            attnStatusesFiltered.push({
              PresentStatusID: x.PresentStatusID,
              StatusDescription: x.StatusDescription,
              StatusTitle: x.StatusTitle,
            });
        });
        $scope.AttendanceStatuses = attnStatuses;
        $scope.PresentAbsentStatuses = attnStatusesFiltered;
      });
    };

    $scope.LoadDropdownList = function () {
      //Present Status
      $http({
        method: "GET",
        url:
          dataService +
          "/GetDynamicLookUpDataForMobileApp?lookType=" +
          "PresentStatus" +
          "&defaultBlank=" +
          "false",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {
        $scope.PresentStatusData = result;
      });

      //Attendence Reason
      $http({
        method: "GET",
        url:
          dataService +
          "/GetDynamicLookUpDataForMobileApp?lookType=" +
          "AttendenceReason" +
          "&defaultBlank=" +
          "false",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).success(function (result) {
        $scope.AttendenceReasons = result;
      });

      // $scope.GetListData();
    };

    $scope.ClassSectionChange = function (date) {
      var classId = $scope.selectedClass;
      var sectionId = $scope.selectedSection;
      $rootScope.ErrorMessage = "";

      if (classId == null || classId == "") {
        classId = 0;
        // $().showMessage($scope, $timeout, true, "Please Select an Class");
        $rootScope.ErrorMessage = "Please select an class";
        return false;
      }

      if (sectionId === null || sectionId == "") {
        sectionId = 0;
        // $rootScope.ErrorMessage = "Please select an section";
        return false;
      }

      var url =
        dataService +
        "/GetClassStudents?classId=" +
        classId +
        "&sectionId=" +
        sectionId;
      $http({
        method: "Get",
        url: url,
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(
        function (result) {
          $scope.Students = result.data;
          $scope.getStudentAttendance(date);
        },
        function () {}
      );
    };
    // Function to generate date range for the current month
    $scope.generateDateRange = function () {
      var selectedMonth = $scope.SelectedMonth + 1;
      var selectedYear = $scope.SelectedYear;

      // Validate selected month and year
      if (!selectedMonth || !selectedYear) {
        console.error("Selected month or year is not valid.");
        return;
      }

      var daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      $scope.dateRange = [];

      for (var i = 1; i <= daysInMonth; i++) {
        var date = new Date(selectedYear, selectedMonth - 1, i);
        var dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        $scope.dateRange.push({ date: i, dayName: dayName });
      }
    };

    $scope.getStudentAttendance = function (date) {
      $scope.disablebutton = true;
      if (date) {
        $scope.SelectedDay = date.date;
      }
      const today = new Date();
      const todayDay = today.getDate();
      if ($scope.SelectedDay == todayDay) {
        $scope.disablebutton = false;
      }

      var index = $scope.dateRange.indexOf(date);
      if (index !== -1) {
        var container = document.getElementById("dateTabList");
        var selectedTab = document.getElementById("attendanceDay" + index);
        var containerWidth = container.clientWidth;
        var selectedTabWidth = selectedTab.clientWidth;
        var scrollOffset =
          selectedTab.offsetLeft - (containerWidth - selectedTabWidth) / 2;

        container.style.scrollBehavior = "smooth";
        container.scrollLeft = scrollOffset;

        // Instead of triggering click, just update state directly
        $timeout(function () {
          $scope.SelectedDay = date.date;
          $scope.disablebutton =
            new Date().getDate() == date.date ? false : true;
          $scope.LoadAttendenceData();
          container.style.scrollBehavior = "auto";
        });
      }

      var classId = $scope.selectedClass;
      var sectionId = $scope.selectedSection;

      if (classId == null || classId == "") {
        classId = 0;
        // $().showMessage($scope, $timeout, true, "Please Select an Class");
        return false;
      }

      if (sectionId === null || sectionId == "") {
        sectionId = 0;
        return false;
      }

      if (
        isNaN(parseInt($("#attendanceYear").val())) ||
        parseInt($("#attendanceYear").val()) == null
      ) {
        return null;
      }
      $scope.SelectedMonth = parseInt($("#attendanceMonth").val());
      $scope.SelectedYear = parseInt($("#attendanceYear").val());
      // $scope.generateDateRange();

      $scope.MonthDate();
      $scope.LoadAttendenceData();
    };

    $scope.LoadAttendenceData = function () {
      $rootScope.ShowLoader = true;
      // $scope.Students = [];
$http({
    method: "GET",
    url: dataService + "/GetAcademicCalenderByMonthYear",
    params: {
        month: $scope.SelectedMonth + 1,
        year: $scope.SelectedYear
    }
}).then(function (response1) {
    $scope.HoliDayData = response1.data;

    // Proceed to fetch attendance only after calendar is loaded
    return $http({
        method: "GET",
        url: dataService + "/GetStudentAttendenceByDayClassSection",
        params: {
            month: $scope.SelectedMonth,
            year: $scope.SelectedYear,
            day: $scope.SelectedDay,
            classId: $scope.selectedClass,
            sectionId: $scope.selectedSection
        }
    });
}).then(function (response2) {
    $scope.AttendenceData = response2.data;

    // Final step after both requests succeed
    $scope.LoadAttendence();
}).catch(function (error) {
    console.error("Error in loading data:", error);
    // Optionally show error message to user
});

    };

    $scope.LoadAttendence = function () {
      //$scope.SelectedDay = new Date().getDate();
      var classId = $scope.selectedClass;
      var sectionId = $scope.selectedSection;
      var i = $scope.SelectedDay;
      $scope.Students = [];
$http({
  method: "GET",
  url: dataService + "/GetClasswiseStudentData",
  params: {
    classId: classId,
    sectionId: sectionId
  },
  headers: {
    "Accept": "application/json;charset=UTF-8",
    "Content-type": "application/json; charset=utf-8",
    "CallContext": JSON.stringify(context)
  }
}).then(function (response) {
  const result3 = response.data;

  if (!result3?.IsError && result3 != null) {
    angular.forEach(result3, function (student) {
      student.attendances = [];

      for (let i = 1; i <= $scope.SelectedMonthDate; i++) {
        let existingData = null, holiDay = null;

        if ($scope.AttendenceData != null) {
          existingData = $scope.AttendenceData.find((a) =>
            a.StudentID == student.StudentIID &&
            i == moment(a.AttendenceDate).format("DD") &&
            $scope.SelectedMonth + 1 == moment(a.AttendenceDate).format("M") &&
            $scope.SelectedYear == moment(a.AttendenceDate).format("YYYY")
          );
        }

        if ($scope.HoliDayData != null) {
          holiDay = $scope.HoliDayData.find((h) =>
            i == h.Day &&
            $scope.SelectedMonth + 1 == h.Month &&
            $scope.SelectedYear == h.Year
          );
        }

        const actualDate = moment(`${i}-${$scope.Months[$scope.SelectedMonth]}-${$scope.SelectedYear}`, "D-MMMM-YYYY").toDate();
        const admissionDate = new Date(parseInt(student.AdmissionDate.replace(/\/Date\((\d+)\)\//g, "$1")));
        const feeStartDate = moment(student.FeeStartDate).toDate();

        let dataStatus = false;
        let PresentStatusID = 9;

        if (!existingData) {
          if (holiDay) {
            if (holiDay.AcademicYearCalendarEventType == "1") {
              dataStatus = false;
              PresentStatusID = 3;
            } else if (holiDay.AcademicYearCalendarEventType == "2") {
              dataStatus = false;
              PresentStatusID = 10;
            }
          } else {
            dataStatus = true;
            PresentStatusID = 9;
          }
        } else {
          PresentStatusID = existingData.PresentStatusID || 9;
        }

        const presentStatus = $scope.PresentStatuses.find(a => a.PresentStatusID == PresentStatusID);

        student.attendances.push({
          date: `${i}/${$scope.SelectedMonth + 1}/${$scope.SelectedYear}`,
          month: $scope.SelectedMonth,
          year: $scope.SelectedYear,
          day: i,
          status: dataStatus,
          statusId: PresentStatusID,
          studentID: student.StudentIID,
          admissionNumber: student.AdmissionNumber,
          StudentProfile: student.StudentProfile,
          studentName: `${student.FirstName} ${student.MiddleName} ${student.LastName}`,
          StatusDescription: presentStatus?.StatusDescription || '',
          statusTitle: presentStatus?.StatusTitle || '',
          reason: holiDay?.EventTitle || ' ',
          actualDate: actualDate,
          feeStartDate: feeStartDate,
        });
      }

      // Avoid pushing duplicate students
      if (!$scope.Students.find(s => s.StudentIID === student.StudentIID)) {
        $scope.Students.push(student);
      }
    });
  } else {
    alert("No Student found!");
  }

  $rootScope.ShowLoader = false;
}).catch(function (error) {
  console.error("Error fetching class-wise student data:", error);
  $rootScope.ShowLoader = false;
});

    };

    $scope.ChangePresentStatus = function (statusId) {
      $scope.PresentStatus = statusId;
      $scope.PStatus = statusId;
    };

    $scope.SetAttendenceStatus = function (
      popupcontainer,
      event,
      attendence,
      model
    ) {
      $scope.Model = model;
      $scope.CurrentAttendence = attendence;
      var dataAttr = $(event.currentTarget).attr("data-attr");
      var popupLeftPos = 0;
      var targetLeftPos = $(event.target).offset().left;
      var targetTopPos = $(event.target).offset().top - $(document).scrollTop();
      var pageWidth = $(document).outerWidth();
      var windowHeight = $(window).height();
      var eventWidth = $(event.target).outerWidth();
      var eventHeight = $(event.target).height();
      var popcontainerWidth = $(popupcontainer).outerWidth();
      var popcontainerHeight = $(popupcontainer).outerHeight();
      var popupTopPos = targetTopPos + eventHeight;
      var displayLeftArea = targetLeftPos + popcontainerWidth;
      var visiblePopupArea = popupTopPos + popcontainerHeight;
      $(popupcontainer).fadeIn("fast");
      if (displayLeftArea > pageWidth) {
        popupLeftPos = targetLeftPos - popcontainerWidth + eventWidth;
        $(popupcontainer).addClass("rightAligned");
      } else {
        popupLeftPos = targetLeftPos;
        $(popupcontainer).removeClass("rightAligned");
      }
      if (visiblePopupArea > windowHeight) {
        newTopPos = popupTopPos - popcontainerHeight - eventHeight;
        $(popupcontainer).addClass("setTooltipBottom");
      } else {
        newTopPos = popupTopPos;
        $(popupcontainer).removeClass("setTooltipBottom");
      }

      $(popupcontainer).css({ left: popupLeftPos, top: newTopPos });
    };

    $scope.MarkAsAbsent = function (popupcontainer) {
      $scope.updateStatus == 0;
      if ($scope.CurrentAttendence) {
        $(popupcontainer).slideUp();

        saveAttendence();

        if ($scope.updateStatus == 1) $scope.CurrentAttendence.status = false;
      }
    };

    $scope.MarkStudentAttendance = function (attendence, model, val) {
      $scope.PresentStatus = null;
      $scope.PresentStatus = val;
      $scope.MarkAsPresent(attendence, model);
    };

    $scope.MarkAsPresent = function (attendence, model) {
      $rootScope.ErrorMessage = "";
      $scope.Model = model;
      $scope.updateStatus == 1;
      $scope.PStatus = 1;

      if ($scope.CurrentAttendence) {
        $scope.CurrentAttendence = attendence;

        saveAttendence();

        if ($scope.updateStatus == 1) {
          $scope.CurrentAttendence.status = true;
        }
      }
    };

    function saveAttendence() {
      if ($scope.PresentStatus == null) {
        $rootScope.ErrorMessage = "Please Select Any Statuses!";
        $scope.updateStatus = 0;
        return false;
      } else {
        var attendenceDate = moment($scope.CurrentAttendence.actualDate).format(
          "DD/MM/YYYY"
        );
        $scope.CurrentAttendence.date = attendenceDate;

        if ($scope.PresentStatus != undefined) {
          $scope.PStatus = 0;
        }

        // if ($scope.AttendenceReason == undefined || $scope.AttendenceReason == null) {
        //     $scope.AttendenceReasonKey = $scope.AttendenceReasonKey;
        // }
        // else {
        //     $scope.AttendenceReasonKey = $scope.AttendenceReason.Key;
        // }

        $http({
          method: "POST",
          url: dataService + "/SaveStudentAttendence",
          data: {
            StudentID: $scope.Model.StudentIID,
            AttendanceDateString: $scope.CurrentAttendence.date,
            PresentStatusID: $scope.PStatus == 0 ? $scope.PresentStatus : 1,
            AttendanceReasonID:
              $scope.PStatus == 0 ? $scope.AttendenceReason : null,
            Reason: $scope.Reason,
            ClassID: $scope.selectedClass,
            SectionID: $scope.selectedSection,
          },
          headers: {
            Accept: "application/json;charset=UTF-8",
            "Content-type": "application/json; charset=utf-8",
            CallContext: JSON.stringify(context),
          },
        })
          .success(function (result) {
            if (result.operationResult == 2) {
              $rootScope.ErrorMessage = result.Message;
              $rootScope.ShowLoader = false;
              $scope.Message = result.Message;
            } else if (result.operationResult == 1) {
              $scope.Message = result.Message;
              // $rootScope.ErrorMessage = result.Message;
              $rootScope.ShowLoader = false;

              $timeout(function () {
                $scope.getStudentAttendance();
              });
            }
          })
          .error(function (err) {
            $rootScope.ErrorMessage =
              "Something went wrong, please try again later!";
            $rootScope.ShowLoader = false;
          });
      }
    }

    $scope.GetWeekDays = function (day) {
      day = day + 1;

      var date = new Date($scope.SelectedYear, $scope.SelectedMonth, day);
      var UTCDate = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      );
      var weekName = moment(UTCDate).format("ddd");
      return weekName;
    };

    $scope.SendAttendanceNotificationsToParents = function () {
      var classId = $scope.selectedClass;
      var sectionId = $scope.selectedSection;
      // showOverlay();

      if (classId == undefined || classId == null || classId == "") {
        $rootScope.ErrorMessage = "Please select Class !";
        $(".error-msg")
          .addClass("showMsg")
          .delay(1500)
          .queue(function () {
            $(this).removeClass("showMsg");
            $(this).dequeue();
          });
        // hideOverlay();
        return false;
      }

      if (sectionId == undefined || sectionId == null || sectionId == "") {
        $rootScope.ErrorMessage = "Please select Section !";
        $(".error-msg")
          .addClass("showMsg")
          .delay(1500)
          .queue(function () {
            $(this).removeClass("showMsg");
            $(this).dequeue();
          });
        // hideOverlay();
        return false;
      }
      $scope.NotificationButton = "Sending notification.....";

    $http({
  method: "POST",
  url: dataService + "/SendAttendanceNotificationsToParents",
  params: {
    classId: classId,
    sectionId: sectionId
  }
}).then(function (response) {
  const result = response.data;

  if (result !== null && result !== undefined) {
    $rootScope.SuccessMessage = result;

    // Show success message
    $(".success-msg")
      .addClass("showMsg")
      .delay(1500)
      .queue(function () {
        $(this).removeClass("showMsg");
        $(this).dequeue();
      });

    $timeout(function () {
      $scope.NotificationButton = "Send today's attendance to parents";
    });
  }
}).catch(function (error) {
  console.error("Failed to send attendance notifications:", error);
});

      // hideOverlay();
    };

    $scope.init();
  },
]);
