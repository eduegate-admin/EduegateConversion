app.controller("GenerateTicketsController", [
  "$scope",
  "$http",
  "$location",
  "$rootScope",
  "$timeout",
  "$state",
  "GetContext",
  "rootUrl",
  function (
    $scope,
    $http,
    $location,
    $rootScope,
    $timeout,
    $state,
    GetContext,
    rootUrl
  ) {
    var context = GetContext.Context();
    var dataService = rootUrl.SchoolServiceUrl;
    var appDataUrl = rootUrl.RootUrl;
    $scope.SignUpDetails = [];
    $scope.Students = [];
    $scope.Employees = [];
    $scope.IsShowSlotDetails = false;
    $scope.IsError = false;
    $scope.ErrorMessage = "";
    $scope.TicketGeneration = {
      Subject: null,
      Description1: null,
      DocumentTypeID: null,
    };

    $scope.init = function (model) {
      $scope.GetLookUpDatas();
      $scope.GetParentStudentsDetails();
    };

    $scope.GetLookUpDatas = function () {
      $http({
        method: "Get",
        url:
          dataService +
          "/GetDynamicLookUpDataForMobileApp?lookType=TicketDocumentTypes&defaultBlank=false",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(function (result) {
        $scope.TicketDocumentTypes = result.data;
      });

      $http({
        method: "Get",
        url:
          dataService +
          "/GetDynamicLookUpDataForMobileApp?lookType=TicketDepartments&defaultBlank=false",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(function (result) {
        $scope.Departments = result.data;
        $scope.Departments =
          $scope.Departments.length > 0
            ? $scope.Departments.filter((item) => item.Key !== "")
            : $scope.Departments;
      });

      $http({
        method: "Get",
        url:
          dataService +
          "/GetDynamicLookUpDataForMobileApp?lookType=TicketTypes&defaultBlank=false",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(function (result) {
        $scope.TicketTypes = result.data;
      });

      $http({
        method: "Get",
        url:
          dataService +
          "/GetDynamicLookUpDataForMobileApp?lookType=SupportCategories&defaultBlank=false",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(function (result) {
        $scope.SupportCategories = result.data;
        $scope.SupportSubCategories = [];
      });

      $http({
        method: "Get",
        url:
          dataService +
          "/GetDynamicLookUpDataForMobileApp?lookType=FacultyTypes&defaultBlank=false",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      }).then(function (result) {
        $scope.FacultyTypes = result.data;
      });

      $http({
        method: "GET",
        url:
          appDataUrl +
          "/GetSettingValueByKey?settingKey=" +
          "DOCUMENT_TYPE_CMPSPRT",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $scope.ComplaintSupportTypeID = result;
        })
        .error(function () {});
    };

    $scope.SubmitAndGenerateTicket = function () {
      var ticketGenerationVM = $scope.TicketGeneration;

      ticketGenerationVM.TicketIID = 0;

      $scope.IsError = false;
      $scope.ErrorMessage = null;

      var studentID =
        ticketGenerationVM.Student != null
          ? ticketGenerationVM.Student.Key
          : null;

      if (!studentID) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Select any Student!";
      } else if (!ticketGenerationVM.DocumentType) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Select any type!";
      } else if ($scope.IsAcademic && !ticketGenerationVM.FacultyType) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Select any faculty type!";
      } else if ($scope.IsAcademic && !ticketGenerationVM.AssignedEmployee) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Select any faculty!";
      } else if ($scope.IsNonAcademic && !ticketGenerationVM.Department) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Select any department!";
      } else if ($scope.IsGeneral && !ticketGenerationVM.DocumentType) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Select any type!";
      } else if (
        !ticketGenerationVM.SupportCategory ||
        !ticketGenerationVM.SupportCategory.Key
      ) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Select any Category!";
      } else if (!ticketGenerationVM.Subject) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Subject is required for submission!";
      } else if (!ticketGenerationVM.ProblemDescription) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Query is required for submission!";
      } else if (ticketGenerationVM.Subject.length < 10) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Subject must be at least 10 letters long!";
      } else if (ticketGenerationVM.ProblemDescription.length < 20) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Query must be at least 20 letters long!";
      }  else {
        var submitButton = document.getElementById("TicketSubmissionButton");
        submitButton.innerHTML = "Submitting...";
        submitButton.disabled = true;

        // var closeButton = document.getElementById("TicketModelCloseButton"); // Not used in POST

        // CONSTRUCT THE PAYLOAD FOR TicketDTO
        var payload = {
            TicketIID: 0, 
            Subject: ticketGenerationVM.Subject,
            Description: ticketGenerationVM.ProblemDescription, 
            DocumentTypeID: ticketGenerationVM.DocumentType ? parseInt(ticketGenerationVM.DocumentType) : null, 
            StudentID: ticketGenerationVM.Student ? parseInt(ticketGenerationVM.Student.Key) : null,
            SupportCategoryID: ticketGenerationVM.SupportCategory ? parseInt(ticketGenerationVM.SupportCategory.Key) : null,
            FacultyTypeID: ticketGenerationVM.FacultyType ? parseInt(ticketGenerationVM.FacultyType.Key) : null,
            DepartmentID: ticketGenerationVM.Department ? parseInt(ticketGenerationVM.Department.Key) : null,
            TicketTypeID: ticketGenerationVM.TicketTypeID, 

            StudentSchoolID: ticketGenerationVM.StudentSchoolID || null,
            StudentAcademicYearID: ticketGenerationVM.StudentAcademicYearID || null,
            StudentClassID: ticketGenerationVM.StudentClassID || null,
            StudentSectionID: ticketGenerationVM.StudentSectionID || null
        };

        $http({
            method: "POST",
            url: `${dataService}/GenerateTicket`,
            data: payload, 
            headers: {
                Accept: "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                CallContext: JSON.stringify(context),
            },
        }).then(function (result) {
                if (result.data.operationResult == 1) {

                    $rootScope.SuccessMessage = 'Saved Successfully';
                    $(".success-msg").removeClass('showMsg');
                    $(".success-msg").addClass('showMsg').delay(2000).queue(function () {
                        $(this).removeClass('showMsg');
                        $(this).dequeue();
                    });
                    $rootScope.ShowLoader = false;
                    $state.go("tickets");
                    $scope.GetAllTickets();
                } else {
                    $rootScope.ShowToastMessage("Sending failed!");

                    button.innerHTML = "Submit";
                    button.disabled = false;
                    $rootScope.ShowLoader = false;

                }
            })
          .catch(function () {
            $rootScope.ShowToastMessage("Sending failed!");
            button.innerHTML = "Submit";
            button.disabled = false;
            $rootScope.ShowLoader = false;
          });
      }
    };

    $scope.OnFacultyTypeChanges = function (selectedFacultyType) {
      $scope.IsError = false;
      $scope.ErrorMessage = "";

      $scope.SelectedFacultyType = selectedFacultyType;

      var facultyTypeID =
        $scope.SelectedFacultyType != null &&
        $scope.SelectedFacultyType.Key != null
          ? $scope.SelectedFacultyType.Key
          : null;
      if (!facultyTypeID) {
        return true;
      }

      $scope.TicketGeneration.FacultyType = facultyTypeID;

      var facultyType =
        $scope.SelectedFacultyType != null
          ? $scope.SelectedFacultyType.Value
          : null;

      var studentID =
        $scope.TicketGeneration.Student != null
          ? $scope.TicketGeneration.Student.Key
          : null;
      if (!studentID) {
        $scope.IsError = true;
        $scope.ErrorMessage = "Select a student!";

        return true;
      }

      $scope.Employees = [];

        if (facultyType.toLowerCase().includes("principal") && !facultyType.toLowerCase().includes("vice")) {
            $scope.FillPrincipal();
        }
        else if (facultyType.toLowerCase().includes("vice")  && facultyType.toLowerCase().includes("principal")) {
            $scope.FillVicePrincipal();
        }
        else if (facultyType.toLowerCase().includes("head") && facultyType.toLowerCase().includes("mistress")) {
            $scope.FillHeadMistress();
        }
        else if (facultyType.toLowerCase().includes("class") && facultyType.toLowerCase().includes("teacher")) {
            $scope.FillClassTeachers();
        }
        else if (facultyType.toLowerCase().includes("class") && facultyType.toLowerCase().includes("coordinator")) {
            $scope.FillClassCoordinator();
        }
        else if (facultyType.toLowerCase().includes("associate") && facultyType.toLowerCase().includes("teacher")) {
            $scope.FillAssociateTeacher();
        }
        else if (facultyType.toLowerCase().includes("other") && facultyType.toLowerCase().includes("teacher")) {
            $scope.FillOtherTeachers();
        }
    };

    $scope.StudentSelectionChange = function () {
      var studentID = $scope.TicketGeneration.Student.Key;

      if (studentID) {
        var student = $scope.StudentDetails.find(
          (x) => x.StudentIID == studentID
        );

        $scope.TicketGeneration.StudentID = student.StudentIID;
        $scope.TicketGeneration.StudentSchoolID = student.SchoolID;
        $scope.TicketGeneration.StudentAcademicYearID = student.AcademicYearID;
        $scope.TicketGeneration.StudentClassID = student.ClassID;
        $scope.TicketGeneration.StudentSectionID = student.SectionID;

        $scope.OnFacultyTypeChanges($scope.SelectedFacultyType);

        $scope.IsError = false;
        $scope.ErrorMessage = "";
      }
    };

    $scope.GetParentStudentsDetails = function () {
      $scope.Students = [];

      $http({
        method: "GET",
        url: dataService + "/GetMyStudents",
        headers: {
          Accept: "application/json;charset=UTF-8",
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          $timeout(function () {
            $scope.$apply(function () {
              $scope.StudentDetails = result;

              if ($scope.StudentDetails.length > 0) {
                $scope.StudentDetails.forEach((x) => {
                  $scope.Students.push({
                    Key: x.StudentIID,
                    Value: x.StudentFullName,
                  });
                });
              }

              if ($scope.StudentDetails.length == 1) {
                $scope.TicketGeneration.Student = {
                  Key: $scope.StudentDetails[0].StudentIID,
                  Value: $scope.StudentDetails[0].StudentFullName,
                };

                $scope.TicketGeneration.StudentSchoolID =
                  $scope.StudentDetails[0].SchoolID;
                $scope.TicketGeneration.StudentAcademicYearID =
                  $scope.StudentDetails[0].AcademicYearID;
                $scope.TicketGeneration.StudentClassID =
                  $scope.StudentDetails[0].ClassID;
                $scope.TicketGeneration.StudentSectionID =
                  $scope.StudentDetails[0].SectionID;
              }
            });
          });
        })
        .error(function () {
          $rootScope.ShowLoader = false;
        });
    };

    $scope.TicketTypeChanges = function () {
      var ticketType =
        $scope.SelectedTicketType != null
          ? $scope.SelectedTicketType.Value
          : "general";

      $scope.TicketGeneration.TicketType = $scope.SelectedTicketType.Key;

      //Clear selected values
      $scope.SelectedFacultyType = { Key: null, Value: null };
      $scope.TicketGeneration.FacultyType = null;
      $scope.TicketGeneration.AssignedEmployee = { Key: null, Value: null };

      $scope.TicketGeneration.DocumentType = $scope.ComplaintSupportTypeID;

      if (ticketType.toLowerCase() == "academic") {
        $scope.IsAcademic = true;
        $scope.IsNonAcademic = false;
        $scope.IsGeneral = false;
      } else if (ticketType.toLowerCase() == "non academic") {
        $scope.IsAcademic = false;
        $scope.IsNonAcademic = true;
        $scope.IsGeneral = false;
      } else {
        $scope.IsAcademic = false;
        $scope.IsNonAcademic = false;
        $scope.IsGeneral = true;

        $scope.TicketGeneration.DocumentType = null;
      }
    };

$scope.FillPrincipal = function () {

    var url = dataService + "/GetSchoolPrincipal?schoolID=" + $scope.TicketGeneration.StudentSchoolID;
    $http({ method: 'Get', url: url })
        .then(function (result) {

            if (!result.data.IsError) {

                var empKeyValue = result.data;
                $scope.TicketGeneration.AssignedEmployee = empKeyValue;

                $scope.Employees.push(empKeyValue);

                $scope.OnEmployeesFilled();
            }

        }, function () {
        });
};
    
    // $scope.FillPrincipalOrMistress = function () {
    //   var url =
    //     dataService +
    //     "/GetSchoolPrincipalOrHeadMistress?schoolID=" +
    //     $scope.TicketGeneration.StudentSchoolID;
    //   $http({ method: "Get", url: url }).then(
    //     function (result) {
    //       if (!result.data.IsError) {
    //         var empKeyValue = result.data;
    //         $scope.TicketGeneration.AssignedEmployee = empKeyValue;

    //         $scope.Employees.push(empKeyValue);

    //         $scope.OnEmployeesFilled();
    //       }
    //     },
    //     function () {}
    //   );
    // };

    $scope.FillVicePrincipal = function () {
      var url =
        dataService +
        "/GetSchoolWisePrincipal?schoolID=" +
        $scope.TicketGeneration.StudentSchoolID;
      $http({ method: "Get", url: url }).then(
        function (result) {
          if (!result.data.IsError) {
            var empKeyValue = result.data;
            $scope.TicketGeneration.AssignedEmployee = empKeyValue;

            $scope.Employees.push(empKeyValue);

            $scope.OnEmployeesFilled();
          }
        },
        function () {}
      );
    };

    $scope.FillHeadTeacher = function () {
      var classID = $scope.TicketGeneration.StudentClassID;
      var sectionID = $scope.TicketGeneration.StudentSectionID;
      var academicYearID = $scope.TicketGeneration.StudentAcademicYearID;

      var url =
        dataService +
        "/GetClassHeadTeacher?classID=" +
        classID +
        "&sectionID=" +
        sectionID +
        "&academicYearID=" +
        academicYearID;
      $http({ method: "Get", url: url }).then(
        function (result) {
          if (!result.data.IsError) {
            var empKeyValue = result.data;
            $scope.TicketGeneration.AssignedEmployee = empKeyValue;

            $scope.Employees.push(empKeyValue);

            $scope.OnEmployeesFilled();
          }
        },
        function () {}
      );
    };

       $scope.FillHeadMistress = function () {
        var url =dataService+ "/GetSchoolHeadMistress?schoolID=" + $scope.TicketGeneration.StudentSchoolID;
       $http({ method: 'Get', url: url })
           .then(function (result) {

               if (!result.data.IsError) {

                   var empKeyValue = result.data;
                   $scope.TicketGeneration.AssignedEmployee = empKeyValue;

                   $scope.Employees.push(empKeyValue);

                   $scope.OnEmployeesFilled();
               }

           }, function () {
           });
   };

    $scope.FillClassCoordinator = function () {
      var classID = $scope.TicketGeneration.StudentClassID;
      var sectionID = $scope.TicketGeneration.StudentSectionID;
      var academicYearID = $scope.TicketGeneration.StudentAcademicYearID;

      var url =
        dataService +
        "/GetClassCoordinator?classID=" +
        classID +
        "&sectionID=" +
        sectionID +
        "&academicYearID=" +
        academicYearID;
      $http({ method: "Get", url: url }).then(
        function (result) {
          if (!result.data.IsError) {
            var empKeyValue = result.data;
            $scope.TicketGeneration.AssignedEmployee = empKeyValue;

            $scope.Employees.push(empKeyValue);

            $scope.OnEmployeesFilled();
          }
        },
        function () {}
      );
    };
     $scope.FillClassTeachers = function () {
       var classID = $scope.TicketGeneration.StudentClassID;
       var sectionID = $scope.TicketGeneration.StudentSectionID;
       var academicYearID = $scope.TicketGeneration.StudentAcademicYearID;

       var url =
         dataService +
         "/GetClassTeachers?classID=" +
         classID +
         "&sectionID=" +
         sectionID +
         "&academicYearID=" +
         academicYearID;
       $http({ method: "Get", url: url }).then(
         function (result) {
           if (!result.data.IsError) {
             var empKeyValue = result.data;
             $scope.TicketGeneration.AssignedEmployee = empKeyValue;

             $scope.Employees.push(empKeyValue);

             $scope.OnEmployeesFilled();
           }

         },
         function () {
         }
       );
     };

    $scope.FillAssociateTeacher = function () {
      var classID = $scope.TicketGeneration.StudentClassID;
      var sectionID = $scope.TicketGeneration.StudentSectionID;
      var academicYearID = $scope.TicketGeneration.StudentAcademicYearID;

      var url =
        dataService +
        "/GetClassAssociateTeachers?classID=" +
        classID +
        "&sectionID=" +
        sectionID +
        "&academicYearID=" +
        academicYearID;
      $http({ method: "Get", url: url }).then(
        function (result) {
          if (!result.data.IsError) {
            $scope.Employees = result.data;

            $scope.OnEmployeesFilled();
          }
        },
        function () {}
      );
    };

    $scope.FillOtherTeachers = function () {
      var classID = $scope.TicketGeneration.StudentClassID;
      var sectionID = $scope.TicketGeneration.StudentSectionID;
      var academicYearID = $scope.TicketGeneration.StudentAcademicYearID;

      var url =
        dataService +
        "/GetOtherTeachersByClass?classID=" +
        classID +
        "&sectionID=" +
        sectionID +
        "&academicYearID=" +
        academicYearID;
      $http({ method: "Get", url: url }).then(
        function (result) {
          if (!result.data.IsError) {
            $scope.Employees = result.data;

            $scope.OnEmployeesFilled();
          }
        },
        function () {}
      );
    };

    $scope.OnEmployeesFilled = function () {
      if ($scope.Employees.length == 1) {
        $scope.TicketGeneration.AssignedEmployee = $scope.Employees[0];
      }
    };

    $scope.OnCategoryChanges = function () {
      var categoryID =
        $scope.TicketGeneration.SupportCategory != null
          ? $scope.TicketGeneration.SupportCategory.Key
          : null;
      if (categoryID) {
        $scope.SupportSubCategories = [];

        var url =
          dataService +
          "/GetSupportSubCategoriesByCategoryID?supportCategoryID=" +
          categoryID;
        $http({ method: "Get", url: url }).then(
          function (result) {
            if (!result.data.IsError) {
              $scope.SupportSubCategories = result.data;

              if ($scope.SupportSubCategories.length == 1) {
                $scope.TicketGeneration.SupportSubCategory =
                  $scope.SupportSubCategories[0];
              }
            }
          },
          function () {}
        );
      }
    };

        $scope.GenerateButtonClick = function () {

        $scope.IsError = false;
        $scope.ErrorMessage = null;

        $scope.TicketGeneration = angular.copy($scope.EmptyTicketModelTemplate);

        $scope.SelectedTicketType = { "Key": null, "Value": null };
        $scope.SelectedFacultyType = { "Key": null, "Value": null };
        $scope.SelectedDepartment = { "Key": null, "Value": null };
        $scope.SelectedDocumentType = { "Key": null, "Value": null };

        $scope.IsAcademic = false;
        $scope.IsNonAcademic = false;
        $scope.IsGeneral = false;

        //$('#TicketGenerationModal').modal('show');
    };


    $scope.DocumentTypeChange = function (documentType) {
      $scope.TicketGeneration.DocumentType = documentType.Key;

      var radioButton = document.getElementById(
        "documentType_" + documentType.Key
      );
      if (radioButton) {
        radioButton.checked = true;
      }

      $scope.IsError = false;
      $scope.ErrorMessage = null;
    };

    $scope.OnDepartmentChanges = function (selectedDepartment) {
      $scope.IsError = false;
      $scope.ErrorMessage = "";

      $scope.SelectedDepartment = selectedDepartment;

      var departmentID =
        $scope.SelectedDepartment != null &&
        $scope.SelectedDepartment.Key != null
          ? $scope.SelectedDepartment.Key
          : null;
      if (!departmentID) {
        return true;
      }

      $scope.TicketGeneration.Department = departmentID;
    };
  },
]);
