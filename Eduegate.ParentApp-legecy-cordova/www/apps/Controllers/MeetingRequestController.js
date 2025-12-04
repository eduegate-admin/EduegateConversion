app.controller("MeetingRequestController", [
    '$scope', '$http', '$location', '$rootScope', '$timeout', '$state', 'GetContext', 'rootUrl',
    function ($scope, $http, $location, $rootScope, $timeout, $state, GetContext, rootUrl) {

        var context = GetContext.Context();
        var dataService = rootUrl.SchoolServiceUrl;
        var appDataUrl = rootUrl.RootUrl;
        $scope.ContentService = rootUrl.ContentServiceUrl;

        $scope.SignUpDetails = [];
        $scope.Students = [];
        $scope.IsShowSlotDetails = false;
        $scope.Employees = [];
        $scope.IsError = false;
        $scope.ErrorMessage = "";
        var dateFormat = null;

        $scope.init = function (model) {
            $scope.MeetingRequest = model || {};
            $rootScope.ShowLoader = true;
            $scope.GetParentStudentsDetails();
            $scope.FillLookupsAndSettings();
        };

        $scope.FillLookupsAndSettings = function () {
            $http({
                method: 'GET',
                url: appDataUrl + '/GetSettingValueByKey?settingKey=' + 'DateFormat',
                     headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                dateFormat = result.data;
            });

            // Dynamically fetch Faculty Types from backend
            $http({
                method: 'GET',
                url: dataService + '/GetDynamicLookUpDataForMobileApp?lookType=FacultyTypes&defaultBlank=false',
                headers: { "CallContext": JSON.stringify(context) }
            }).then(function (result) {
                $scope.FacultyTypes = result.data;
            });
        };

        $scope.GetParentStudentsDetails = function () {
            $http({
                method: 'GET',
                url: `${dataService}/GetParentStudents`,
                         headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                if (result.data && result.data.length > 0) {
                    $scope.StudentDetails = result.data;

                    if ($scope.StudentDetails.length === 1) {
                        var student = $scope.StudentDetails[0];
                        $scope.MeetingRequest.Student = {
                            "Key": student.StudentIID,
                            "Value": student.StudentFullName
                        };
                        $scope.MeetingRequest.SchoolID = student.SchoolID;
                        $scope.MeetingRequest.AcademicYearID = student.AcademicYearID;
                        $scope.MeetingRequest.ClassID = student.ClassID;
                        $scope.MeetingRequest.SectionID = student.SectionID;
                        $scope.EnableStudentButton($scope.MeetingRequest.Student);
                    }
                }
                $rootScope.ShowLoader = false;
            });
        };

        $scope.OnFacultyTypeChanges = function () {
            $scope.IsError = false;
            $scope.ErrorMessage = "";

            var facultyType = $scope.SelectedFacultyType ? $scope.SelectedFacultyType.Value : null;
            var studentID = $scope.MeetingRequest.Student ? $scope.MeetingRequest.Student.Key : null;

            if (!facultyType) {
                return;
            }

            if (!studentID) {
                $scope.IsError = true;
                $scope.ErrorMessage = "Select a student!";
                return;
            }

            $scope.Employees = [];
            $scope.MeetingRequest.Faculty = null;
            $scope.IsShowSlotDetails = false;

            if (facultyType.toLowerCase().includes("principal") && !facultyType.toLowerCase().includes("vice")) {
                $scope.FillPrincipal();
            } else if (facultyType.toLowerCase().includes("vice") && facultyType.toLowerCase().includes("principal")) {
                $scope.FillVicePrincipal();
            } else if (facultyType.toLowerCase().includes("head") && facultyType.toLowerCase().includes("mistress")) {
                $scope.FillHeadMistress();
            } else if (facultyType.toLowerCase().includes("class") && facultyType.toLowerCase().includes("teacher")) {
                $scope.FillClassTeachers();
            } else if (facultyType.toLowerCase().includes("class") && facultyType.toLowerCase().includes("coordinator")) {
                $scope.FillClassCoordinator();
            } else if (facultyType.toLowerCase().includes("associate") && facultyType.toLowerCase().includes("teacher")) {
                $scope.FillAssociateTeacher();
            } else if (facultyType.toLowerCase().includes("other") && facultyType.toLowerCase().includes("teacher")) {
                $scope.FillOtherTeachers();
            }
        };

        function fetchEmployee(endpoint, params) {
            $rootScope.ShowLoader = true;
            $http({
                method: 'GET',
                url: `${dataService}/${endpoint}`,
                params: params,
                headers: { "CallContext": JSON.stringify(context) }
            }).then(function (result) {
                if (result.data && !result.data.IsError) {
                    var responseData = result.data.Response || result.data;
                    
                    if (Array.isArray(responseData)) {
                        $scope.Employees = responseData;
                        if ($scope.Employees.length === 1) {
                            $scope.MeetingRequest.Faculty = $scope.Employees[0];
                            $scope.OnEmployeeChanges();
                        }
                    } else {
                        $scope.MeetingRequest.Faculty = responseData;
                        $scope.Employees.push(responseData);
                        $scope.OnEmployeeChanges();
                    }
                }
                $rootScope.ShowLoader = false;
            }, function() {
                $rootScope.ShowLoader = false;
            });
        }
        
        $scope.FillPrincipal = function () {
            fetchEmployee("GetSchoolPrincipal", { schoolID: $scope.MeetingRequest.SchoolID });
        };

        $scope.FillVicePrincipal = function () {
            fetchEmployee("GetSchoolVicePrincipal", { schoolID: $scope.MeetingRequest.SchoolID });
        };

        $scope.FillHeadMistress = function () {
            fetchEmployee("GetSchoolHeadMistress", { schoolID: $scope.MeetingRequest.SchoolID });
        };

        $scope.FillClassCoordinator = function () {
            var params = {
                classID: $scope.MeetingRequest.ClassID,
                sectionID: $scope.MeetingRequest.SectionID,
                academicYearID: $scope.MeetingRequest.AcademicYearID
            };
            fetchEmployee("GetClassCoordinator", params);
        };

        $scope.FillClassTeachers = function () {
             var params = {
                classID: $scope.MeetingRequest.ClassID,
                sectionID: $scope.MeetingRequest.SectionID,
                academicYearID: $scope.MeetingRequest.AcademicYearID
            };
            fetchEmployee("GetClassTeachers", params);
        };

        $scope.FillAssociateTeacher = function () {
             var params = {
                classID: $scope.MeetingRequest.ClassID,
                sectionID: $scope.MeetingRequest.SectionID,
                academicYearID: $scope.MeetingRequest.AcademicYearID
            };
            fetchEmployee("GetClassAssociateTeachers", params);
        };

        $scope.FillOtherTeachers = function () {
             var params = {
                classID: $scope.MeetingRequest.ClassID,
                sectionID: $scope.MeetingRequest.SectionID,
                academicYearID: $scope.MeetingRequest.AcademicYearID
            };
            fetchEmployee("GetClassOtherTeachers", params);
        };

        $scope.OnEmployeeChanges = function () {
            $scope.IsShowSlotDetails = true;
            $scope.MeetingSlots = [];
            $scope.IsError = false;
            $scope.ErrorMessage = "";
            if ($scope.MeetingRequest.RequestedDateString) {
                $scope.FillTimeSlotsForEmployee();
            }
        };

        $scope.FillTimeSlotsForEmployee = function () {
            var employeeID = $scope.MeetingRequest.Faculty ? $scope.MeetingRequest.Faculty.Key : null;
            var studentID = $scope.MeetingRequest.Student ? $scope.MeetingRequest.Student.Key : null;
            var requestedSlotDateString = $scope.MeetingRequest.RequestedDateString;

            if (!employeeID || !requestedSlotDateString) {
                return;
            }
            
             var formattedDate = moment(requestedSlotDateString, 'D/M/YYYY').format(dateFormat.toUpperCase())
            var params = {
                employeeID: employeeID,
                reqSlotDateString: formattedDate,
                studentID: studentID,
                classID: $scope.MeetingRequest.ClassID,
                sectionID: $scope.MeetingRequest.SectionID
            };
            
            $rootScope.ShowLoader = true;
            $http({
                method: 'GET',
                url: `${dataService}/GetMeetingRequestSlotsByEmployeeID`,
                params: params,
                headers: { "CallContext": JSON.stringify(context) }
            }).then(function (result) {
                $scope.MeetingSlots = [];
                if (result.data && !result.data.IsError) {
                    var signUps = result.data;
                    if(signUps){
                        signUps.forEach(sign => {
                            if(sign.SignupSlotMaps){
                                sign.SignupSlotMaps.forEach(map => {
                                    if(map.SignupSlotMapTimes){
                                        map.SignupSlotMapTimes.forEach(time => {
                                            $scope.MeetingSlots.push(time);
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
                $rootScope.ShowLoader = false;
            }).catch(function () {
                $rootScope.ShowLoader = false;
                $scope.IsError = true;
                $scope.ErrorMessage = "Failed to load time slots. Please try again.";
            });
        };

        $scope.StudentSelectionChange = function (student) {
            $scope.MeetingRequest.Student = { "Key": student.StudentIID, "Value": student.StudentFullName };
            $scope.MeetingRequest.SchoolID = student.SchoolID;
            $scope.MeetingRequest.AcademicYearID = student.AcademicYearID;
            $scope.MeetingRequest.ClassID = student.ClassID;
            $scope.MeetingRequest.SectionID = student.SectionID;
            
            $scope.EnableStudentButton($scope.MeetingRequest.Student);
            
            if($scope.SelectedFacultyType){
                $scope.OnFacultyTypeChanges();
            }

            $scope.IsError = false;
            $scope.ErrorMessage = "";
        };

        $scope.EnableStudentButton = function (student) {
            $timeout(function () {
                var radioButton = document.getElementById("student_" + student.Key);
                if (radioButton) {
                    radioButton.checked = true;
                }
            });
        };

    $scope.OnRequestDateChanges = function () {
            $scope.IsError = false;
            $scope.ErrorMessage = "";
            $scope.MeetingSlots = [];
            $scope.IsShowSlotDetails = true;
            var requestedDateString = $scope.MeetingRequest.RequestedDateString;

            if (!requestedDateString) {
                return; 
            }
            var requestedDate = moment(requestedDateString, 'D/M/YYYY');
            var today = moment().startOf('day');
            if (!requestedDate.isValid() || requestedDate.isSameOrBefore(today)) {
                $scope.IsError = true;
                $scope.ErrorMessage = "The selected date cannot be today or in the past.";
                $timeout(function() {
                    $scope.MeetingRequest.RequestedDateString = null; 
                });
                
                return;
            }
            $scope.FillTimeSlotsForEmployee();
        };

        $scope.SlotSelectionChange = function (slot) {
            $scope.MeetingRequest.RequestedSignupSlotMapID = slot.SignupSlotMapIID;
            $timeout(function(){
                 var radioButton = document.getElementById("slot_" + slot.SignupSlotMapIID);
                if (radioButton) {
                    radioButton.checked = true;
                }
            });
            $scope.IsError = false;
            $scope.ErrorMessage = "";
        };

        $scope.ConfirmAndRequestSlot = function () {
            var meetingRequest = angular.copy($scope.MeetingRequest);

            if (!meetingRequest.Student || !meetingRequest.Student.Key) {
                $scope.IsError = true;
                $scope.ErrorMessage = "Submission by the student is required!";
                return;
            }
            if (!meetingRequest.Faculty || !meetingRequest.Faculty.Key) {
                $scope.IsError = true;
                $scope.ErrorMessage = "Faculty is required to submission!";
                return;
            }
            if (!meetingRequest.RequestedDateString || meetingRequest.RequestedDateString == "?") {
                $scope.IsError = true;
                $scope.ErrorMessage = "Date is required for submission!";
                return;
            }
            
            var submitButton = document.getElementById("MeetingRequestSubmissionButton");
            submitButton.innerHTML = "Submitting...";
            submitButton.disabled = true;

            const inputDateFormat = 'DD/MM/YYYY'; 

            const outputDateFormat = 'MM/DD/YYYY';
            let dateFromPicker = $scope.MeetingRequest.RequestedDateString; 
            $scope.MeetingRequest.RequestedDateString = moment(dateFromPicker, inputDateFormat).format(outputDateFormat);
            $http({
                method: 'POST',
                url: `${dataService}/SubmitMeetingRequest`,
                data: meetingRequest,
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).then(function (result) {
                if (result.data.IsError) {
                    $rootScope.ShowToastMessage(result.data.Response, 'error');
                    submitButton.innerHTML = "Submit";
                    submitButton.disabled = false;
                } else {
                    $rootScope.ShowToastMessage("Slot request successful!", 'success');
                    $state.go("meetingrequestlist");
                }
            }).catch(function (result) {
                $scope.IsError = true;
                $scope.ErrorMessage = result.data.Message || "An error occurred during submission.";
                submitButton.innerHTML = "Submit";
                submitButton.disabled = false;
            });
        };
    }
]);