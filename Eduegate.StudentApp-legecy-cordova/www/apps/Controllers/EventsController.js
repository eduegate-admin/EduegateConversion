app.controller('EventsController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce) {
    console.log('EventsController loaded.');

   

    $scope.init = function () {


        $scope.GetCalendarDatas()

    };

    $scope.GetCalendarDatas = function ( ) {
        const element = document.getElementById("calendar");

        var calendarEl = document.getElementById("calendar");
        var calendar = new FullCalendar.Calendar(calendarEl, {
            headerToolbar: {
                left: "prev,next",
                center: "title",
                right: "dayGridMonth,dayGridWeek,timeGridDay ,listMonth ,listWeek"
            },


            height: 700,
            // contentHeight: 780,
            aspectRatio: 3,

            nowIndicator: true,

            views: {
                dayGridMonth: { buttonText: "month" },
                timeGridWeek: { buttonText: "week" },
                timeGridDay: { buttonText: "day" }
            },

            initialView: "listMonth",
            // initialDate:"2014-02-01",
            // initialDate:$scope.GetDateByMonth(),

            editable: false,
            dayMaxEvents: true, // allow "more" link when too many events
            navLinks: true,

            businessHours: [ // specify an array instead
            {
              daysOfWeek: [ 0 ,1, 2, 3, 4 ], //sunday , Monday, Tuesday, Wednesday , thursday
              startTime: '07:00', // 7am
              endTime: '18:00' // 6pm
            },
            {
              daysOfWeek: [ 6], // saturday
              startTime: '09:00', // 9am
              endTime: '12:00' // 12pm
            }
          ],

            events: [ {
                title: "All Day Event",
                start: "2023-03-10"
            },
            {
                title: "Long Event",
                start: "2020-09-07",
                end: "2023-03-10"
            },
        
            {
                title: "Conference",
                start: "2023-03-10",
                end: "2023-03-11"
            },
            

            {
                title: "Lunch",
                start: "2023-03-10T12:00:00"
            },
    
            {
                title: "Happy Hour",
                start: "2023-03-10T17:30:00",
                end: "2023-03-10T19:30:00"
            },
            {
                title: "Dinner",
                start: "2023-03-10T20:00:00"
            },
            {
                title: "Birthday Party",
                start: "2023-03-10T07:00:00",
                end: "2023-03-10T09:30:00"

            },
            {
                title: "Click for Google",
                url: "http://google.com/",
                start: "2023-03-10"
            }],
            resources: [{
                start: '2023-03-10',
                type: 'resourceTimeline',
                duration: { days: 4 }
        }],
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

}]);