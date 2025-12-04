app.controller("StaffTimeTableController", [
  "$scope",
  "$http",
  "$q",
  "rootUrl",
  "GetContext",
  function ($scope, $http, $q, rootUrl, GetContext) {
    $scope.PageName = "Time Table";

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();
    var loginID = context.LoginID;

    $scope.timetableData = [];
    $scope.isLoading = true;
    $scope.errorMessage = null;

    /**
     * This is the core data processing function.
     * It now dynamically creates the list of time slots from the allocation data
     * AND formats the data perfectly for the new timeline view.
     */
    const processTimeTable = function (weekDays, timeTableMappings) {
      // --- Defensive Checks ---
      if (
        !timeTableMappings ||
        !Array.isArray(timeTableMappings) ||
        timeTableMappings.length === 0 ||
        !timeTableMappings[0].AllocInfoDetails
      ) {
        console.error(
          "Data Error: 'timeTableMappings' data is invalid or 'AllocInfoDetails' is missing."
        );
        return [];
      }
      if (!weekDays || weekDays.length === 0) {
        console.error("Data Error: 'weekDays' data is missing.");
        return [];
      }

      const allocationDetails = timeTableMappings[0].AllocInfoDetails;

      // --- Dynamically build the ClassTime list ---
      const timeSlotsMap = new Map();
      allocationDetails.forEach((alloc) => {
        if (alloc.ClassTiming && alloc.ClassTiming.Key) {
          timeSlotsMap.set(alloc.ClassTiming.Key, alloc.ClassTiming);
        }
      });

      let classTimes = Array.from(timeSlotsMap.values());
      classTimes.sort(
        (a, b) =>
          parseFloat(a.Value.split("-")[0]) - parseFloat(b.Value.split("-")[0])
      );

      if (classTimes.length === 0) {
        return [];
      }

      // --- Build the rest of the timetable ---
      const mappingMap = new Map();
      allocationDetails.forEach((alloc) => {
        const key = `${alloc.WeekDayID}-${alloc.ClassTimingID}`;
        mappingMap.set(key, alloc);
      });

      // We need a counter for lesson cards to alternate colors properly
      let lessonIndex = 0;

      return weekDays.map((day) => {
        lessonIndex = 0; // Reset for each day
        return {
          dayName: day.Value,
          dayKey: day.Key,
          slots: classTimes.map((time) => {
            const mapKey = `${day.Key}-${time.Key}`;
            const mapping = mappingMap.get(mapKey);

            // --- DATA SHAPING FOR THE VIEW ---
            const timeParts = time.Value.split("-");
            let slotData = {
              startTime: timeParts[0] || "",
              endTime: timeParts[1] || "",
              className: "",
              subjectName: "Free Period",
              details: "", // You can map this from your API if available
              isFree: true,
              gradientClass: "",
            };

            if (mapping && !mapping.IsBreakTime) {
              // Example: "Class 5 - Meshaf [Mathematics]"
              const subjectMatch =
                mapping.Subject.Value.match(/^(.*?)\s*\[(.*?)\]$/);

              if (subjectMatch) {
                slotData.className = subjectMatch[1].trim().replace(" - ", " "); // "Class 5 Meshaf"
                slotData.subjectName = subjectMatch[2].trim(); // "Mathematics"
              } else {
                slotData.subjectName = mapping.Subject.Value; // Fallback for breaks, etc.
              }

              slotData.isFree = false;
              // Assign alternating gradient classes only for lessons
              slotData.gradientClass =
                lessonIndex % 2 === 0 ? "gradient-green" : "gradient-purple";
              lessonIndex++;
            }

            return slotData;
          }),
        };
      });
    };

    $scope.init = function () {
      $scope.isLoading = true;
      $scope.errorMessage = null;

      const weekDayPromise = $http.get(
        dataService +
          "/GetDynamicLookUpDataForMobileApp?lookType=WeekDay&defaultBlank=false",
        { headers: { CallContext: JSON.stringify(context) } }
      );
      const timeTablePromise = $http.get(
        dataService + "/GetTimeTableByStaffLoginID",
        { params: { loginID: loginID } }
      );

      // We no longer need the ClassTime promise since it returns empty.
      $q.all([weekDayPromise, timeTablePromise])
        .then(function (responses) {
          const weekDays = responses[0].data;
          const timeTableMappings = responses[1].data;

          // Pass only the data we need to the processing function.
          $scope.timetableData = processTimeTable(weekDays, timeTableMappings);

          if ($scope.timetableData.length === 0) {
            console.warn(
              "Processing finished, but resulted in no timetable data to display. Check the API responses and data structure."
            );
          }
        })
        .catch(function (error) {
          console.error("Error fetching timetable data:", error);
          $scope.errorMessage =
            "Could not load timetable. Please try again later.";
        })
        .finally(function () {
          $scope.isLoading = false;
        });
    };
  },
]);
