$(function () {
    $.widget("skilinskas.ajaxForm", {
        options: {},
        _create: function () {
            this.url = this.element.attr('action');

            this.submit();

            this._on(this.element, {
                'submit': 'submit'
            });
        },
        submit: function (event) {
            if (typeof event != 'undefined') {
                event.preventDefault();
            }
            this.ajax(this.element.serialize());
        },
        ajax: function (dataForm) {
            var that = this;
            $.ajax({
                url: 'http://localhost:8000/api/grades',
                dataType: 'JSONP',
                jsonpCallback: 'callback',
                type: 'GET',
                data: dataForm,
                success: function (response) {
                    if (response.success) {
                        that.gradeTableGenerate(response.result.grades);
                    }
                }
            });
        },
        gradeTableGenerate: function (grades) {
            console.log(grades[0].date);
            console.log(grades[grades.length-1].date);
            var dateFrom = new Date('2014-12-29');
            var dateTo = new Date('2015-01-03');

            var gradeTable = $('.table tbody');
            gradeTable.html('');
            var gradeTableRow = '';


            var d = getDates(dateFrom, dateTo);
            for (var i = 0; i < d.length; i++) {
                var dateFormat = d[i].getFullYear()
                    + '-' + pad(d[i].getMonth() + 1, 2)
                    + '-' + pad(d[i].getDate(), 2);
                gradeTableRow += '<td>' + dateFormat + '</td>';
            }

            gradeTable.append('<tr>' + gradeTableRow + '</tr>');

            grades.forEach(this.insertGrades);
        },
        insertGrades: function (element, index, array) {
            console.log(element);
        }
    });
});