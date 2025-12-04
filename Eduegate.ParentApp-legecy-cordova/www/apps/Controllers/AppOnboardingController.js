app.controller('AppOnboardingController', ['$scope', '$http', 'loggedIn', 'rootUrl', '$location', 'GetContext', '$timeout', '$state', '$stateParams', '$sce', '$rootScope','FlickityService', function ($scope, $http, loggedIn, rootUrl, $location, GetContext, $timeout, $state, $stateParams, $sce, $rootScope, FlickityService) {



    $scope.init = function() {
        const element = angular.element(document.getElementById('demo-slider1'));
        const flickityOptions = {
          cellAlign: 'left',
                              cover : true,
                              wrapAround: false,
                              autoPlay: false,
                              adaptiveHeight: true,
                              pageDots: true,
                              dragThreshold: 10,
                              imagesLoaded: true,
                              prevNextButtons: false,
                              cellAlign: 'center',
      }
        $timeout(() => {
            // Initialize our Flickity instance
            FlickityService.create(element[0], element[0].id,flickityOptions);
        });
        $scope.HomeBanners = [
            {
                imageUrl: 'clients/'+ $rootScope.ClientSettings.Client + '/images/onboarding/onboading1.png',
                textUrl: 'clients/'+ $rootScope.ClientSettings.Client + '/images/onboarding/onboadingtext1.png',
            },
            {
                imageUrl: 'clients/'+ $rootScope.ClientSettings.Client + '/images/onboarding/onboading2.png',
                textUrl: 'clients/'+ $rootScope.ClientSettings.Client + '/images/onboarding/onboadingtext2.png',
            },
            {
                imageUrl: 'clients/'+ $rootScope.ClientSettings.Client + '/images/onboarding/onboading3.png',
                textUrl: 'clients/'+ $rootScope.ClientSettings.Client + '/images/onboarding/onboadingtext3.png',
            }
        ];
    }

    $scope.completeOnboarding = function () {
        window.localStorage.setItem("OnboardingCompleted", "true");
        $state.go("home"); // Navigate to the main home screen after onboarding
    };


    $scope.init();

  }]);