app.controller("ExamQuestionController", [
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
  "$window",
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
    $timeout,
    $window
  ) {
    console.log("ExamQuestionController loaded.");

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    // These are the primary variables your HTML is bound to.
    $scope.ExamQuestionDatas = [];
    $scope.CandidateExamMapData = {};

    $scope.ExamDuration = 0;
    $scope.TotalQuestions = 0;
    $scope.ExamStartTime = null;
    $scope.ExamEndTime = null;
    $scope.CurrentDate = new Date();
    $scope.currentQuestionIndex = 0;
    $rootScope.ShowPreLoader = true;
    $scope.showQuestionList = false;
    // State parameters for the API call
    $scope.CandidateID = $stateParams.candidateID;
    $scope.ExamID = $stateParams.examID;
    $scope.CandidateOnlinExamMapID = $stateParams.candidateOnlinExamMapID;
    // Fetches initial exam data using state parameters
    let syncTimeoutPromise = null;
    $scope.Init = function () {
      $scope.GetQuestionList();
    };
    $scope.GetQuestionList = function () {
      $http({
        method: "GET",
        url: dataService + "/GetQuestionList",
        params: {
          candidateID: $scope.CandidateID,
          examID: $scope.ExamID,
          candidateOnlinExamMapID: $scope.CandidateOnlinExamMapID,
        },
        headers: {
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          // --- FIX 1: Assign results to the correct scope variables ---
          // The HTML binds to ExamQuestionDatas and CandidateExamMapData
          $scope.ExamQuestionDatas = result.ExamQuestions;
          $scope.CandidateExamMapData = result.ExamMapData;

          // --- FIX 2: Use the correct variables for all subsequent logic ---
          $scope.TotalQuestions = $scope.ExamQuestionDatas.length;
          $scope.ExamStartTime = $scope.CandidateExamMapData.ExamStartTime;
          $scope.ExamEndTime = $scope.CandidateExamMapData.ExamEndTime;

          // Calculate duration
          var duration = $scope.CandidateExamMapData.Duration || 0;
          if ($scope.CandidateExamMapData.AdditionalTime) {
            duration += $scope.CandidateExamMapData.AdditionalTime;
          }
          $scope.ExamDuration = duration;

          // Format start time for display
          $scope.ExamStartTimeFormatted = new Date(
            $scope.ExamStartTime
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          // Start the server time sync and fetch other details
          $scope.syncServerTime();
          $scope.CandidateDetails($scope.CandidateID);

          // Start the countdown timer
          $timeout(function () {
            startTimer($scope.ExamDuration);
          }, 0);

          $rootScope.ShowPreLoader = false; // Hide loader after data is ready
        })
        .error(function (err) {
          console.error("Error fetching question list", err);
          $rootScope.ShowPreLoader = false;
        });
    };

    $scope.GetCandidateExamMap = function () {
      $http({
        method: "GET",
        url: dataService + "/GetExamSessionDetails", // Assumed endpoint to get questions and exam map data
        params: {
          examID: $stateParams.examID,
          candidateOnlinExamMapID: $stateParams.candidateOnlinExamMapID,
        },
        headers: {
          "Content-type": "application/json; charset=utf-8",
          CallContext: JSON.stringify(context),
        },
      })
        .success(function (result) {
          if (result && result.ExamQuestions && result.ExamMapData) {
            $scope.Init(result.ExamQuestions, result.ExamMapData);
          } else {
            console.error("Failed to load exam data.");
            // Optionally, redirect the user back
            // $state.go('');
          }
          $rootScope.ShowPreLoader = false;
        })
        .error(function (err) {
          console.error("Error fetching exam data:", err);
          $rootScope.ShowPreLoader = false;
          // Optionally, show an error message and redirect
          // $state.go('');
        });
    };

    // Synchronize server time periodically

    $scope.syncServerTime = function () {
      $http({
        method: "POST",
        url: dataService + "/SyncServerTime",
        headers: { CallContext: JSON.stringify(context) },
      })
        .success(function (result) {
          $scope.CurrentDate = new Date(result);
          $scope.CurrentTime = $scope.CurrentDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
        })
        .finally(function () {
          // Schedule the next sync
          syncTimeoutPromise = $timeout($scope.syncServerTime, 1000);
        });
    };

    $scope.CandidateDetails = function (candidateID) {
      $http({
        method: "GET",
        url: dataService + "/GetCandidateDetails?candidateID=" + candidateID,
        headers: { CallContext: JSON.stringify(context) },
      }).then(function (result) {
        $scope.CandidateDetail = result.data;
      });
    };

    // Handle question selection from the side panel
    // Handle question selection from the side panel
    $scope.selectQuestion = function (index) {
      $scope.currentQuestionIndex = index;
    };

    $scope.OptionalChanges = function (option, question, type) {
      // ... (Your existing logic is correct here)
      if (type === "MultipleChoice") {
        question.SelectedOption = option.QuestionOptionMapIID;
        question.QuestionOptions.forEach((opt) => {
          opt.IsSelected =
            opt.QuestionOptionMapIID === option.QuestionOptionMapIID;
        });
      } else if (type === "MultiSelect") {
        option.IsSelected = !option.IsSelected;
      }
      $scope.SaveCandidateQuestionAnswer(option, question, type);
    };

    // Save a single answer to the server
    $scope.SaveCandidateQuestionAnswer = function (option, question, type) {
      let selectedOptions = question.QuestionOptions.filter(
        (x) => x.IsSelected
      ).map((x) => x.QuestionOptionMapIID);

      if (type === "textAnswer" && !question.QuestionAnswer) {
        // Consider adding a non-disruptive notification
        console.warn("Type an answer to save!");
        return;
      }

      $rootScope.ShowLoader = true;
      $http({
        url: dataService + "/SaveCandidateAnswer",
        method: "POST",
        data: {
          CandidateID: question.CandidateID,
          QuestionOptionMapID: option ? option.QuestionOptionMapIID : null,
          OtherAnswers: question.QuestionAnswer,
          CandidateOnlineExamMapID: question.CandidateOnlinExamMapID,
          OnlineExamID: question.OnlineExamIID,
          OnlineExamQuestionID: question.QuestionIID,
          QuestionOptionMapIDs: selectedOptions,
        },
        headers: { CallContext: JSON.stringify(context) },
      })
        .success(function (result) {
          if (type == "textAnswer") {
            console.log("Answer saved successfully");
          }
        })
        .error(function (err) {
          console.error("Failed to save answer:", err);
        })
        .finally(function () {
          $rootScope.ShowLoader = false;
          // After saving, update the button's class
          var qIndex = $scope.ExamQuestionDatas.findIndex(
            (q) => q.QuestionIID === question.QuestionIID
          );
          if (qIndex !== -1) {
            $scope.ExamQuestionDatas[qIndex].class = $scope.getQuestionClass(
              question,
              qIndex
            );
          }
        });
    };

    // Automatically save answers when the timer runs out
    $scope.AutoSaveAnswer = function () {
      $scope.IsAutoSave = true;
      $scope.UpdateExamStatus();
    };

    // Update the exam status to 'Completed'
    $scope.UpdateExamStatus = function () {
      $rootScope.ShowLoader = true;
      $http({
        method: "POST",
        url: dataService + "/UpdateCandidateExamMapStatus",
        data: $scope.CandidateExamMapData,
        headers: { CallContext: JSON.stringify(context) },
      })
        .success(function (result) {
          if (!$scope.IsAutoSave) {
            $scope.FinishExam();
          }
        })
        .error(function (err) {
          console.error("Error updating exam status:", err);
        })
        .finally(function () {
          $rootScope.ShowLoader = false;
        });
    };

    // Countdown timer logic
    function startTimer(duration) {
      var endTime = new Date($scope.ExamEndTime).getTime();

      var endtimeHr = document.querySelector("#endTimeHr");
      var endTimeMn = document.querySelector("#endTimeMn");
      var endTimeSc = document.querySelector("#endTimeSc");

      var x = setInterval(function () {
        var now = new Date().getTime();
        var distance = endTime - now;

        var hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        )
          .toString()
          .padStart(2, "0");
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          .toString()
          .padStart(2, "0");
        var seconds = Math.floor((distance % (1000 * 60)) / 1000)
          .toString()
          .padStart(2, "0");

        if (endtimeHr) endtimeHr.textContent = hours;
        if (endTimeMn) endTimeMn.textContent = minutes;
        if (endTimeSc) endTimeSc.textContent = seconds;

        if (distance < 0) {
          clearInterval(x);
          if (endtimeHr) endtimeHr.textContent = "00";
          if (endTimeMn) endTimeMn.textContent = "00";
          if (endTimeSc) endTimeSc.textContent = "00";
          $scope.LoadExamEndAlert();
          $scope.AutoSaveAnswer();
        }
      }, 1000);
    }

    $scope.LoadTimeAlert = function () {
      var toastElList = [].slice.call(document.querySelectorAll(".toast"));
      toastElList
        .map(function (toastEl) {
          return new bootstrap.Toast(toastEl);
        })
        .forEach((toast) => toast.show());
    };

    $scope.LoadExamEndAlert = function () {
      $("#examTimeEndAlert").modal("show");
    };

    // Navigation functions
    $scope.nextQuestion = function () {
      if ($scope.currentQuestionIndex < $scope.TotalQuestions - 1)
        $scope.currentQuestionIndex++;
    };
    $scope.prevQuestion = function () {
      if ($scope.currentQuestionIndex > 0) $scope.currentQuestionIndex--;
    };
    $scope.FinishExam = function () {
      $("#examCompletedPopup").modal("show");
    };
    $scope.FinishExamPopup = function () {
      $state.go("examlist", { candidateID: $scope.CandidateID });
    };
    // Determine the CSS class for question buttons based on their state
    $scope.getQuestionClass = function (question, index) {
      if ($scope.currentQuestionIndex === index) return "btn-primary"; // Current

      let isAnswered = false;
      if (question.IsPassageQn) {
        // Logic for passage questions (returns 'btn-success', 'btn-warning', etc.)
        return getPassageQuestionClass(question);
      } else {
        // Logic for regular questions
        isAnswered =
          question.QuestionOptions.some((opt) => opt.IsSelected) ||
          (question.QuestionAnswer && question.QuestionAnswer.trim() !== "");
      }

      return isAnswered ? "btn-success" : "btn-secondary";
    };

    function getPassageQuestionClass(passageQuestion) {
      if (
        !passageQuestion.PassageQuestions ||
        passageQuestion.PassageQuestions.length === 0
      ) {
        return "btn-secondary";
      }
      let answeredCount = passageQuestion.PassageQuestions.filter(
        (q) => q.QuestionOptions.some((o) => o.IsSelected) || q.QuestionAnswer
      ).length;

      if (answeredCount === passageQuestion.PassageQuestions.length)
        return "btn-success"; // Fully answered
      if (answeredCount > 0) return "btn-warning"; // Partially answered
      return "btn-secondary"; // Not attempted
    }
    $scope.$on("$destroy", function () {
      if (syncTimeoutPromise) {
        $timeout.cancel(syncTimeoutPromise);
      }
    });
    $scope.Init();
    $(".main-carousel2").flickity({
      // options
      cellAlign: "left",
      contain: true,
      wrapAround: true,
      autoPlay: true,
      adaptiveHeight: true,
      pageDots: false,
      dragThreshold: 10,
      imagesLoaded: true,
      prevNextButtons: false,
    });
  },
]);
