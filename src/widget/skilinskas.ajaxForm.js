$(function () {
    $.widget("skilinskas.ajaxForm", {
        options: {},
        _create: function () {
            this.url = this.element.attr('action');
            this.gradeTable = $('.table tbody');
            this.gradeChart = new google.visualization.ColumnChart(document.getElementById('grade-average-chart'));
            this.gradeChartOptions = {
                title: 'Subject averages',
                max: 10,
                min: 0,
                vAxis: {gridlines: {count: 6}}
            };

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
                        that.gradeAverageChartGenerate(response.result.grades, response.result.subjects);
                    }
                }
            });
        },
        gradeTableGenerate: function (grades, subjects) {
            var dateFrom = new Date(grades[0].date);
            var dateTo = new Date(grades[grades.length - 1].date);

            this.gradeTable.html('');
            var gradeTableRow = '';
            var gradeTableHead = '<td></td>';

            var d = getDates(dateFrom, dateTo);
            for (var k = 0; k < d.length; k++) {
                gradeTableHead += '<th>' + d[k].getDate() + '</th>';
            }
            for (var i = 0; i < d.length; i++) {
                var dateFormat = d[i].getFullYear()
                    + '-' + pad(d[i].getMonth() + 1, 2)
                    + '-' + pad(d[i].getDate(), 2);
                gradeTableRow += '<td data-date="' + dateFormat + '"></td>';
            }

            this.gradeTable.prepend('<tr class="table-dates">' + gradeTableHead + '</tr>');

            for (var j = 0; j < subjects.length; j++) {
                this.gradeTable.append('<tr data-subject="' + subjects[j].id + '"><th>' + subjects[j].name + '</th>' + gradeTableRow + '</tr>');
            }

            grades.forEach(this.insertGrades);
        },
        gradeAverageChartGenerate: function (grades, subjects) {
            var averages = [];

            for (var i = 0; i < subjects.length; i++) {
                var sum = 0, count = 0, avg = 0;
                for (var j = 0; j < grades.length; j++) {
                    if (grades[j].subjectId == subjects[i].id) {
                        sum += grades[j].grade;
                        count++;
                    }
                }
                if (count > 0) {
                    avg = sum / count;
                }
                averages[i] = avg;
            }

            var data = new google.visualization.DataTable();
            //var data = google.visualization.arrayToDataTable([
            //    ['Year', 'Sales', 'Expenses'],
            //    ['2004',  1000,      400],
            //    ['2005',  1170,      460],
            //    ['2006',  660,       1120],
            //    ['2007',  1030,      540]
            //]);

            //var array3 = array1.concat(array2);
            data.addColumn('string', 'Subject');
            data.addColumn('number', 'Average grade');
            for (var k = 0; k < subjects.length; k++) {
                data.addRow([subjects[k].name, averages[k]]);
            }

            this.gradeChart.draw(data, this.gradeChartOptions);
        },
        insertGrades: function (element, index, array) {
            var gradeTable = $('.table tbody');
            var cell = $('[data-subject="' + element.subjectId + '"] [data-date="' + element.date + '"]', gradeTable);
            if (cell.length > 0) {
                cell.append(element.grade + ' ');
            }
        }
    });
});