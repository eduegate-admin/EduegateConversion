app.directive('dateTimePickerrangeenddate', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            jQuery(elem).datetimepicker({
                format:'d/m/Y',
                timepicker: false,
                onShow:function( ct ){
                        this.setOptions({
                         minDate:jQuery('#FromDateString').val()?jQuery('#FromDateString').val():false
                        })
                       },
            });

            $(elem).on("dp.change", function (e) {
                ngModel.$setViewValue($(e.target).data().date);
            });
        },
    };
});