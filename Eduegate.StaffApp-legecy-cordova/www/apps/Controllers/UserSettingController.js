app.controller('UserSettingController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', '$state', '$sce', '$rootScope', 'mySharedService', '$timeout', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $state, $sce, $rootScope, mySharedService, $timeout) {
    $('body').addClass('active');
    var dataService = rootUrl.RootUrl;
    //var context = { "CompanyID": "", "EmailID": "kinjal@iii.com", "IPAddress": "1.1.1.1", "LoginID": "1294", "GUID": "1294", "CurrencyCode": "kwd", "UserId": "" };
    //var context = { "CompanyID": "", "EmailID": "", "IPAddress": "1.1.1.1", "LoginID": "", "GUID": "1294", "CurrencyCode": "kwd", "UserId": "" };
    var context = GetContext.Context();
    //$scope.AllCategories = [];
    $scope.ShowLoaders = true;
    $scope.LoggedInUser = "";
    $scope.NewsletterEmail = "";
    $scope.isNewsletterSubmitted = false;
    $scope.NewsletterError = "";
    $scope.NewsletterSuccess = "";
    $scope.NewsletterLoad = false;
    $scope.SecondLevelCategory = [];
    $scope.ThirdLevelCategory = [];
    $scope.init = function () {
        //alert("init called");
        
        $scope.CheckLogin();
        $scope.RemoveSideMenu();

    };

    $scope.RemoveOverLay = function () {
        $scope.RemoveSideMenu();
    }

    $scope.CheckLogin = function () {
        //alert("called");


        //alert("called")
        //$timeout(function () {
        context = GetContext.Context();
        var loggedInPromise = loggedIn.CheckLogin(GetContext.Context(), rootUrl.RootUrl, 0);
        loggedInPromise.then(function (model) {

            if (model.data != null && model.data != undefined) {
                if (model.data.LoginEmailID != null && model.data.LoginEmailID != undefined && model.data.LoginEmailID != "") {
                    var name = '';
                    name = name.concat(model.data.Customer.FirstName, ' ', model.data.Customer.LastName != undefined && model.data.Customer.LastName != null ? model.data.Customer.LastName : "");
                    $scope.LoggedInUser = name;
                    //alert("got data");
                    $scope.ShowLoaders = false;
                }
                else {
                    $scope.LoggedInUser = "";
                    //alert("no data");
                    $scope.ShowLoaders = false;
                }
            }
            else {
                $scope.LoggedInUser = "";
                //alert("no data 2");
                $scope.ShowLoaders = false;
            }
        });
        //}, 0);
        //var model = loggedIn.CheckLogin(context, rootUrl.RootUrl);
    }

    $scope.SignOut = function () {
        $http({
            url: rootUrl.RootUrl + "/Logout",
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) }
        }).success(function (result) {
            
            //$rootScope.initUserSettings = true;
            var isSignedOut = GetContext.NewContext();
            //context = GetContext.Context();
            context = jQuery.parseJSON(window.localStorage.getItem("context"));
            context.CompanyID = $rootScope.UserCountry;
            context.SiteID = $rootScope.UserCountry;
            context.LanguageCode = $rootScope.UserLanguage;
            if ($rootScope.UserCountry == "1") {
                context.CurrencyCode = "KWD";
            }
            else if ($rootScope.UserCountry == "2") {
                context.CurrencyCode = "SAR";
            }

            window.localStorage.setItem("context", JSON.stringify(context));
            window.localStorage.setItem("customerName", "");
            $zopim.livechat.clearAll();
            //$scope.CheckLogin();
            $state.go('home', { reloadSideMenu: true }, { reload: true });
        });
    }
    $scope.RemoveSideMenu = function () {
        $('body').removeClass('active');
        $('html').removeClass('active');
    }
    //$('i.leftpanel-close').on('click', function () {
    //    $('body').removeClass('active');
    //    $('html.active').removeClass('active');
    //});
    $scope.subscriptionTxtbox = function () {
        $(".other_options li div.signup").toggle("slow");
        //$(".other_options li div.signup").slideToggle('slow');
        $scope.NewsletterEmail = "";
        $scope.isNewsletterSubmitted = false;
        $scope.NewsletterError = "";
        $scope.NewsletterSuccess = "";
        $scope.NewsletterLoad = false;
        $(".other_options li:last-child()").toggleClass("subscribe-active");
    }

    $scope.AllCategories = function () {

        //var url = dataService + "/GetCategories";

        //$http.get(url).then(function (results) {
        //    $scope.AllCategories = results.data;
        //    //$rootScope.ShowLoader = false;
        //});


        $http({
            //GetMenuDetailsByType
            url: dataService + "/GetMenuDetailsByType",
            method: 'GET',
            headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(context) },
        }).success(function (result) {
            //$scope.AllCategories = result;
            $scope.AllCategories = result;
        });

    }

    //$scope.ShowMoreToggle = function () {
    //    $("ul.leftmenu li.inactive").toggle();
    //    $(".showall span.more").toggle();
    //    $(".showall span.less").toggle();
    //}

    $scope.ShowMoreTopToggle = function (event) {
        var obj = event.target;
        obj = $(obj).parent().parent();
        var parent = $(obj).parent();
        $(parent).children("li.inactive").toggle();
        $(obj).children(".showall").children("span.more").toggle();
        $(obj).children(".showall").children("span.less").toggle();
        //$("ul.leftmenu li.inactive").toggle();
        //$(".showall span.more").toggle();
        //$(".showall span.less").toggle();
    }

    $scope.SkipValidation = function (value) {
        if (value != undefined && value != "") {
            return $sce.trustAsHtml(jQuery.parseHTML(value)[0].textContent)
        }
    };

    $scope.GetErrorImage = function () {
        return rootUrl.ErrorHomePageImageUrl;
    };

    //$rootScope.$watch("initUserSettings", function (n, o) {
    //    if (n == true) {
    //        $scope.CheckLogin();
    //    }
    //})

    $scope.$on('handleBroadcast', function (event, args) {
        //$scope.message = 'ONE: ' + sharedService.message;
        //alert("caled");

        //$scope.CheckLogin();
        //alert(args.reload);
        //if (args.reload) {
        //    $state.go("home");
        //}
        //else {
        //    $scope.CheckLogin();
        //}

    });

    $scope.OpenSocialLink = function (type) {
        var url = "";

        switch (type) {
            case 1: //fb
                if ($rootScope.UserCountry == '1') {
                    url = "https://www.facebook.com/SkienKuwait/";
                }
                else {
                    url = "https://www.facebook.com/Skienksa";
                }
                break;
            case 2://twitter
                if ($rootScope.UserCountry == '1') {
                    url = "http://twitter.com/Skiencomkw";
                }
                else {
                    url = "https://twitter.com/Skiensacom";
                }
                break;
            case 3://instagram
                if ($rootScope.UserCountry == '1') {
                    url = "http://instagram.com/Skiencomkw";
                }
                else {
                    url = "https://www.instagram.com/Skiensacom/";
                }
                break;
            case 4://youtube
                if ($rootScope.UserCountry == '1') {
                    url = "https://www.youtube.com/channel/UCKzMK6Su6rhxBrSU-l5bIxQ";
                }
                else {
                    url = "";
                }
                break;
            case 5://snapchat
                if ($rootScope.UserCountry == '1') {
                    url = "";
                }
                else {
                    url = "";
                }
                break;
        }

        //if (type == 1) {//fb

        //    window.open("https://www.facebook.com/Skienksa", '_system');
        //}
        //else if (type == 2) { //twitter
        //    window.open("https://twitter.com/Skiensacom", '_system');
        //}
        //else if (type == 3) { //instagram
        //    window.open("https://www.instagram.com/Skiensacom/", '_system');
        //}
        //else if (type == 4) { //youtube
        //    window.open("youtube://Skienuwait", '_system');
        //}
        //else if (type == 5) { //snapchat
        //    window.open("snapchat://", '_system');
        //}
        window.open(url, '_system');


    }

    $scope.AddSubscription = function () {

        $scope.NewsletterError = "";
        $scope.NewsletterSuccess = "";
        $scope.isNewsletterSubmitted = true;
        if ($scope.newsletterForm.$valid) {

            var newsletterSubscriptionDTO = { emailID: $scope.NewsletterEmail, cultureID: 1 };
            $scope.NewsletterLoad = true;
            $http({
                url: dataService + "/AddNewsletterSubscription",
                method: 'POST',
                headers: { "Accept": "application/json;charset=UTF-8", "Content-type": "application/json; charset=utf-8", "CallContext": JSON.stringify(GetContext.Context()) },
                data: newsletterSubscriptionDTO,
            }).success(function (result) {
                if (result.operationResult == 1) {
                    $scope.NewsletterSuccess = result.Message;
                }
                else {
                    $scope.NewsletterError = result.Message;
                }
                $scope.NewsletterLoad = false;
            })
       .error(function (err) {
           $scope.NewsletterError = "Please try later";
           $scope.NewsletterLoad = false;
       });
        }

    }

    //$scope.GetSecondLevelCategory = function (secondLevelCategory, event, id) {
    //    $scope.SecondLevelCategory = [];
    //    $scope.ThirdLevelCategory = [];
    //    if (!$(event.target).closest("span.toggle-arrow").hasClass("showmenu")) {
    //        $(event.target).closest('li').find('> ul.submenu').slideDown('fast');
    //        $timeout(function () {
    //            $scope.SecondLevelCategory[id] = secondLevelCategory;
    //        });
    //    }
    //    else {
    //        $(event.target).closest('li').find('> ul.submenu').slideUp('fast');
    //    }
    //    //else {
    //    //    $timeout(function () {
    //    //        $scope.SecondLevelCategory = [];
    //    //    });
    //    //}
    //}

    //$scope.GetThirdLevelCategory = function (thirdLevelCategory, event, id) {
    //    $scope.ThirdLevelCategory = [];
    //    if (!$(event.target).closest("span.toggle-arrow").hasClass("showmenu")) {
    //        $(event.target).closest('li').find('> ul.submenu').slideDown('fast');
    //        $timeout(function () {
    //            $scope.ThirdLevelCategory[id] = thirdLevelCategory;
    //        });
    //    }
    //    else {
    //        $(event.target).closest('li').find('> ul.submenu').slideUp('fast');
    //    }
    //    //else {
    //    //    $timeout(function () {
    //    //        $scope.ThirdLevelCategory = [];
    //    //    });
    //    //}
    //}

    $scope.GetSecondLevelCategory = function (secondLevelCategory, event, id) {
        $scope.SecondLevelCategory[id] = [];
        $scope.ThirdLevelCategory[id] = [];
        
        if (!$(event.target).closest("span.toggle-arrow").hasClass("showmenu")) {    
            $timeout(function () {
                $scope.SecondLevelCategory[id] = secondLevelCategory;
                $(event.target).closest("span.toggle-arrow").toggleClass("showmenu");
            });
        }
        else { $(event.target).closest("span.toggle-arrow").toggleClass("showmenu"); }
        
        //else {
        //    $timeout(function () {
        //        $scope.SecondLevelCategory = [];
        //    });
        //}
    }

    $scope.GetThirdLevelCategory = function (thirdLevelCategory, event, parentid, id) {
        $scope.ThirdLevelCategory[parentid][id] = [];
        if (!$(event.target).closest("span.toggle-arrow").hasClass("showmenu")) {
            $timeout(function () {
                $scope.ThirdLevelCategory[parentid][id] = thirdLevelCategory;
                $(event.target).closest("span.toggle-arrow").toggleClass("showmenu");
            });
        }
        else { $(event.target).closest("span.toggle-arrow").toggleClass("showmenu"); }
        //else {
        //    $timeout(function () {
        //        $scope.ThirdLevelCategory = [];
        //    });
        //}
    }

}]);