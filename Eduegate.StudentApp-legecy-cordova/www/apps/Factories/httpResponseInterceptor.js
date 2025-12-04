app.factory('authHttpResponseInterceptor',['$q','$location', '$rootScope',function($q,$location, $rootScope){
	return {
		request: function(config) {
            config.headers = config.headers || {};
            var token = window.localStorage.getItem('token')
            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }
            return config || $q.when(config);
        },
		response: function(response){
			if (response.status === 401) {
                $rootScope.ShowLoader = false;
                $location.path('/login').search('returnTo', $location.path());
			}
			return response || $q.when(response);
		},
		responseError: function(rejection) {
			if (rejection.status === 401) {
				console.log("Response Error 401",rejection);
				$location.path('/login').search('returnTo', $location.path());
			}
            $rootScope.ShowLoader = false;
			return $q.reject(rejection);
		}
	}
}])
.config(['$httpProvider',function($httpProvider) {
	//Http Intercpetor to check auth failures for xhr requests
	$httpProvider.interceptors.push('authHttpResponseInterceptor');
}]);