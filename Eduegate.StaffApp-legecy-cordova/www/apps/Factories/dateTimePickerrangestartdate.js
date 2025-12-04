app.directive('dateTimePickerrangestartdate', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            jQuery(elem).datetimepicker({
                format:'d/m/Y',
                timepicker: false,
                onShow:function( ct ){
                    this.setOptions({
                     maxDate:jQuery('#ToDateString').val()?jQuery('#ToDateString').val():false
                    })
                },
            });

            $(elem).on("dp.change", function (e) {
                ngModel.$setViewValue($(e.target).data().date);
            });
        },
    };
});