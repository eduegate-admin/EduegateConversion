app.controller('CartSingleCheckoutController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', 'serviceCartCount', '$state', '$stateParams', '$sce', '$rootScope', '$translate', '$timeout', '$q', '$controller', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, serviceCartCount, $state, $stateParams, $sce, $rootScope, $translate, $timeout, $q, $controller) {
    console.log('CartSingleCheckoutController loaded.')
    var Context = GetContext.Context();
    var dataService = rootUrl.RootUrl;
    var schoolDataService = rootUrl.SchoolServiceUrl;

    $scope.ShoppingCartCount = 0;
    $scope.shoppingCart = [];
    $scope.isLoaded = false;
    $scope.CartTotal = 0;
    $scope.errorcheckout = [];
    $scope.SaveForLaterCount = 0;
    $scope.SaveForLaterCart = [];
    $scope.LoggedIn = false;
    $scope.DenyCheckout = false;
    $scope.totalCount = 0;
    $scope.isFirstTime = true;
    $scope.submitUpdateQty = null;
    $scope.CashChange = null;
    $scope.SelectedDeliveryAddress = 0;
    $scope.CustomerSearchVisible = false;
    $scope.subscriptionForm = {};
    $scope.selectedweekdays = {};
    $scope.HolidaysByDateRange = {};
    $scope.DeliveryDaysCount = 1;
    $scope.ShowTimeslot = false;
    $scope.isDisabled = true;
    $scope.OrderType = null;


    $rootScope.CheckOutPaymentDTO = {
        ShoppingCartID: "", VoucherNo: "",
        VoucherAmount: 0, SelectedPaymentOption: "", SelectedStudent: "",
        SelectedShippingAddress: "", SelectedStudentID: "",
        WalletAmount: 0, PostObject: "", DevicePlatorm: "", DeviceVersion: "",
        OrderNote: null, CashChange: null
    };

    $scope.DeliveryAddress = null;
    $scope.DeliveryTypes = [];
    $scope.DeliveryTypeID = null;
    $scope.DeliverySubType = null;
    $scope.isConfirmedDelivery = true;
    $scope.isConfirmedDeliveryAddress = false;
    $scope.PaymentOptions = [];
    $scope.PaymentOptionsVirutal = [];
    $scope.PaymentOptionsNonVirtual = [];
    $scope.SelectedPaymentOption = { Value: null };
    $scope.IsPrivacyPolicy = true;
    $scope.CartID = null;

    //clear the cache
    $rootScope.CartItemQuantity = [];

    if ($stateParams.DeliveryAddress != undefined && $stateParams.DeliveryAddress != null) {
        $scope.SelectedDeliveryAddress = $stateParams.DeliveryAddress;
    }

    angular.extend(this, $controller('OrderGenerationController',
        {
            $scope: $scope, $http: $http, loggedIn: loggedIn, rootUrl: rootUrl,
            $location: $location, GetContext: GetContext, serviceCartCount: serviceCartCount,
            $state: $state, $stateParams: $stateParams, $sce: $sce, $rootScope: $rootScope,
            $translate: $translate, $timeout: $timeout, $q: $q,
            rootUrl: rootUrl,
        }));


    $scope.init = function () {
        $scope.totalCount = 0;
        $rootScope.ShowLoader = true;
        $scope.GetShoppingCartCount();
        $scope.GetShoppingCart().then(function () {
            $scope.recalculateAmount();
        });
        $scope.GetSaveForCartCount();
        // $scope.GetDeliveryAddress();
        $scope.GetStudent();
        $scope.GetAllDeliveryTypes();
        // $scope.GetDeliveryStudent();
        $scope.GetUserDetail();
        $rootScope.getDefaultStudent();
        $scope.GetSubscriptionTypes();
        $scope.GetWeekDays();
        $scope.GetOrderTypes();
    };

    $scope.GetUserDetail = function () {
        $rootScope.ShowLoader = true;
        $http({
            method: 'GET',
            url: dataService + '/GetUserDetails',
            headers: {
                "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context)
            }
        }).then(function (result) {
            result = result.data;
            $scope.shoppingCart.CustomerName = result.Customer.FirstName + " " + result.Customer.MiddleName + " " + result.Customer.LastName;
            $rootScope.ShowLoader = false;

        }, function (err) {
            $rootScope.ShowLoader = false;

        });
    }

    $scope.ChangeCustomer = function (customer) {
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }
        $scope.shoppingCart.CustomerID = customer.CustomerIID;
        $scope.shoppingCart.CustomerName = customer.FirstName;
        $scope.shoppingCart.CustomerCR = customer.CustomerCR;
        $http({
            url: dataService + "/UpdateCartCustomer?customerID=" + customer.CustomerIID,
            method: 'GET',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            },
        }).then(function (result) {
            $scope.GetDeliveryAddress().then(function () {
                $rootScope.ShowLoader = false;
            });

        });
    }

    $scope.GetStudent = function () {
        $http({
            method: 'GET',
            url: schoolDataService + '/GetMyStudentsBySchool',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            }
        }).success(function (result) {
            $scope.Students = result;
            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
        });
    }

    $scope.GetStudentDeliveryDetails = function (student) {
        $rootScope.CheckOutPaymentDTO.SelectedShippingAddress = student.ClassName + "-" + student.SectionName;
        $rootScope.CheckOutPaymentDTO.SelectedStudent = student.AdmissionNumber + " - " + student.FirstName + " " + student.MiddleName + " " + student.LastName;
        $rootScope.CheckOutPaymentDTO.SelectedStudentID = student.StudentIID;
        $rootScope.CheckOutPaymentDTO.SelectedStudentAcademicYear = student.AcademicYear;
        $rootScope.CheckOutPaymentDTO.SelectedStudentSchool = student.SchoolName;
        $rootScope.CheckOutPaymentDTO.SelectedStudentAcademicYearID = student.AcademicYearID;
        $rootScope.CheckOutPaymentDTO.SelectedStudentSchoolID = student.SchoolID;
        $rootScope.CheckOutPaymentDTO.SelectedStudentFirstName = student.FirstName;
        $rootScope.CheckOutPaymentDTO.SelectedStudentMiddleName = student.MiddleName;
        $rootScope.CheckOutPaymentDTO.SelectedStudentLastName = student.LastName;
        $scope.CartID = $scope.shoppingCart.ShoppingCartID;

        $scope.resetHighlight();
        //checkk for student allergy
        $http({
            method: 'GET',
            url: schoolDataService + '/CheckStudentAllergy?studentID=' + student.StudentIID + '&cartID=' + $scope.CartID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            }
        }).success(function (result) {
            $rootScope.SelectedStudentAllergy = result;
            $rootScope.ShowLoader = false;
            $rootScope.ShowPreLoader = false;
            if (result.length != 0) {
                $scope.openAllergyPopup();
                document.getElementById("myButton").focus();
                $scope.highlightAllergyProduct(result);
            }
        });
    }

    $scope.openAllergyPopup = function () {
        const allergyModal = new bootstrap.Modal(document.getElementById('allergyModal'))
        allergyModal.show()

    }

    $scope.highlightAllergyProduct = function (allergy) {
        for (var i = 0; i < allergy.length; i++) {
            var product = document.getElementById(allergy[i].ProductID);
            if (product != null) {
                product.style.outlineOffset = "calc( 1em * 1 / 16)";
                product.style.outline = "solid calc( 1em * 3 / 16) #dc3545";
                product.style.animation = "animation-pulse 2s ease-out";
                product.style.animationIterationCount = "infinite";

            }
        }
    }

    $scope.resetHighlight = function () {
        var products = document.getElementsByClassName("product");
        for (var i = 0; i < products.length; i++) {
            products[i].style.outline = "none";
            products[i].style.animation = "none";
        }
    }

    $translate(['MOBILENO1', 'MOBILENO2', 'AREA', 'LANDMARK', 'LOCATION', 'HouseBuildingNo']).then(function (translation) {
        $scope.mobileno1 = translation.MOBILENO1;
        $scope.mobileno2 = translation.MOBILENO2;
        $scope.area = translation.AREA;
        $scope.landmark = translation.LANDMARK;
        $scope.location = translation.LOCATION;
        $scope.HouseBuildingNo = translation.HouseBuildingNo;
    });

    $scope.SetAddress = function (Address) {
        var FinalAddress = "";
        if (Address != null && Address != undefined && Address != "") {
            if (Address.AddressLine1) {
                FinalAddress = FinalAddress.concat(Address.AddressLine1, " ");
            }

            if (Address.AddressLine) {
                FinalAddress = FinalAddress.concat('- ' + Address.AddressLine);
            }

            if (Address.AddressLine2) {
                FinalAddress = FinalAddress.concat('- ' + Address.AddressLine2);
            }

            if (Address.Areas) {
                if (Address.Areas.Value) {
                    FinalAddress = FinalAddress.concat($scope.area, Address.Areas.Value, "&lt;br&gt;");
                }
            }

            if (Address.Location) {
                FinalAddress = FinalAddress.concat($scope.location, Address.Location, "&lt;br&gt;");
            }

            if (Address.LandMark) {
                FinalAddress = FinalAddress.concat($scope.landmark, Address.LandMark, "&lt;br&gt;");
            }

            if (Address.MobileNo1) {
                FinalAddress = FinalAddress.concat($scope.mobileno1, Address.MobileNo1, "&lt;br&gt;");
            }

            if (Address.MobileNo2) {
                FinalAddress = FinalAddress.concat($scope.mobileno2, Address.MobileNo2, "&lt;br&gt;");
            }

            if (Address.BuildingNo != undefined && Address.BuildingNo != "" && Address.BuildingNo != null) {
                FinalAddress = FinalAddress.concat($scope.HouseBuildingNo, Address.BuildingNo);
            }

            return $scope.SkipValidation(FinalAddress);
        }
        return "";
    }

    $scope.ListShippingAddress = function () {
        $state.go("allsavedaddress", { redirectURL: "singlecheckout" });
    }

    $scope.AddNewDeliveryAddress = function () {
        $rootScope.StoreID = $scope.DefaultStore;
        $state.go("addaddress", { redirectURL: "singlecheckout", firstAddress: !$scope.isConfirmedDeliveryAddress });
    }

    $scope.GetAllDeliveryTypes = function () {
        $http({
            url: dataService + "/GetAllDeliveryTypes",
            method: 'GET',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            }
        }).then(function (result) {
            result = result.data;
            $scope.DeliveryTypes = result;
            if ($scope.DeliveryTypes[0]) {
                $scope.DeliveryTypeID = $scope.DeliveryTypes[0].DeliveryTypeID;
                $scope.TimeSlots = $scope.DeliveryTypes[0].TimeSlots;
            } else {
                $scope.DeliveryTypeID = null;
                $scope.TimeSlots = [];
            }
        }), function (err) {
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }
        };
    }

    $scope.CartDeliverySelectionChanged = function (event, type, timeslotID, deliveryTypeID, delivery) {

        if (!$scope.shoppingCart.CustomerID) {
            $translate('PLEASESELECTTHECUSTOMER').then(function (translation) {
                $rootScope.ShowToastMessage(translation);
            });
            return false;

        }
        if (!$rootScope.CheckOutPaymentDTO.SelectedStudent) {
            $rootScope.ErrorMessage = 'Select the Student';
            const toastLiveExample = document.getElementById('liveToastError')
            const toast = new bootstrap.Toast(toastLiveExample, { delay: 2000, })
            toast.show()
            return false;
        }

        if($rootScope.SelectedStudentAllergy && $rootScope.SelectedStudentAllergy.length > 0){
            $rootScope.ErrorMessage = "Remove from the student's cart any products that cause allergies";
            const toastLiveExample = document.getElementById('liveToastError')
            const toast = new bootstrap.Toast(toastLiveExample, { delay: 4000, })
            toast.show()
            return false;
        }

        $(".selectRadioOption").removeClass("active");
        $(event.currentTarget).closest(".selectRadioOption").addClass("active");
        $scope.OrderScheduleDate = null;
        $scope.TimeSlotText = null;
        ClearVoucher();
        if (timeslotID) {
            $scope.SelectedTimeSlotMapID = timeslotID;
        }
        else {
            $timeout(function () {
                $('#timeSlot').val(null);
                $scope.SelectedTimeSlotMapID = null;
            });
        }
        if (deliveryTypeID) {
            $scope.DeliveryTypeID = deliveryTypeID;
        }
        if (type) {
            var deliveryType = $scope.DeliveryTypes
                .find(x => x.DeliveryTypeID == $scope.DeliveryTypeID);
            $scope.TimeSlots = deliveryType.TimeSlots;
            $scope.HastimeSlot = deliveryType.HasTimeSlot;
        }
        if (delivery && delivery.NotAvailable && $scope.DeliveryTypeID !== 13) {
            $timeout(function () {
                // $rootScope.ShowToastMessage(delivery.WarningMessage);
                $rootScope.showModalWindow("notification", "Alert!", delivery.WarningMessage,
                    "Cancel", "Schedule", cancelCallback, proceedCallback);
            });

            function cancelCallback() {
                $rootScope.ShowLoader = false;
            }

            function proceedCallback() {
                deliveryTypeID == 13;
                $scope.DeliveryTypeID = 13;
                updateDeliveryType();
            }

        } else {
            updateDeliveryType()
        }

        $rootScope.ShowLoader = true;

        function updateDeliveryType() {
            $http({
                url: dataService + "/UpdateCartDelivery",
                method: 'POST',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
                data: {
                    'DeliveryTypeID': $scope.DeliveryTypeID,
                    'DeliveryTypeTimeSlotMapID': $scope.SelectedTimeSlotMapID,
                    'OrderTypeID': $rootScope.OrderType
                },
            }).then(function (result) {
                result = result.data;
                $rootScope.ShowLoader = false;

                if (result.operationResult == 1) {
                    if ($scope.DeliveryTypeID == 13) {
                        $rootScope.TimeSlots = delivery.TimeSlots;
                        $scope.showDateTimePicker();
                    }
                    else {
                        if (!$scope.HastimeSlot || !type) {
                            $scope.SmartCheckout();
                        }
                        else {
                            $timeout(function () {
                                window.scrollTo(0, document.body.scrollHeight);
                            }, 1000);
                        }
                    }

                    isCartDeliveryUpdated = true;
                }
                else {
                    $rootScope.ShowToastMessage(result.WarningMessage || result.Message, 'error');
                }
            })
                , function (err) {
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                };
        }
    }

    $scope.CartDeliverySelectionChangedforSchedule = function (event, type, deliveryTypeID, delivery) {
        if($rootScope.SelectedStudentAllergy && $rootScope.SelectedStudentAllergy.length > 0){
            $rootScope.ErrorMessage = "Remove from the student's cart any products that cause allergies";
            const toastLiveExample = document.getElementById('liveToastError')
            const toast = new bootstrap.Toast(toastLiveExample, { delay: 4000, })
            toast.show()
            return false;
        }
        var subForm = $scope.subscriptionForm;
        var timeslotID = subForm.SubsciptionTimeSlotString;
        if (!subForm.SubsciptionTimeSlotString) {
            $rootScope.SuccessMessage = 'Select Timeslot';
            const toastLiveExample = document.getElementById('liveToast')
            const toast = new bootstrap.Toast(toastLiveExample, { delay: 2000, })
            toast.show()
            return
        }


        $scope.GetAcademicCalenderByDateRange();

        if (!$scope.shoppingCart.CustomerID) {
            $translate('PLEASESELECTTHECUSTOMER').then(function (translation) {
                $rootScope.ShowToastMessage(translation);
            });
            return
        }

        $(".selectRadioOption").removeClass("active");
        $(event.currentTarget).closest(".selectRadioOption").addClass("active");

        $scope.OrderScheduleDate = null;
        $scope.TimeSlotText = null;
        ClearVoucher();

        if (timeslotID) {
            $scope.SelectedTimeSlotMapID = timeslotID;
        }
        else {
            $timeout(function () {
                $('#timeSlot').val(null);
                $scope.SelectedTimeSlotMapID = null;
            });
        }

        if (deliveryTypeID) {
            $scope.DeliveryTypeID = deliveryTypeID;
        }

        if (type) {
            var deliveryType = $scope.DeliveryTypes
                .find(x => x.DeliveryTypeID == $scope.DeliveryTypeID);
            $scope.TimeSlots = deliveryType.TimeSlots;
            $scope.HastimeSlot = deliveryType.HasTimeSlot;
        }

        if (delivery && delivery.NotAvailable && $scope.DeliveryTypeID !== 14) {
            $timeout(function () {
                // $rootScope.ShowToastMessage(delivery.WarningMessage);
                $rootScope.showModalWindow("notification", "Alert!", delivery.WarningMessage,
                    "Cancel", "Schedule", cancelCallback, proceedCallback);
            });

            function cancelCallback() {
                $rootScope.ShowLoader = false;
            }

            function proceedCallback() {
                deliveryTypeID == 14;
                $scope.DeliveryTypeID = 14;
                updateDeliveryType();
            }

        } else {
            updateDeliveryType()
        }

        $rootScope.ShowLoader = true;

        function updateDeliveryType() {
            $http({
                url: dataService + "/UpdateCartDelivery",
                method: 'POST',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
                data: {
                    'DeliveryTypeID': $scope.DeliveryTypeID,
                    'DeliveryTypeTimeSlotMapID': $scope.SelectedTimeSlotMapID,
                    'OrderTypeID': $rootScope.OrderType
                },
            }).then(function (result) {
                result = result.data;
                $rootScope.ShowLoader = false;

                if (result.operationResult == 1) {

                    $scope.showDateTimePicker();


                    if (!$scope.HastimeSlot || !type) {
                        $scope.SmartCheckout();
                    }
                    else {
                        $timeout(function () {
                            window.scrollTo(0, document.body.scrollHeight);
                        }, 1000);
                    }


                    isCartDeliveryUpdated = true;
                }
                else {
                    $rootScope.ShowToastMessage(result.WarningMessage || result.Message, 'error');
                }
            })
                , function (err) {
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                };
        }
    }


    $scope.showDateTimePicker = function () {
        $scope.$broadcast("show-date-time-dailogue");
    }

    $scope.FilterClick = function () {
        $scope.CustomerSearchVisible = true;
        $timeout(function () {
            if ($(".lnkOverlay").is(':visible')) {
                $(".lnkOverlay").toggle();
            }

            $('.cart-header').hide();
            $('.productlisting').hide();
            $(".filtersection").show();
            $(".filtersection .togglecontent").hide();
            $(".filtersection .fl-left ul li").removeClass("active");

            $(".toggletab ul li:first-child").addClass('active');
            $(".toggletab ul li.active ul").css('display', 'block');
        })
    }

    $scope.FilterClose = function () {
        $scope.CustomerSearchVisible = false;
        $('.cart-header').show();
        $('.productlisting').show();
        $(".filtersection").hide();
    }


    $scope.SelectScheduleDateTime = function (scheduleDate, timeslotID) {
        if (!timeslotID) {
            $scope.ShowTimeslot = true;
            return
        }
        $scope.ShowTimeslot = false;

        $scope.OrderScheduleDate = scheduleDate;
        $rootScope.ShowLoader = true;
        $http({
            url: dataService + "/UpdateCartScheduleDate",
            method: 'POST',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            },
            data: {
                'ScheduleDate': scheduleDate.toLocaleDateString('en-us', { year: "numeric", month: "short", day: 'numeric' }),
            },
        }).then(function (result) {
            result = result.data;
            $scope.SmartCheckout();
            $scope.hideDateTimePicker()
            $rootScope.ShowLoader = false;
        }, function (err) {
            $rootScope.ShowLoader = false;
            $translate(['PLEASETRYLATER']).then(function (translation) {
                $rootScope.ShowToastMessage(translation.PLEASETRYLATER, 'error');
            });
        });
    }

    $scope.hideDateTimePicker = function () {
        $(".dateTimeCalendar").datetimepicker('destroy');
        $(".dateTimePicker").fadeOut("fast");
        $(".dateTimePickerOverlay").fadeOut("fast");
    }
    $scope.updateSelectedDate = function() {
        $scope.GetAcademicCalenderByDateRange();
      };

    $scope.SaveSchedule = function () {
        $scope.ShowLoader = true;
        var subForm = $scope.subscriptionForm;
        var fromDateString = moment(subForm.SubsciptionStartDateString).format("DD/MM/YYYY");
        var subscriptionTypeID = subForm.subscriptionTypeID.SubscriptionTypeID
        var toDateString = moment(subForm.SubsciptionEndDateString).format("DD/MM/YYYY");
        var deliveryDaysCount = $scope.DeliveryDaysCount
        if (subscriptionTypeID == 2) {
            dayIDs = [0, 1, 2, 3, 4, 5, 6]
        }
        else {
            var dayIDs = Object.keys(subForm.subscriptionDaysID).filter((key) => !!subForm.subscriptionDaysID[key]);
        }
        $http({
            url: dataService + "/SaveSchedule",
            method: 'POST',
            data: {

                'SubscriptionTypeID': subscriptionTypeID,
                'StartDate': fromDateString,
                'EndDate': toDateString,
                'DaysID': dayIDs,
                'DeliveryDaysCount': deliveryDaysCount,

            },
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(GetContext.Context())
            },
        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {
                $rootScope.SuccessMessage = result.Message;
                const toastLiveExample = document.getElementById('liveToast')
                const toast = new bootstrap.Toast(toastLiveExample, {
                    delay: 2000,
                })
                toast.show()
                $scope.isDisabled = false;
                $scope.isDisabledErrorMessage = false;

            }
            if (result.operationResult == 2) {
                $rootScope.SuccessMessage = result.Message;
                const toastLiveExample = document.getElementById('liveToast')
                const toast = new bootstrap.Toast(toastLiveExample, { delay: 2000, })
                toast.show();
                $scope.isDisabled = true;
                $scope.isDisabledErrorMessage = true;

            }
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }
        }, function (err) {
            $scope.ShowLoader = false;
        });
    }

    $scope.GetSubscriptionTypes = function () {
        $http({
            method: 'GET',
            url: dataService + '/GetSubscriptionTypes',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            }
        }).success(function (result) {
            $scope.SubscriptionTypes = result;
            $rootScope.ShowLoader = false;


        });
    }

    $scope.GetWeekDays = function () {
        $http({
            method: 'GET',
            url: dataService + '/GetWeekDays',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            }
        }).success(function (result) {
            $scope.GetWeekDays = result;
            $rootScope.ShowLoader = false;


        });
    }

    $scope.GetAcademicCalenderByDateRange = function () {
        var subForm = $scope.subscriptionForm;
        var startDateString = moment(subForm.SubsciptionStartDateString).format("DD/MM/YYYY");
        var endDateString = moment(subForm.SubsciptionEndDateString).format("DD/MM/YYYY");
        if (subForm.subscriptionTypeID.SubscriptionTypeID == 2) {
            dayIDs = [0, 1, 2, 3, 4, 5, 6]
        }
        else {
            var dayIDs = Object.keys(subForm.subscriptionDaysID).filter((key) => !!subForm.subscriptionDaysID[key]);
        }
        var DaysID = dayIDs.toString();
        $http({
            method: 'GET',
            url: dataService + "/GetAcademicCalenderByDateRange?startDateString=" + startDateString + '&endDateString=' + endDateString + '&daysID=' + DaysID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            }
        }).success(function (result) {
            $scope.HolidaysByDateRange = result;
            $scope.DeliveryDaysCount = $scope.HolidaysByDateRange;
            $scope.SaveSchedule();
            $rootScope.ShowLoader = false;
        });

    }




    $scope.GetSaveForCartCount = function () {
        var loggedInPromise = loggedIn.CheckLogin(Context, dataService);

        loggedInPromise.then(function (model) {
            if (model && model.data) {
                if (model.data.LoginID) {
                    $scope.LoggedIn = true;
                    var SaveForLaterCountPromise = serviceCartCount.getSaveForLaterCount(Context, dataService);
                    SaveForLaterCountPromise.then(function (result) {
                        $scope.SaveForLaterCount = result.data;
                        $scope.GetSaveForLaterCart();
                    });
                }
                else {
                    $scope.totalCount += 1;
                }
            }
            else {
                $scope.totalCount += 1;
            }
        }, function () { });
    }

    $scope.$watch('totalCount', function (n, o) {
        if (n >= 3) {
            $rootScope.ShowLoader = false;
        }
    });

    $scope.GetShoppingCartCount = function () {
        var cartPromise = serviceCartCount.getProductCount(Context, dataService);

        cartPromise.then(function (result) {
            $scope.ShoppingCartCount = result;
            $scope.totalCount += 1;
        }, function () {

        });

    }

    $scope.GetSaveForLaterCart = function () {
        $scope.totalCount += 1;
    };

    $scope.GetShoppingCart = function () {
        return $q(function (resolve, reject) {
            $http({
                url: dataService + "/GetCartDetails",
                method: 'GET',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
            })
                .then(function (result) {
                    $scope.errorcheckout = [];
                    $scope.shoppingCart = result.data;
                    $scope.isFirstTime = false;
                    $rootScope.CheckOutPaymentDTO.ShoppingCartID = $scope.shoppingCart.ShoppingCartID;
                    $scope.CartID = $scope.shoppingCart.ShoppingCartID;
                    $scope.getCartTotal();
                    $scope.isLoaded = true;

                    $scope.totalCount += 1;
                    resolve();
                })
                , function (err) {

                    $scope.isLoaded = true;
                    $scope.totalCount += 1;
                    resolve();
                };
        });
    }

    $scope.OptionClick = function () {
        $('.rightnav-cont').toggle();
    }

    $scope.SkipValidation = function (value) {
        if (value) {
            return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
        }
    };

    $scope.GetProductImage = function (imagePath) {
        return rootUrl.ImageUrl + imagePath;
    }

    $scope.ErrorImage = function () {
        return rootUrl.ErrorProductImageUrl;
    }

    $scope.range = function (start, end) {
        var result = [];
        for (var i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    };

    $scope.ShowContinueButton = function (product) {
        if (product.IsOutOfStock == true) {
            $scope.DenyCheckout = true;
            $scope.errorcheckout.push(2);
        }
        else if (product.IsCartQuantityAdjusted == true && product.Quantity > 0) {
            if ($scope.DenyCheckout == false) {
                $scope.DenyCheckout = false;
            }
            $scope.errorcheckout.push(3);
        }
        else if (product.IsCartQuantityAdjusted == true && product.Quantity <= 0) {
            $scope.DenyCheckout = true;
            $scope.errorcheckout.push(4);
        }
        else {
            if ($scope.DenyCheckout == false) {
                $scope.DenyCheckout = false;
            }
            $scope.errorcheckout.push(1);
        }
    }

    $scope.AllowCheckOut = function () {
        $.each($scope.shoppingCart.Products, function (index, item) {
            if (!(item.AvailableQuantity > 0 && item.AvailableQuantity >= item.Quantity)) {
                return false;
            }
        });
        return true;
    }

    $scope.getCartTotal = function () {
        var total = 0;
        if ($scope.shoppingCart != null && $scope.shoppingCart != undefined && $scope.shoppingCart.Products != null && $scope.shoppingCart.Products != undefined) {
            for (var i = 0; i < $scope.shoppingCart.Products.length; i++) {
                var product = $scope.shoppingCart.Products[i];
                $scope.ShowContinueButton(product);
            }

            total = $scope.shoppingCart.Total;
        }

        $scope.CartTotal = total;

        if ($scope.shoppingCart.IsCartItemOutOfStock == true || $scope.shoppingCart.IsCartItemDeleted == true || $scope.shoppingCart.IsCartItemQuantityAdjusted == true) {
            $timeout(function () {
                $translate(['SOMEITEMSINCARTNOTELIGIBLETOPURCHASE']).then(function (translation) {
                    $rootScope.ShowToastMessage(translation.SOMEITEMSINCARTNOTELIGIBLETOPURCHASE);
                });
            });
        }
    }

    $scope.decreaseQty = function (qty, product) {
        if (qty > 1) {
            product.Quantity = parseInt(qty) - 1;
            $scope.UpdateItem(product, product.Quantity);
        }
    };

    $scope.increaseQty = function (qty, product) {
        product.Quantity = parseInt(qty) + 1;
        $scope.UpdateItem(product, product.Quantity);
    };

    $scope.RemoveAllCartItems = function () {
        $translate(['DOYOUWANTTOCLEARALL']).then(function (translation) {
            angular.element(document.getElementById('rootBody')).scope().$root
                .showModalWindow("notification", "Alert!", translation.DOYOUWANTTOCLEARALL,
                    "Cancel", "Proceed", null, proceedCallback);
            function proceedCallback() {
                $scope.RemoveCartItem(-1, true);
            }
        });
    }

    $scope.RemoveCartItem = function (skuID, showMsg) {
        $rootScope.CheckOutPaymentDTO.SelectedStudent = null
        $scope.resetHighlight();
        $scope.totalCount = -10;
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        $http({
            url: dataService + "/RemoveCartItem",
            method: 'POST',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },

            data: { 'SKUID': skuID },
        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {
                $scope.init();

                if (showMsg == true) {
                    $rootScope.SuccessMessage = result.Message;
                    const toastLiveExample = document.getElementById('liveToast')
                    const toast = new bootstrap.Toast(toastLiveExample, {
                        delay: 2000,
                    })

                    toast.show()
                    // $rootScope.ShowToastMessage(result.Message, 'success');
                }
            }
            else {
                if (showMsg == true) {
                    $rootScope.ShowToastMessage(result.Message);
                }
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
            }

        })
            , function (err) {

                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                if (showMsg == true) {
                    $translate(['ITEMNOTREMOVED']).then(function (translation) {
                        $rootScope.ShowToastMessage(translation.ITEMNOTREMOVED, 'success');
                    });
                }
            };
    }

    var lastUpdatedSKUID = null;

    $scope.UpdateItem = function (product, quantity, showMsg) {
        if (lastUpdatedSKUID == product.SKUID) {
            clearTimeout($scope.submitUpdateQty);
        }
        lastUpdatedSKUID = product.SKUID;
        var inputVal = parseInt(quantity);
        if (inputVal == 0) {
            inputVal = 1;
        }

        $scope.submitUpdateQty = setTimeout(function () {
            if (quantity == '' || isNaN(inputVal)) {
                inputVal = 1;
            }
            var newQuantity = inputVal;

            if ($rootScope.ShowLoader == false) {
                $rootScope.ShowLoader = true;
            }

            $http({
                url: dataService + "/UpdateCart",
                method: 'POST',
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(Context)
                },
                data: {
                    'SKUID': product.SKUID,
                    'Quantity': newQuantity
                    , 'IsReplaceQuantity': true
                },
            }).then(function (result) {
                result = result.data;
                if (result.operationResult == 1) {
                    if (showMsg != false) {
                        $scope.GetShoppingCart().then(function () {
                            $scope.recalculateAmount();
                        });
                        $rootScope.SuccessMessage = result.Message;
                        const toastLiveExample = document.getElementById('liveToast')
                        const toast = new bootstrap.Toast(toastLiveExample, {
                            delay: 2000,
                        })

                        toast.show()
                        // $rootScope.ShowToastMessage(result.Message, 'success');
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    }
                    else {
                        if ($rootScope.ShowLoader == true) {
                            $rootScope.ShowLoader = false;
                        }
                    }
                }
                else {
                    if (showMsg != false) {
                        $rootScope.ShowToastMessage(result.Message);
                    }

                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                }
            }), function () {
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                if (showMsg != false) {
                    $translate(['PLEASETRYLATER']).then(function (translation) {
                        $rootScope.ShowToastMessage(translation.PLEASETRYLATER, 'success');
                    });
                }
            };
        });
    };

    $scope.AddSaveForLater = function (skuID) {
        $scope.totalCount = -10;
        favouriteSKUs = null;
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        $http({
            url: dataService + "/AddSaveForLater",
            method: 'POST',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
            data: "{\"skuID\":\"" + JSON.stringify(skuID) + "\"}",
        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {
                $scope.RemoveCartItem(skuID, false);
                $rootScope.ShowToastMessage(result.Message, 'success');
            }
            else {
                $rootScope.ShowToastMessage(result.Message, 'error');
            }

            $rootScope.ShowLoader = false;
        }
            , function (err) {
                $rootScope.ShowLoader = false;

                $translate(['PLEASETRYLATER']).then(function (translation) {
                    $rootScope.VoucherError = translation.PLEASETRYLATER;
                });
            });
    };

    $scope.RemoveSaveForLater = function (skuID, showMsg) {
        $scope.totalCount = -10;
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        $http({
            url: dataService + "/RemoveSaveForLater",
            method: 'POST',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
            data: "{\"skuID\":\"" + JSON.stringify(skuID) + "\"}",
        }).then(function (result) {
            result = result.data;
            if (result.operationResult == 1) {

                for (var i = 0; i < $scope.SaveForLaterCart.length; i++) {
                    if ($scope.SaveForLaterCart[i].SKUID == skuID) {
                        $scope.SaveForLaterCart.splice(i, 1);
                        $timeout(function () {
                            $scope.GetSaveForCartCount();
                        }, 100);
                        break;
                    }
                }
                if (showMsg == true) {
                    $rootScope.ShowToastMessage(result.Message, 'success');
                }
            }
            else {
                if (showMsg == true) {
                    $rootScope.ShowToastMessage(result.Message, 'error');
                }
            }
            if ($rootScope.ShowLoader == true) {
                $rootScope.ShowLoader = false;
            }
        })
            , function (err) {

                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                if (showMsg == true) {
                    $translate(['PLEASETRYLATER']).then(function (translation) {
                        $rootScope.VoucherError = translation.PLEASETRYLATER;
                    });
                }
            };

    };

    $scope.AddToCartFromSaveForLater = function (SKUID, quantity) {
        $scope.totalCount = -10;

        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        var AddtoCartPromise = serviceAddToCart.addToCart(SKUID, quantity, rootUrl.RootUrl, Context, $rootScope);
        AddtoCartPromise.then(function (result) {
            if (result.operationResult == 1) {
                $scope.init();
                $scope.RemoveSaveForLater(SKUID, false);
                $rootScope.ShowToastMessage(result.data.Message, 'success');
            }
            else {
                $rootScope.ShowToastMessage(result.data.Message, 'error');
                $rootScope.ShowLoader = false;
            }

        });
    }

    $scope.ProceedtoCheckout = function () {
        if (!$rootScope.IsProfileCompleted()) {
            if ($clientSettings.SingleCheckout) {
                $state.go('singlecheckout', {
                    loadBlocks: false,
                    redirectUrl: 'singlecheckout'
                });
                return;
            } else {
                $state.go('singlecheckout', {
                    loadBlocks: false,
                    redirectUrl: 'singlecheckout'
                });
            }
        }

        $scope.DenyCheckout = false;
        if ($scope.shoppingCart.IsCartItemOutOfStock == true) {
            $scope.DenyCheckout = true;
        }

        if ($scope.DenyCheckout == false) {
            if ($scope.LoggedIn) {
                $state.go("checkout", { DeliveryAddress: null, ShowAddressView: false });
            }
            else {
                $state.go("login", { redirectUrl: "checkout", IsDigitalCart: $scope.shoppingCart.isDigitalCart });
            }
        }
        else {
            $timeout(function () {
                $translate(['SOMEITEMSINCARTNOTELIGIBLETOPURCHASE']).then(function (translation) {
                    $rootScope.ShowToastMessage(translation.SOMEITEMSINCARTNOTELIGIBLETOPURCHASE, 'error');
                });
            });

        }
    }

    $scope.SmartCheckout = function () {
        if (!$rootScope.CheckOutPaymentDTO.SelectedShippingAddress) {
            $rootScope.ErrorMessage = 'Select the Student';

            // $rootScope.ShowToastMessage('')
            const toastLiveExample = document.getElementById('liveToastError')
            const toast = new bootstrap.Toast(toastLiveExample, {
                delay: 2000,
            })

            toast.show()
            // .then(function (translation) {
            //     $rootScope.ShowToastMessage(translation);
            // });

            $state.go('addaddress', {
                loadBlocks: false,
                addressID: $scope.DeliveryAddress.StudentIID,
                redirectUrl: 'checkout'
            });

            return;
        }

        GetPaymentMethods();

        // if($scope.shoppingCart.CustomerID){
        //     $scope.SelectedPaymentOption.Value = "11";
        //     $scope.ProceedPayment($scope.SelectedPaymentOption.Value);
        // }else{
        $(".modalOverlay,.modalPopUp").fadeIn("fast");
        // }

    }

    $scope.hideModalOverlay = function () {
        $(".modalOverlay,.modalPopUp").hide();
    }

    $scope.showQtyError = function () {
        $(".quantityoos").toggleClass('active');
    }


    function GetPaymentMethods() {
        isPaymentLoading = true;
        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
            $scope.IsLoyaltyLoading = true;
        }

        $http({
            url: dataService + "/GetPaymentMethodsforOnlineStore",
            method: 'GET',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            },
        })
            .then(function (result) {
                result = result.data;
                $timeout(function () {
                    $scope.PaymentOptions = result;
                    $scope.PaymentOptionsVirtual = result.filter(x => x.IsVirtual);
                    $scope.PaymentOptionsNonVirtual = result.filter(x => !x.IsVirtual);
                    DefaultPaymentOption();
                    if ($rootScope.ShowLoader == true) {
                        $rootScope.ShowLoader = false;
                    }
                    //btnidPayment.disabled = false;
                });
                isPaymentLoading = false;
                // $(".modalOverlay,.modalPopUp").fadeIn("fast");
            })
            , function (err) {
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                GetPaymentMethods();
                isPaymentLoading = false;
            };

    }

    function DefaultPaymentOption() {
        var defaultPaymentOptionArray = $.grep($scope.PaymentOptions, function (n) { return n.IsDefaultPayment == true; });
        if (defaultPaymentOptionArray != undefined && defaultPaymentOptionArray != null && defaultPaymentOptionArray.length > 0) {
            $scope.SelectedPaymentOption.Value = defaultPaymentOptionArray[0].PaymentMethodID
        }

        if ($scope.SelectedPaymentOption.Value != null && $scope.SelectedPaymentOption.Value != undefined && $scope.SelectedPaymentOption != 0) {
            $timeout(function () {
                $scope.isConfirmedPayment = true;
            });
        }

        $rootScope.CheckOutPaymentDTO.SelectedPaymentOption = $scope.SelectedPaymentOption.Value;
    };

    $scope.GetCashChanges = function () {
        $http({
            url: dataService + "/GetChangesFor",
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(Context) },
        }).then(function (result) {
            $scope.CashChanges = result.data;
        }, function (err) {

        });
    };

    $scope.ValidateVoucher = function (voucherNumber, payment) {
        if (voucherNumber.length == 0) {
            $rootScope.ShowToastMessage("Please provide a voucher code.");
            return;
        }

        if ($rootScope.ShowLoader == false) {
            $rootScope.ShowLoader = true;
        }

        $scope.VoucherError = "";
        $scope.VoucherAmount = 0;
        //if ($scope.VoucherNumber != "") {
        $http({
            url: dataService + "/ValidateVoucher?voucherNo=" + voucherNumber,
            method: 'GET',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            },
        })
            .then(function (result) {
                //alert(result.Status);
                //if (result.VoucherMessage == "" || result.VoucherMessage == null) {
                result = result.data;

                if (result.Status == 11) {
                    //alert(result.CurrentBalance);
                    payment.PaidAmount = result.VoucherValue;
                    $scope.VoucherAmount = result.VoucherValue;
                    if (!(result.VoucherMessage == "" || result.VoucherMessage == null)) {
                        $scope.VoucherError = result.VoucherMessage;
                        $rootScope.ShowToastMessage($scope.VoucherError);
                    }
                }
                else {
                    if (!(result.VoucherMessage == "" || result.VoucherMessage == null)) {
                        $scope.VoucherError = result.VoucherMessage;
                        $rootScope.ShowToastMessage($scope.VoucherError);
                    }
                    else {
                        $translate(['PLEASETRYLATER']).then(function (translation) {
                            $rootScope.ShowToastMessage(translation.PLEASETRYLATER);
                        });
                    }
                }

                $rootScope.CheckOutPaymentDTO.VoucherNo = voucherNumber;
                $rootScope.CheckOutPaymentDTO.VoucherAmount = $scope.VoucherAmount;

                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }

                $scope.GetShoppingCart().then(function () {
                    $scope.recalculateAmount(payment);
                });
            })
            , function (err) {
                //alert("Pl try later")
                if ($rootScope.ShowLoader == true) {
                    $rootScope.ShowLoader = false;
                }
                //alert(err);
            };
    }

    $scope.getLoyaltyPoints = function (payment) {
        payment.PaidAmount = 0;
        payment.SelectedPoints = 0;
        $(".slideScale").css("width", 0);
        var rangeSlider = document.getElementById("rangeSlider");
        rangeSlider.oninput = function () {
            var sliderPos = rangeSlider.value / rangeSlider.max;
            var pixelPosition = rangeSlider.clientWidth * sliderPos;
            $(".slideScale").css("width", pixelPosition);
        };
        $scope.recalculateAmount(payment);
    }

    $scope.recalculateAmount = function (payment) {
        $scope.shoppingCart.RemainingTotal = $scope.shoppingCart.Total - (payment ? payment.PaidAmount : 0);

        $rootScope.CheckOutPaymentDTO.TotalCartAmount = $scope.shoppingCart.RemainingTotal;
    }

    function ClearVoucher() {
        $scope.VoucherAmount = 0;
        $scope.VoucherNumber = "";
        $rootScope.CheckOutPaymentDTO.VoucherAmount = 0;
        $rootScope.CheckOutPaymentDTO.VoucherNo = "";
        $scope.recalculateAmount();
    }
    $scope.isWeekly = function (subscription) {
        if (subscription.SubscriptionTypeID == 1) {
            $scope.isweekselected = true
        }
        else {
            $scope.isweekselected = false

        }

    }

    $scope.GetOrderTypes = function () {
        $http({
            method: 'GET',
            url: schoolDataService + '/GetOrderTypes',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(Context)
            }
        }).success(function (result) {
            $scope.OrderTypes = result;
            $rootScope.ShowLoader = false;
        });
    }

    $scope.DateChange = function () {
        var SubsciptionStartDateString = moment($scope.subscriptionForm.SubsciptionStartDateString).format("YYYY-MM-DD");
        document.getElementsByName("SubsciptionEndString")[0].setAttribute('min', SubsciptionStartDateString);
    };
    $scope.minDate = new Date();
    $scope.init();
}]);