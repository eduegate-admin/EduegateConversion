app.controller('FeePaymentController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', '$timeout', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('FeePaymentController loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var context = GetContext.Context();

    var appDataUrl = rootUrl.RootUrl;

    $scope.FeeDueDetails = [];

    $scope.init = function () {
        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        $scope.GetFeeDueDetails();

        $http({
            method: 'GET',
            url: appDataUrl + '/GetSettingValueByKey?settingKey=' + 'QPAY_PAYMENT_MODE_ID',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.QPAYPaymentMode = result;
            
            $scope.PaymentModeID = $scope.QPAYPaymentMode;
        }).error(function () {
        });

        $http({
            method: 'GET',
            url: appDataUrl + '/GetSettingValueByKey?settingKey=' + 'FEECOLLECTIONPAYMENTMODE_ONLINE',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.OnlinePaymentMode = result;
        }).error(function () {
        });
    }

    $scope.GetFeeDueDetails = function () {

        $scope.FeeDueDetails = [];

        $http({
            method: 'GET',
            url: dataService + '/GetStudentsFeePaymentDetails',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.FeeDueDetails = result;

            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        });
    }

    $scope.GetTotalFeePayAmount = function (data) {

        if (typeof (data) === 'undefined') {
            return 0;
        }
        var sum = 0;
        $.each(data, function (index, objModel) {
            $.each(objModel.StudentFeeDueTypes, function (index, objModelinner) {

                sum = sum + objModelinner.NowPaying;

            });
        });
        $scope.TotalAmountToBePaid = sum;

        return sum;
    }

    //Update student wise fee
    $scope.UpdateStudentFee = function (studentRow) {

        var feeSum = 0;

        studentRow.StudentFeeDueTypes.forEach(typeRow => {

            if (studentRow.IsSelected == true) {
                typeRow.IsPayingNow = true;
            }
            else {
                typeRow.IsPayingNow = false;
            }
        });

        studentRow.StudentFeeDueTypes.forEach(typeRow => {

            $scope.UpdateTypeFee(typeRow, studentRow);

            feeSum += Math.round(typeRow.NowPaying, 2);
        });

        studentRow.NowPaying = feeSum;
    };

    //Update fee type related fees
    $scope.UpdateTypeFee = function (typeRow, studentRow) {

        var feeSum = 0;
        if (typeRow.IsPayingNow == false) {
           
            angular.forEach(studentRow.StudentFeeDueTypes, function (item) {
                if (typeRow.FeePeriodID != null && item.FeePeriodID != null && (typeRow.FeeMasterID == item.FeeMasterID && typeRow.FeePeriodID < item.FeePeriodID && item.IsPayingNow == true)) {
                    typeRow.IsPayingNow = true;
                    $rootScope.ShowToastMessage("Please select the term in an order!", 'error');                   
                    return false;
                }
            });
            angular.forEach(studentRow.StudentFeeDueTypes, function (item) {
                if ((typeRow.FeePeriodID != null && typeRow.IsPayingNow == false) && (item.FeePeriodID == null && item.IsPayingNow == true)) {
                    typeRow.IsPayingNow = true;
                    $rootScope.ShowToastMessage( "Kindly make sure to pay the regular fees first!",'error');
                    return false;
                }
            });
        }       
        
        if (typeRow.IsPayingNow == true) {
            var notpayingfees = studentRow.StudentFeeDueTypes.filter(item => item.IsPayingNow == false);
            var payingfeeperiodID = typeRow.FeePeriodID;

            angular.forEach(notpayingfees, function (item) {
                if (payingfeeperiodID != null && item.FeePeriodID != null && (typeRow.FeeMasterID == item.FeeMasterID && payingfeeperiodID > item.FeePeriodID && item.IsPayingNow == false)) {
                    typeRow.IsPayingNow = false;
                    $rootScope.ShowToastMessage("Please select the term in an order!", 'error');                   
                    return false;
                }
            });

            angular.forEach(studentRow.StudentFeeDueTypes, function (item) {
                if ((item.FeePeriodID != null && item.IsPayingNow == false) && (typeRow.FeePeriodID == null && typeRow.IsPayingNow == true)) {
                    typeRow.IsPayingNow = false;
                    $rootScope.ShowToastMessage("Kindly make sure to pay the regular fees first!", 'error');   
                    return false;
                }
            });
        }

        if (typeRow.IsPayingNow == true) {
            feeSum += Math.round(typeRow.Amount, 2);

            if (feeSum == 0) {
                if (typeRow.Amount != feeSum) {
                    feeSum = typeRow.Amount;
                }
            }
        }

        typeRow.NowPaying = feeSum;

        if (studentRow.StudentFeeDueTypes.some(x => x.IsPayingNow == true)) {
            studentRow.IsSelected = true;
        }
        else {
            studentRow.IsSelected = false;
        }

        $scope.UpdateStudentRowFee(studentRow);

        $scope.UpdateMothWiseCheckBox(typeRow);
    };

    //Update student now paying fee
    $scope.UpdateStudentRowFee = function (studentFeeData) {

        var feeSum = 0;

        studentFeeData.StudentFeeDueTypes.forEach(typeRow => {
            feeSum += Math.round(typeRow.NowPaying, 2);
        });

        studentFeeData.NowPaying = feeSum;
    }

    //Monthly check box updation based on fee type checking
    $scope.UpdateMothWiseCheckBox = function (feeTypeData) {

        feeTypeData.FeeDueMonthlySplit.forEach(monthRow => {
            if (feeTypeData.IsPayingNow == true) {
                monthRow.IsRowSelected = true;

                monthRow.NowPaying = monthRow.OldNowPaying;
            }
            else {
                monthRow.IsRowSelected = false;

                monthRow.NowPaying = 0;
            }
        });
    };

    //Type and student wise check box updation based on month wise selection
    $scope.UpdateTypeAndStudentCheckBox = function (feeTypeData, studentRowData) {

        if (feeTypeData.NowPaying == 0) {
            feeTypeData.IsPayingNow = false;
        }
        else {
            feeTypeData.IsPayingNow = true;
        }

        if (studentRowData.StudentFeeDueTypes.some(x => x.IsPayingNow == true)) {
            studentRowData.IsSelected = true;
        }
        else {
            studentRowData.IsSelected = false;
        }
    };

    //Update fee type monthly wise fees
    $scope.UpdateTypeFeeMonthWise = function (typeRow, studentRow, index) {

        var feeSum = 0;

        //Month order checking
        for (var i = 0, l = typeRow.FeeDueMonthlySplit.length; i < l; i++) {
            if (i > index && (typeRow.FeeDueMonthlySplit[index].IsRowSelected == false) && typeRow.FeeDueMonthlySplit[i].IsRowSelected == true) {
                $rootScope.ShowToastMessage("Please select the month in an order!", 'error');
                typeRow.FeeDueMonthlySplit[index].IsRowSelected = true;
                return false;
            }

            if (i < index && (typeRow.FeeDueMonthlySplit[index].IsRowSelected == true) && typeRow.FeeDueMonthlySplit[i].IsRowSelected == false) {
                $rootScope.ShowToastMessage("Please select the month in an order!", 'error');
                typeRow.FeeDueMonthlySplit[index].IsRowSelected = false;
                return false;
            }
        }

        typeRow.FeeDueMonthlySplit.forEach(monthRow => {
            if (monthRow.IsRowSelected == true) {
                feeSum += Math.round(monthRow.Amount, 2);

                monthRow.NowPaying = monthRow.OldNowPaying;
            }
            else {
                monthRow.NowPaying = 0;
            }
        });

        typeRow.NowPaying = feeSum;

        $scope.UpdateTypeAndStudentCheckBox(typeRow, studentRow);

        $scope.UpdateStudentRowFee(studentRow);
    };

    //Payment start
    $scope.FeePaymentClick = function () {
        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        var totalAmountToBePaid = $scope.TotalAmountToBePaid;
        $scope.IsClickToPay = true;
        if (totalAmountToBePaid > 0) {
            $scope.IsClickToPay = true;
            $scope.SubmitAmountLog(totalAmountToBePaid);

        }
        else {
            $scope.IsClickToPay = false;
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
            $rootScope.ErrorMessage = "Payment requires an amount greater than zero!";
            // $rootScope.ShowToastMessage("Payment requires an amount greater than zero!", 'error');
            const toastLiveExample = document.getElementById('liveToastError')
            const toast = new bootstrap.Toast(toastLiveExample , {
                delay:2000,
            })
            navigator.vibrate(300); // 3000 is ignored

            toast.show()

        }

    };

    $scope.SubmitAmountLog = function (totalAmountToBePaid) {

        $http({
            url: dataService + "/SubmitAmountAsLog?totalAmount=" + totalAmountToBePaid,
            method: "POST",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            if (result) {
                $scope.InitiateSession();
            }
            else {
                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;

                $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
                $scope.IsClickToPay = false;
            }
        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;

            $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
            $scope.IsClickToPay = false;
        });

    }

    $scope.InitiateSession = function () {

        $http({
            url: dataService + "/GenerateCardSession?PaymentModeID=" + $scope.PaymentModeID,
            method: "POST",
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            if (result) {
                $scope.InitiateFeeCollections();
            }
            else {
                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;

                $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
                $scope.IsClickToPay = false;
            }
        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;

            $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
            $scope.IsClickToPay = false;
        });

    }

    $scope.InitiateFeeCollections = function () {
        var feeList = [];

        var totalAmount = 0;

        $scope.FeeDueDetails.forEach(fp => {

            var feeTypeList = [];

            if (fp.StudentFeeDueTypes.length > 0) {

                var selectedFeeTypes = fp.StudentFeeDueTypes.filter(ft => ft.IsPayingNow == true);

                if (selectedFeeTypes.length > 0) {

                    selectedFeeTypes.forEach(sft => {

                        var monthlyFeeList = [];

                        if (sft.FeeDueMonthlySplit.length > 0) {

                            var selectedMonthlyFees = sft.FeeDueMonthlySplit.filter(fmly => fmly.IsRowSelected == true);

                            if (selectedMonthlyFees.length > 0) {

                                selectedMonthlyFees.forEach(sfmly => {

                                    monthlyFeeList.push({
                                        "FeeCollectionMonthlySplitIID": 0,
                                        "MonthID": sfmly.MonthID,
                                        "Amount": sfmly.NowPaying,
                                        "NowPaying": sfmly.NowPaying,
                                        "FeeDueMonthlySplitID": sfmly.FeeDueMonthlySplitID,
                                        "Year": sfmly.Year,
                                        "CreditNote": sfmly.CreditNote,
                                        "Balance": sfmly.Balance
                                    });

                                });
                            }
                        }

                        feeTypeList.push({
                            "FeeCollectionFeeTypeMapsIID": 0,
                            "FeeMasterID": sft.FeeMasterID,
                            "FeePeriodID": sft.FeePeriodID,
                            "Amount": sft.Amount,
                            "FeeDueFeeTypeMapsID": sft.FeeDueFeeTypeMapsID,
                            "NowPaying": sft.NowPaying,
                            "MontlySplitMaps": monthlyFeeList
                        });

                        totalAmount += sft.NowPaying;
                    });
                }
            }

            feeList.push({
                "FeeCollectionIID": 0,
                "StudentID": fp.StudentID,
                "ClassID": fp.ClassID,
                "SectionID": fp.SectionID,
                "SchoolID": fp.SchoolID,
                "AcadamicYearID": fp.AcademicYearID,
                "FeePaymentModeID": $scope.PaymentModeID,
                "FeeTypes": feeTypeList
            });

        });

        if ($scope.TotalAmountToBePaid != totalAmount) {
            $rootScope.ShowToastMessage("The total amount does not match the sum of the selected types!", 'error');
            $scope.IsClickToPay = false;
        }

        if (feeList.length > 0) {

            $http({
                url: dataService + "/InitiateFeeCollections",
                data: JSON.stringify(feeList),
                method: "POST",
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).success(function (result) {

                if (result.operationResult == 1) {
                    $scope.InitiatePaymentGateway();

                }
                else {
                    $rootScope.ShowPreLoader = false;
                    $rootScope.ShowLoader = false;

                    $rootScope.ShowToastMessage(result.Message, 'error');
                    $scope.IsClickToPay = false;
                }
            }).error(function () {
                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;

                $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
                $scope.IsClickToPay = false;
            });

        }
        else {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;

            $rootScope.ShowToastMessage("Something went wrong, try again later!", 'error');
            $scope.IsClickToPay = false;
        }
    }

    $scope.InitiatePaymentGateway = function () {

        $rootScope.ShowPreLoader = false;
        $rootScope.ShowLoader = false;

        $state.go("initiatefeepayment", { paymentModeID: $scope.PaymentModeID });
    }
    //Payment end

    $scope.ChangePaymentMethod = function (type) {

        if (type == "DebitCard") {
            $scope.PaymentModeID = $scope.QPAYPaymentMode;
        }
        else {
            $scope.PaymentModeID = $scope.OnlinePaymentMode;
        }
    };

}]);