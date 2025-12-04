app.controller('FeePaymentHistoryController', ['$scope', '$http', '$state', 'rootUrl', '$location', '$rootScope', '$stateParams', 'GetContext', '$sce', '$timeout', function ($scope, $http, $state, rootUrl, $location, $rootScope, $stateParams, GetContext, $sce, $timeout) {
    console.log('FeePaymentHistoryController loaded.');

    var dataService = rootUrl.SchoolServiceUrl;
    var appDataUrl = rootUrl.RootUrl;

    var context = GetContext.Context();
    $scope.Schools = [];


    $scope.init = function () {
        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        $scope.GetSchools();

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

        $scope.FillLastCollectionHistories();
    };

    $scope.GetSchools = function () {

        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        $scope.SelectedSchool = {};
        $scope.Schools = [];

        $http({
            method: 'GET',
            url: dataService + '/GetSchoolsByParent',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            var schoolDatas = result;

            if (schoolDatas.length > 0) {
                $scope.Schools.push({
                    "Key": 0,
                    "Value": "All"
                });
                schoolDatas.forEach(x => {
                    $scope.Schools.push({
                        "Key": x.Key,
                        "Value": x.Value
                    });
                });
            }

            if ($scope.Schools.length > 0) {
                if ($scope.Schools.length == 2) {
                    if ($scope.Schools[1].Key != null) {
                        $scope.SelectedSchool.Key = $scope.Schools[1].Key;
                        $scope.SelectedSchool.Value = $scope.Schools[1].Value;
                    };
                    $scope.SchoolChanges();
                }
                else if ($scope.Schools[0].Key != null) {
                    $scope.SelectedSchool.Key = $scope.Schools[0].Key;
                    $scope.SelectedSchool.Value = $scope.Schools[0].Value;

                    $scope.SchoolChanges();
                };
            }

        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        });
    };

    $scope.SchoolChanges = function () {

        $scope.SelectedAcademicYear = {};
        $scope.AcademicYears = [];

        var schoolID = $scope.SelectedSchool?.Key;

        $scope.AcademicYears.push({
            "Key": 0,
            "Value": "Current"
        });

        $http({
            method: 'GET',
            url: dataService + '/GetAcademicYearBySchool?schoolID=' + schoolID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            var academicYearDatas = result;

            if (academicYearDatas.length > 0) {
                academicYearDatas.forEach(x => {
                    $scope.AcademicYears.push({
                        "Key": x.Key,
                        "Value": x.Value
                    });
                });
            }

            if ($scope.AcademicYears.length > 0) {
                if ($scope.AcademicYears.length == 2) {
                    if ($scope.AcademicYears[1].Key != null) {
                        $scope.SelectedAcademicYear.Key = $scope.AcademicYears[1].Key;
                        $scope.SelectedAcademicYear.Value = $scope.AcademicYears[1].Value;
                    };
                }
                else if ($scope.AcademicYears[0].Key != null) {
                    $scope.SelectedAcademicYear.Key = $scope.AcademicYears[0].Key;
                    $scope.SelectedAcademicYear.Value = $scope.AcademicYears[0].Value;
                };
            }

        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        });
    };

    $scope.GetFeeCollectionHistories = function () {

        $scope.FeeCollectionHistories = [];
        var schoolID = $scope.SelectedSchool.Key;
        var academicYearID = $scope.SelectedAcademicYear.Key;

        $http({
            method: 'GET',
            url: dataService + '/GetFeeCollectionHistories?schoolID=' + schoolID + "&academicYearID=" + academicYearID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.FeeCollectionHistories = result;

            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        });
    };

    $scope.ResendMail = function (model) {

        document.getElementById("mailsendbutton").disabled = false;

        $scope.SelectedTransactionDetails = model;
        $('#MailConformationModal').modal('show');
    };

    $scope.SendMailReceipt = function () {

        document.getElementById("mailsendbutton").disabled = true;

        if ($scope.SelectedTransactionDetails.TransactionNumber && $scope.SelectedTransactionDetails.TransactionNumber != "NA") {

            var feeReceiptNo = $scope.SelectedTransactionDetails.StudentHistories.length == 1 ? $scope.SelectedTransactionDetails.StudentHistories[0].FeeReceiptNo : null;

            var url = dataService + "/ResendReceiptMail?transactionNumber=" + $scope.SelectedTransactionDetails.TransactionNumber + "&mailID=" + $scope.SelectedTransactionDetails.ParentEmailID+ "&feeReceiptNo=" + feeReceiptNo;

            $http({
                url: url,
                method: "POST",
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).success(function (result) {

                if (result.operationResult == 1) {
                    $rootScope.ShowToastMessage("Mail sent successfully!", 'success');
                }
                else {
                    $rootScope.ShowToastMessage("Mail sending failed!", 'error');
                }

                $('#MailConformationModal').modal('hide');

            }).error(function () {

                $('#MailConformationModal').modal('hide');

                $rootScope.ShowToastMessage("Mail sending failed!", 'error');
            });

        }
        else {

            $('#MailConformationModal').modal('hide');

            $rootScope.ShowToastMessage("Unable to send mail in this time, try again after some time!", 'error');
        }
    };

    $scope.RetryPaymentTransaction = function (model) {

        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        if (model.Amount > 0) {

            var transactionNo = model.TransactionNumber;
            var paymentModeID = model.FeePaymentModeID;

            $http({
                method: 'GET',
                url: dataService + "/CheckFeeCollectionExistingStatus?transactionNumber=" + transactionNo,
                headers: {
                    "Accept": "application/json;charset=UTF-8",
                    "Content-type": "application/json; charset=utf-8",
                    "CallContext": JSON.stringify(context)
                }
            }).success(function (result) {

                if (result.operationResult == 1) {

                    $scope.RetryPayment(transactionNo, paymentModeID);
                }
                else {
                    $rootScope.ShowPreLoader = false;
                    $rootScope.ShowLoader = false;

                    $rootScope.ShowToastMessage("Fee already paid for the same month or type!", 'error');
                }

            }).error(function () {
                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;

                $rootScope.ShowToastMessage("Unable to retry transaction in this time, try again later!", 'error');
            });

        }
        else {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
            $rootScope.ShowToastMessage("An amount greater than zero is required to retry payment!", 'error');
        }
    };

    $scope.RetryPayment = function (transactionNo, paymentModeID) {

        $http({
            method: 'POST',
            url: dataService + "/CheckTransactionPaymentStatus?transactionNumber=" + transactionNo + "&paymentModeID=" + paymentModeID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            if (result.operationResult == 1) {

                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;
                $state.go("validateretryfeepayment",
                {
                    paymentModeID: paymentModeID,
                    transactionNumber: transactionNo,
                });
            }
            else {
                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;

                $state.go("initiatefeepayment",
                {
                    paymentModeID: paymentModeID,
                    transactionNumber: transactionNo,
                });
            }

        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;

            $rootScope.ShowToastMessage("Unable to retry transaction in this time, try again later!", 'error');
        });
    };

    $scope.InitiateRetryPayment = function (transactionNo, paymentModeID) {

        $http({
            method: 'POST',
            url: dataService + "/RetryPayment?transactionNumber=" + transactionNo + "&paymentModeID=" + paymentModeID,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            if (result.operationResult == 1) {

                $state.go("initiatefeepayment",
                {
                    paymentModeID: paymentModeID,
                    transactionNumber: transactionNo,
                });
            }
            else {
                $rootScope.ShowPreLoader = false;
                $rootScope.ShowLoader = false;

                $rootScope.ShowToastMessage("Unable to retry transaction in this time, try again later!", 'error');
            }

        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;

            $rootScope.ShowToastMessage("Unable to retry transaction in this time, try again later!", 'error');
        });
    };

    $scope.TransactionDetailClick = function (transactionNumber) {
        $state.go("feepaymenthistorydetails", { transactionNumber: transactionNumber });
    };

    $scope.FillLastCollectionHistories = function () {

        $scope.FeeCollectionHistories = [];

        $http({
            method: 'GET',
            url: dataService + '/GetLastTenFeeCollectionHistories',
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "Content-type": "application/json; charset=utf-8",
                "CallContext": JSON.stringify(context)
            }
        }).success(function (result) {

            $scope.FeeCollectionHistories = result;

            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        }).error(function () {
            $rootScope.ShowPreLoader = false;
            $rootScope.ShowLoader = false;
        });
    };

    $scope.FilterButtonClick = function () {

        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        $scope.GetFeeCollectionHistories();
    };

    $scope.ClearFilterClick = function () {
        $rootScope.ShowPreLoader = true;
        $rootScope.ShowLoader = true;

        $scope.GetSchools();
        $scope.FillLastCollectionHistories();
    };

    $scope.GoHome = function () {
        $state.go("home");
    };

}]);