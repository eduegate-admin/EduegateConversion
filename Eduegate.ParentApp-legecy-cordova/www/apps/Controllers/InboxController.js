app.controller("InboxController", [
  "$scope",
  "$http",
  "rootUrl",
  "GetContext",
  "$stateParams",
  "$state",
  "$window",
  function (
    $scope,
    $http,
    rootUrl,
    GetContext,
    $stateParams,
    $state,
    $window
  ) {
    $scope.teacherEmailList = [];
    $scope.parentList = [];
    $scope.teacherList = [];
    var context = GetContext.Context();
    var CommunicationServiceUrl = rootUrl.CommunicationServiceUrl;
    $scope.isRefreshing = false;
    $scope.ContentService = rootUrl.ContentServiceUrl;

    $scope.init = function () {
      const storedTeacherDetails = $window.localStorage.getItem(
        "minimalTeacherDetailsArray"
      );

      if (storedTeacherDetails) {
        // Use the data from local storage
        $scope.teacherEmailList = JSON.parse(storedTeacherDetails);
        $scope.flattenedTeacherList = [];

        $scope.teacherEmailList.forEach(function (studentGroup) {
          studentGroup.TeacherMessages.forEach(function (teacher) {
            $scope.flattenedTeacherList.push({
                EmployeeIID: teacher.EmployeeIID,
              LoginID: teacher.LoginID,
              EmployeeCode: teacher.EmployeeCode,
              EmployeeName: teacher.EmployeeName,
              WorkEmail: teacher.WorkEmail,
              StudentID: studentGroup.StudentID,
              StudentName: studentGroup.StudentName,
              EmployeeProfileImageUrl: teacher.EmployeeProfileImageUrl,
            });
          });
        });
      } else {
        // Fetch from the API if not already stored
        $scope.getTeacherEmails();
      }

      $scope.GetTeachersWhoMessagedByParentLoginID();
    };

    let lastTeacherLoginId = null; // Track last teacherLoginId

    // Listener for TeacherListUpdated event
    $scope.$on("TeacherListUpdated", function (event, data) {
      if (data.teacherLoginId !== lastTeacherLoginId) {
        // Check if it's different
        lastTeacherLoginId = data.teacherLoginId;
        $scope.GetTeachersWhoMessagedByParentLoginID(data.teacherLoginId);
      }
    });

    // Function to fetch teacher emails
    $scope.getTeacherEmails = function () {
      $scope.isRefreshing = true;

      $http({
        url: CommunicationServiceUrl + "/GetTeacherEmailByParentLoginID",
        method: "GET",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(
        function (result) {
          $scope.teacherEmailList = result.data;
          $scope.flattenedTeacherList = [];

          $scope.teacherEmailList.forEach(function (studentGroup) {
            studentGroup.TeacherMessages.forEach(function (teacher) {
              $scope.flattenedTeacherList.push({
                EmployeeCode: teacher.EmployeeCode,
                LoginID: teacher.LoginID,
                EmployeeIID: teacher.EmployeeIID,
                EmployeeName: teacher.EmployeeName,
                WorkEmail: teacher.WorkEmail,
                EmployeePhoto: teacher.EmployeePhoto,
                StudentID: studentGroup.StudentID,
                StudentName: studentGroup.StudentName,
                EmployeeProfileImageUrl: teacher.EmployeeProfileImageUrl,
              });
            });
          });

          $scope.isRefreshing = false;

          const minimalTeacherDetailsArray = $scope.teacherEmailList.map(
            (studentGroup) => {
              // Map over the TeacherMessages for the current studentGroup
              const minimalTeachers = studentGroup.TeacherMessages.map(
                (teacher) => {
                  return {
                    EmployeeCode: teacher.EmployeeCode,
                      LoginID: teacher.LoginID,
                    EmployeeIID: teacher.EmployeeIID,
                    EmployeeIID: teacher.EmployeeIID,
                    WorkEmail: teacher.WorkEmail,
                    EmployeeName: teacher.EmployeeName,
                    EmployeePhoto: teacher.EmployeePhoto,
                    EmployeeProfileImageUrl: teacher.EmployeeProfileImageUrl,
                    // Note: studentGroup.StudentID and studentGroup.StudentName are available
                    // from the outer loop context when ng-click is evaluated,
                    // so they don't need to be duplicated inside each minimal teacher object
                    // if the purpose is solely to support the provided HTML.
                  };
                }
              );

              // Return the minimal structure for this studentGroup
              return {
                StudentID: studentGroup.StudentID,
                StudentName: studentGroup.StudentName,
                TeacherMessages: minimalTeachers, // You can rename this key if you prefer, e.g., MinimalTeacherMessages
              };
            }
          );

          // Store the array in local storage
          localStorage.setItem(
            "minimalTeacherDetailsArray",
            JSON.stringify(minimalTeacherDetailsArray)
          );
        },
        function (error) {
          console.log("Error fetching teacher emails: ", error);
        }
      );
    };

    $scope.refreshTeacherDetails = function () {
      $scope.getTeacherEmails();
    };

    // Function to get teachers who messaged based on parent login ID
    $scope.GetTeachersWhoMessagedByParentLoginID = function (teacherLoginId) {
      var url =
        CommunicationServiceUrl + "/GetTeachersWhoMessagedByParentLoginID";
      if (teacherLoginId) {
        url += "?teacherLoginId=" + teacherLoginId;
      }

      $http({
        url: url,
        method: "GET",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(
        function (result) {
          $scope.TeachersWhoMessagedByParentLoginID = result.data;
        },
        function (error) {
          console.log("Error fetching teachers who messaged: ", error);
        }
      );
    };

    $scope.ChatListClick = function (
      recieverID,
      recieverEmail,
      employeeName,
      studentID,
      StudentName,
     AdmissionNumber
    ) {
      $state.go("message", {
        RecieverID: recieverID,
        RecieverEmail: recieverEmail,
        EmployeeName: employeeName,
        StudentID: studentID,
        StudentName,  
        AdmissionNumber,
      });
    };
    $scope.customNameFilter = function (teacher) {
      if (!$scope.searchText) return true;
      const search = $scope.searchText.toLowerCase();
      return (
        (teacher.EmployeeName &&
          teacher.EmployeeName.toLowerCase().includes(search)) ||
        (teacher.WorkEmail &&
          teacher.WorkEmail.toLowerCase().includes(search)) ||
        (teacher.StudentName &&
          teacher.StudentName.toLowerCase().includes(search))
      );
    };

    $scope.DisplaySearchPopover = function () {
      $("#fullPageSearch").show();

      $("#fullTextSearchInput").focus();
    };
    $scope.HideSearchPopover = function () {
      $("#fullPageSearch").hide();
    };

    $scope.isToday = function (date) {
      const d = new Date(date);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    };

    $scope.isYesterday = function (date) {
      const d = new Date(date);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return d.toDateString() === yesterday.toDateString();
    };

    // Initialize controller
    $scope.init();
  },
]);
