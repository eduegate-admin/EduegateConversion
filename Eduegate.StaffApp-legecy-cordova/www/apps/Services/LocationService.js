app.service('LocationService', ['$http','rootUrl','GetContext', function($http,rootUrl,GetContext) {
    this.sendLocationToServer = function(location) {
        const { latitude, longitude, accuracy } = location;
        const currentPosition = `${latitude},${longitude}`;

        // Ensure `dataService` and `context` are properly defined in your service or injected.
        var dataService = rootUrl.SchoolServiceUrl;
        var context = GetContext.Context();

        return $http({
            url: `${dataService}/UpdateUserGeoLocation?geoLocation=${currentPosition}`,
            method: 'GET',
            headers: {
                Accept: 'application/json;charset=UTF-8',
                'Content-Type': 'application/json; charset=utf-8',
                CallContext: JSON.stringify(context),
            },
        }).then(response => {
            console.log('Location updated successfully:', response.data);
            return response.data; // Return data to the caller if needed
        }).catch(error => {
            console.error('Error updating location:', error);
            throw error; // Re-throw error for caller to handle
        });
    };
}]);
