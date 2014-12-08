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
                        that.gradeTableGenerate(response.result.grades, response.result.subjects);
                    }
                }
            });
        },
        gradeTableGenerate: function (grades, subjects) {
            var dateFrom = new Date(grades[0].date);
            var dateTo = new Date(grades[grades.length - 1].date);

            var gradeTable = $('.table tbody');
            gradeTable.html('');
            var gradeTableRow = '';


            var d = getDates(dateFrom, dateTo);
            for (var i = 0; i < d.length; i++) {
                var dateFormat = d[i].getFullYear()
                    + '-' + pad(d[i].getMonth() + 1, 2)
                    + '-' + pad(d[i].getDate(), 2);
                gradeTableRow += '<td data-date="' + dateFormat + '"></td>';
            }

            for (var j = 0; j < subjects.length; j++) {
                gradeTable.append('<tr data-subject="' + subjects[j].id + '"><th>'+subjects[j].name+'</th>' + gradeTableRow + '</tr>');
            }

            grades.forEach(this.insertGrades);
        },
        insertGrades: function (element, index, array) {
            var gradeTable = $('.table tbody');
            var cell = $('[data-subject="' + element.subjectId + '"] [data-date="' + element.date + '"]', gradeTable);
            console.log(element);
            if (cell.length > 0) {
                cell.append(element.grade + ' ');
            }
        }
    });
});