$(function () {
    $.widget("skilinskas.ajaxForm", {
        options: {},
        _create: function () {
            this.baseUrl = 'http://localhost:8000';
            this.url = this.element.attr('action');
            this.gradeTable = $('.table tbody');
            this.getGradesForm = $('#get-grades-form');
            this.addGradeForm = $('#add-grade-form');
            this.inputSelectStudent = $('.input-select-student');
            this.inputSelectSubject = $('.input-select-subject');
            this.gradeChart = new google.visualization.ColumnChart(document.getElementById('grade-average-chart'));
            this.gradeChartOptions = {
                title: 'Subject averages',
                max: 10,
                min: 0,
                vAxis: {gridlines: {count: 6}}
            };

            this.submitGetGradesForm();
            this._on(this.getGradesForm, {
                'submit': 'submitGetGradesForm'
            });
            this._on($('select', this.getGradesForm), {
                'change': 'submitGetGradesForm'
            });
            this._on(this.addGradeForm, {
                'submit': 'submitAddGradeForm'
            });
        },
        submitGetGradesForm: function (event) {
            this.getStudentsAjax();
            this.getSubjectsAjax();
            if (typeof event != 'undefined') {
                event.preventDefault();
            }
            this.getGradesAjax(this.getGradesForm.serialize());
        },
        submitAddGradeForm: function (event) {
            if (typeof event != 'undefined') {
                event.preventDefault();
            }
            this.addGradeAjax(this.addGradeForm.serialize());
        },
        getGradesAjax: function (dataForm) {
            var that = this;
            $.ajax({
                url: this.baseUrl + '/api/get/grades',
                dataType: 'json',
                type: 'GET',
                data: dataForm,
                success: function (response) {
                    if (response.success && response.result.grades.length) {
                        var dateFrom = new Date(response.result.date_from);
                        var dateTo = new Date(response.result.date_to);
                        that.dataGrades = response.result.grades;
                        that.gradeTableGenerate(that.dataGrades, that.dataSubjects, dateFrom, dateTo);
                        that.gradeAverageChartGenerate(that.dataGrades, that.dataSubjects);
                    } else {
                        alert('Failed to get any grades.');
                    }
                }
            });
        },
        getStudentsAjax: function () {
            var that = this;
            $.ajax({
                url: this.baseUrl + '/api/get/students',
                dataType: 'json',
                type: 'GET',
                success: function (response) {
                    if (response.success && response.result.students.length) {
                        that.dataStudents = response.result.students;
                        that.updateStudentSelectInput(that.dataStudents);
                    } else {
                        alert('Failed to get any students.');
                    }
                }
            });
        },
        getSubjectsAjax: function () {
            var that = this;
            $.ajax({
                url: this.baseUrl + '/api/get/subjects',
                dataType: 'json',
                type: 'GET',
                success: function (response) {
                    if (response.success && response.result.subjects.length) {
                        that.dataSubjects = response.result.subjects;
                        that.updateSubjectSelectInput(that.dataSubjects);
                    } else {
                        alert('Failed to get any subjects.');
                    }
                }
            });
        },
        addGradeAjax: function (dataForm) {
            var that = this;
            $.ajax({
                type: 'POST',
                url: this.baseUrl + '/api/add_grades',
                dataType: 'json',
                data: dataForm,
                success: function (response) {
                    if (response.success) {
                        that.submitGetGradesForm();
                        that.addGradeForm[0].reset();
                    } else {
                        alert('Failed to add grade!\n' + response.error);
                    }
                }
            });
        },
        gradeTableGenerate: function (grades, subjects, dateFrom, dateTo) {
            this.gradeTable.html('');
            var gradeTableRow = '';
            var gradeTableHead = '<td></td>';

            var d = getDates(dateFrom, dateTo);
            var classAttr = '';
            var dateFormat = '';
            for (var k = 0; k < d.length; k++) {
                dateFormat = pad(d[k].getDate(), 2) + '/' + pad(d[k].getMonth() + 1, 2);
                classAttr = '';
                if (d[k].getDate() == 1) {
                    classAttr = ' class="first-day"';
                }
                gradeTableHead += '<th' + classAttr + '>' + dateFormat + '</th>';
            }
            for (var i = 0; i < d.length; i++) {
                dateFormat = d[i].getFullYear()
                + '-' + pad(d[i].getMonth() + 1, 2)
                + '-' + pad(d[i].getDate(), 2);
                classAttr = '';
                if (d[i].getDate() == 1) {
                    classAttr = ' class="first-day"';
                }
                gradeTableRow += '<td' + classAttr + ' data-date="' + dateFormat + '"></td>';
            }

            this.gradeTable.prepend('<tr class="table-dates">' + gradeTableHead + '</tr>');

            var subjectToShow = $('.input-select-subject', this.getGradesForm).val();
            for (var j = 0; j < subjects.length; j++) {
                if (subjectToShow == '*' || subjectToShow == subjects[j].id) {
                    this.gradeTable.append('<tr data-subject="' + subjects[j].id + '"><th>' + subjects[j].name + '</th>' + gradeTableRow + '</tr>');
                }
            }

            grades.forEach(this.insertGrades);
        },
        gradeAverageChartGenerate: function (grades, subjects) {
            var averages = [];
            var subjectToShow = $('.input-select-subject', this.getGradesForm).val();

            for (var i = 0; i < subjects.length; i++) {
                if (subjectToShow == '*' || subjectToShow == subjects[i].id) {
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
            }

            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Subject');
            data.addColumn('number', 'Average grade');
            for (var k = 0; k < subjects.length; k++) {
                if (subjectToShow == '*' || subjectToShow == subjects[k].id) {
                    data.addRow([subjects[k].name, averages[k]]);
                }
            }

            this.gradeChart.draw(data, this.gradeChartOptions);
        },
        insertGrades: function (element, index, array) {
            var gradeTable = $('.table tbody');
            var cell = $('[data-subject="' + element.subjectId + '"] [data-date="' + element.date + '"]', gradeTable);
            if (cell.length > 0) {
                cell.append(element.grade + ' ');
            }
        },
        updateStudentSelectInput: function (students) {
            var options = '<option value="*">*</option>';
            for (var i = 0; i < students.length; i++) {
                options += '<option value="' + students[i].id + '">' + students[i].name + ' ' + students[i].surname + '</option>';
            }
            if (this.inputSelectStudent.html() != options) {
                this.inputSelectStudent.html(options);
            }
        },
        updateSubjectSelectInput: function (subjects) {
            var options = '<option value="*">*</option>';
            for (var i = 0; i < subjects.length; i++) {
                options += '<option value="' + subjects[i].id + '">' + subjects[i].name + '</option>';
            }
            if (this.inputSelectSubject.html() != options) {
                this.inputSelectSubject.html(options);
            }
        }
    });
});