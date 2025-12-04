app.controller('TimeTableController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', '$timeout',
    function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {

        console.log('Time Table Controller loaded.');

        var dataService = rootUrl.SchoolServiceUrl;
        var context = GetContext.Context();

        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        $scope.StudentID = $stateParams.studentID;

        // --- Data properties ---
        $scope.WeekDays = [];
        $scope.ClassTime = [];
        $scope.TimeTableMapping = [];
        $scope.processedTimetable = {};

        // --- NEW: State management for the Agenda View ---
        $scope.currentDayIndex = 0; // Default to the first day (e.g., Sunday)
        $scope.currentDayObject = {}; // Will hold the full object for the selected day

        // --- Color Palette for subject cards ---
        var subjectColors = {};
        var colorPalette = ['#50cd89', '#009ef7', '#ffc700', '#f1416c', '#7239ea', '#20c997'];
        var colorIndex = 0;

        // --- INITIALIZATION ---
        $scope.init = function () {
            $scope.GetLookUpDatas().then(function() {
                // This block runs ONLY after WeekDays and ClassTime have been fetched
                
                // Set the default view to today
                // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
                const todayJsIndex = ((new Date().getDay() + 1) % 7) || 7;
                
                // Find the index in our WeekDays array that corresponds to today.
                // NOTE: This assumes your API 'Key' for WeekDay matches the JavaScript getDay() index.
                // If your API uses 1 for Sunday, you would use `(todayJsIndex + 1) % 7` or similar logic.
                const matchingDayIdx = $scope.WeekDays.findIndex(day => day.Key == todayJsIndex);

                if (matchingDayIdx !== -1) {
                    $scope.selectDay(matchingDayIdx); // Select today!
                } else {
                    $scope.selectDay(0); // Fallback to the first day in the list if no match
                }
                
                // Now that we have the lookups, load the main timetable data
                $scope.loadGlobalTimeTable();

            }).catch(function(err) {
                console.error("Failed to load prerequisite data", err);
                $rootScope.ShowLoader = false;
            });
        };

        // --- DATA FETCHING FUNCTIONS (Your existing working code) ---
        $scope.GetLookUpDatas = function () {
            var weekDayPromise = $http({
                method: 'GET',
                url: `${dataService}/GetDynamicLookUpDataForMobileApp?lookType=WeekDay&defaultBlank=false`,
                headers: {
                      "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
                 }
            }).then(function (res) {
                console.log("WeekDays ->", res.data);
                $scope.WeekDays = res.data;
            });

            var classTimePromise = $http({
                method: 'GET',
                url: `${dataService}/GetClassTimes?studentID=` + $scope.StudentID,
                headers: {
                      "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
                 }
            }).then(function (res) {
                console.log("ClassTime ->", res.data);
                $scope.ClassTime = res.data;
            });
            
            // This is crucial. It waits for BOTH API calls to finish before .then() in init() can run.
            return Promise.all([weekDayPromise, classTimePromise]);
        };

        $scope.loadGlobalTimeTable = function () {
            $http({
                method: 'GET',
                url: dataService + "/GetTimeTableByStudentID?studentID=" + $scope.StudentID,
                headers: { 
                      "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
                 }
            }).then(function (response) {
                console.log("TimeTable Mapping:", response.data);
                $scope.TimeTableMapping = response.data;
                if ($scope.TimeTableMapping && $scope.TimeTableMapping.length > 0) {
                    $scope.processTimeTableData($scope.TimeTableMapping[0]);
                }
                $rootScope.ShowLoader = false;
            }, function () {
                $rootScope.ShowLoader = false;
            });
        };

        // --- DATA PROCESSING AND HELPERS (Your existing working code) ---
        $scope.processTimeTableData = function(data) {
            var processed = {};
            if (!data || !data.AllocInfoDetails) return;
            $scope.WeekDays.forEach(day => { processed[day.Key] = {}; });
            data.AllocInfoDetails.forEach(slot => {
                slot.Subject.Value = slot.Subject.Value || 'N/A';
                slot.StaffNames = slot.StaffNames ? slot.StaffNames.trim() : null;
                processed[slot.WeekDayID][slot.ClassTimingID] = slot;
            });
            $scope.processedTimetable = processed;
            console.log("Processed Timetable Data:", $scope.processedTimetable);
        };

        $scope.getSubjectColor = function (subjectName) {
            if (!subjectName || subjectName === 'Free' || subjectName === 'N/A') return '#6c757d';
            if (subjectColors[subjectName]) return subjectColors[subjectName];
            const color = colorPalette[colorIndex % colorPalette.length];
            subjectColors[subjectName] = color;
            colorIndex++;
            return color;
        };


        // --- NEW: Functions to control the Agenda View ---

        $scope.selectDay = function(index) {
            if (index >= 0 && index < $scope.WeekDays.length) {
                $scope.currentDayIndex = index;
                $scope.currentDayObject = $scope.WeekDays[index];
            }
        };

        $scope.nextDay = function() {
            if ($scope.currentDayIndex < $scope.WeekDays.length - 1) {
                $scope.currentDayIndex++;
                $scope.selectDay($scope.currentDayIndex);
            }
        };

        $scope.prevDay = function() {
            if ($scope.currentDayIndex > 0) {
                $scope.currentDayIndex--;
                $scope.selectDay($scope.currentDayIndex);
            }
        };
        $scope.formatTime = function(timeRange) {
            let parts = timeRange.split('-').map(t => {
                let [h, m] = t.trim().split(':');
                let hour = parseInt(h);
                let min = parseInt(m);
                let ampm = hour >= 12 ? 'PM' : 'AM';
                hour = hour % 12 || 12;
                return `${hour}:${min.toString().padStart(2, '0')} ${ampm}`;
            });
            return parts.join(' - ');
        };

        
        $scope.getPeriodStatus = function(clsTime, dayKey) {
            // We compare the day's KEY from the timetable with today's JS index.
            if (dayKey != new Date().getDay()) {
                return 'is-future-day'; // No highlighting for other days
            }

            try {
                const now = new Date();
                const [startTimeStr, endTimeStr] = clsTime.Value.split('-').map(s => s.trim());
                
                const [startHours, startMinutes] = startTimeStr.split(':');
                const startTime = new Date();
                startTime.setHours(startHours, startMinutes, 0, 0);

                const [endHours, endMinutes] = endTimeStr.split(':');
                const endTime = new Date();
                endTime.setHours(endHours, endMinutes, 0, 0);

                if (now >= startTime && now <= endTime) return 'is-current';
                if (now > endTime) return 'is-past';
                return 'is-upcoming';
            } catch (e) {
                console.error("Error parsing time:", clsTime.Value, e);
                return ''; // Return empty string if time format is unexpected
            }
        };
        $scope.selectDay = function(index) {
            if (index >= 0 && index < $scope.WeekDays.length) {
                $scope.currentDayIndex = index;
                $scope.currentDayObject = $scope.WeekDays[index];

                $timeout(function () {
                    var el = document.getElementById("current-period");
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }, 200); // Wait for rendering
            }
        };

        // --- LET'S GO ---
        $scope.init();
    }]);