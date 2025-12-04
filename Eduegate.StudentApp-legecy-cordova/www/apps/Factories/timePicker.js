app.directive('timepicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            jQuery(elem).datetimepicker({
                datepicker: false,
                format: 'g:i A',
                step: 5,
                validateOnBlur: false

            });

            $(elem).on("dp.change", function (e) {
                ngModel.$setViewValue($(e.target).data().date);
            });
        },
    };
});