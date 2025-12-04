app.directive('datepicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            jQuery(elem).datetimepicker({
                format:'d/m/Y',
                timepicker: false,

            });

            $(elem).on("dp.change", function (e) {
                ngModel.$setViewValue($(e.target).data().date);
            });

        },
    };
});