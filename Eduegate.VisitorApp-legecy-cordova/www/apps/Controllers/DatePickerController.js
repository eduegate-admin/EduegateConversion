app.controller('DatePickerController', [
    '$scope', '$http', 'loggedIn', 
    'rootUrl', '$location', 
    'GetContext', 'serviceCartCount', 
    '$state', '$stateParams', '$sce', 
    '$rootScope', '$translate', '$timeout',
    function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, 
            $state, $stateParams, $sce, $rootScope,  $translate, $timeout) {
    var dataService = rootUrl.RootUrl;
    var Context = GetContext.Context();
    $scope.ScheduleDate = null;
    var disabledDate = [];            
    var disableHours = [];
    var limitDate = null;
    $scope.$parent.SelectedTimeSlotMapID = null;
    $scope.SelectedTimeSlotMapID = null;

    $scope.init = function () {
        $scope.$on('show-date-time-dailogue', function() {
            $http({
                method: 'GET',
                url: dataService + '/GetDeliveryBlockingPeriods',
                headers: {
                    "Accept": "application/json;charset=UTF-8", 
                    "Content-type": "application/json; charset=utf-8", 
                    "CallContext": JSON.stringify(Context)
                }
            }).then(function (result) {
                result = result.data;
                disabledDate = result.BlockedDates;
                
                if( result.Times) {
                    disableHours = result.Times.map(x=> [moment({ h: x.StartHour }), moment({ h: x.EndHour })]);
                }

                limitDate = moment(result.MaxLimitDate).toDate();
                $scope.showDateTimePickerDialogue();
            }, function() {
                $scope.showDateTimePickerDialogue();
            });
        });       
    } 

    $scope.showDateTimePickerDialogue = function() { 
        
        var minimumDays = 1;
        var minAllowedDate = moment(moment().add(minimumDays, 'days').format('LL')).toDate();
        var defaultDate = $scope.ScheduleDate ?
            moment(moment($scope.ScheduleDate).format('LL')).toDate() 
            : moment(moment(minAllowedDate).format('LL')).toDate();
        //$scope.GetDeliveryTimeSlot(defaultDate.toISOString());        
        $scope.GetDeliveryTimeSlot(defaultDate.toISOString());
        $scope.GetSubscriptionTypes(defaultDate.toISOString());

        if(!$scope.ScheduleDate) {
            $scope.ScheduleDate = defaultDate;
        }

        $('.datetimepicker').datetimepicker('remove');

        $('.dateTimeCalendar').datetimepicker({
            locale : 'en',
            format: "DD/MM/YYYY",
            inline: true,
            sideBySide: true,
            minDate: minAllowedDate,
            disabledDates: disabledDate,
            disabledTimeIntervals: disableHours,
            maxDate: limitDate,
            defaultDate : defaultDate,
            }).on("dp.change", function (e) {
                $timeout(function() {                    
                    $scope.GetDeliveryTimeSlot(e.date.format('LL'));
                    $scope.$apply(function() {
                        $scope.ScheduleDate = new Date(e.date.format('LL'));
                        $('#timeSlot').val(null);  
                        $scope.SelectedTimeSlotMapID = null;   
                    });
                });          
        });

        $(".dateTimePickerOverlay").fadeIn("fast");
        $(".dateTimePicker").show();             
    }

    $scope.GetDeliveryTimeSlot = function(date) {
        $http({
            method: 'GET',
            url: rootUrl.RootUrl + '/GetDeliveryTimeSlots?deliveryTypeId=' + 
                $scope.DeliveryTypeID + '&date=' + date,
            headers: {
                "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(Context)
            }
        }).then(function (result) {
            result = result.data;
            $rootScope.TimeSlots = result;
        }, function() {

        });
    }

    $scope.GetSubscriptionTypes = function(date) {
        $http({
            method: 'GET',
            url: rootUrl.RootUrl + '/GetSubscriptionTypes?deliveryTypeId=' + 
                $scope.DeliveryTypeID + '&date=' + date,
            headers: {
                "Accept": "application/json;charset=UTF-8", 
                "Content-type": "application/json; charset=utf-8", 
                "CallContext": JSON.stringify(Context)
            }
        }).then(function (result) {
            result = result.data;
            $rootScope.SubscriptionTypes = result;
        }, function() {

        });
    }

    
    $scope.hideDateTimePicker= function() {
        $(".dateTimeCalendar").datetimepicker('destroy');
        $(".dateTimePicker").fadeOut("fast");
        $(".dateTimePickerOverlay").fadeOut("fast");
    }

    $scope.CartDeliverySelectionChanged = function (event, type,timeslotID, DeliveryTypeID, delivery) {  
        if(timeslotID){ 
            $scope.SelectedTimeSlotMapID = timeslotID;
        }
        else {
            $timeout(function() {
                $('#timeSlot').val(null);  
                $scope.SelectedTimeSlotMapID = null;             
            });
        }

        if(DeliveryTypeID) { 
            $scope.DeliveryTypeID = DeliveryTypeID;
        }          

        if (type) {
            var deliveryType = $scope.DeliveryTypes
                .find(x => x.DeliveryTypeID == $scope.DeliveryTypeID);
            $scope.TimeSlots = deliveryType.TimeSlots;
            $scope.HastimeSlot = deliveryType.HasTimeSlot;
        }

        $rootScope.ShowLoader = true;
        $rootScope.ErrorMessage = '';
        $rootScope.SuccessMessage = '';        

        $http({
            url:  rootUrl.RootUrl + "/UpdateCartDelivery",
            method: 'POST',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            },
            data: {
                'DeliveryTypeID': $scope.DeliveryTypeID,
                'DeliveryTypeTimeSlotMapID': $scope.SelectedTimeSlotMapID
            },
        }).then(function (result) {
            result = result.data;
            $rootScope.ShowLoader = false;           

            if (result.operationResult == 1) {
                if($scope.DeliveryTypeID == 13) {
                    //$scope.showDateTimePicker();             
                }
                else {
                    //$scope.SmartCheckout();
                }

                isCartDeliveryUpdated = true;                
            }
            else {
                $rootScope.ShowToastMessage(result.WarningMessage || result.Message , 'error');  
            }
        })
            , function (err) {
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
            };
    }

    $scope.init();
  }]);