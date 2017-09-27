/**
 * Created by lenafaure on 20/09/2017.
 */

!function() {

    var today = moment();

    function Calendar(selector, time_slots) {
        this.el = document.querySelector(selector);
        this.time_slots = time_slots;
        this.current = moment().startOf('week');
        this.selection = JSON.parse(localStorage.getItem('availablities')) || [];
        this.draw_calendar();
    }


    Calendar.prototype.draw_calendar = function() {
        // Draw Header
        this.draw_header();

        // Draw Week
        this.draw_week();
    }

    Calendar.prototype.draw_header = function() {
        // Refer to Calendar Object with "self" when "this" refers to an event
        var self = this;

        if(!this.header) {
            // Create header elements
            this.header = createElement('div', 'header');
            this.title = createElement('h1');

            var right = createElement('div', 'right');
            right.addEventListener('click', function () {
                self.next_week();
            });

            var left = createElement('div', 'left');
            left.addEventListener('click', function () {
                self.prev_week();
            });

            // Append header elements to Calendar
            this.header.appendChild(this.title);
            this.header.appendChild(right);
            this.header.appendChild(left);
            this.el.appendChild(this.header);
        }

        this.title.innerHTML = "Semaine " + this.current.week();
    }

    Calendar.prototype.draw_week = function() {
        var self = this;

        if(this.week){
            this.old_week = this.week;
            this.old_week.className = 'week out ' + (self.next ? 'next' : 'prev');
            this.old_week.addEventListener('webkitAnimationEnd', function() {
                self.old_week.parentNode.removeChild(self.old_week);
                self.week = createElement('div', 'week');
                self.current_week();
                self.el.appendChild(self.week);
                window.setTimeout(function() {
                    self.week.className = 'week in ' + (self.next ? 'next' : 'prev');
                }, 16);
            });
        }
        else {
            this.week = createElement('div', 'week');
            this.el.appendChild(this.week);
            this.current_week();
            this.week.className = 'week current';
        }
    }

    Calendar.prototype.current_week = function() {
        var clone = this.current.clone();

        while(clone.week() === this.current.week()) {
            clone.add('days', 1);
            this.draw_day(clone);
        }
    }

    Calendar.prototype.next_week = function() {
        this.current.add('weeks', 1);
        this.next = true;
        this.draw_calendar();
    }

    Calendar.prototype.prev_week = function() {
        this.current.subtract('weeks', 1);
        this.next = false;
        this.draw_calendar();
    }

    Calendar.prototype.draw_day = function(day) {

        if (!this.get_day_class(day).includes('other')) {

            var day_wrapper = createElement('div', this.get_day_class(day));
            var day_name = createElement('div', 'day-name', day.locale('fr').format('ddd'));
            var day_number = createElement('div', 'day-number', day.format('DD'));
            var day_month = createElement('div', 'day-month', day.locale('fr').format('MMM'));
            var day_slot = createElement('div', 'day-slot', '', 'data-date', day.format());

            if(day.day() <= 5) {
                this.draw_time_slot(day, day_slot);
            }
            day_wrapper.appendChild(day_name);
            day_wrapper.appendChild(day_number);
            day_wrapper.appendChild(day_month);
            day_wrapper.appendChild(day_slot);
            this.week.appendChild(day_wrapper);

        }
    }

    Calendar.prototype.draw_time_slot = function(day, element) {
        var self = this;

        var selected_slots = localStorage.getItem('availablities');
        var today_time_slot = this.time_slots.find(function(element) {
            return element.weekday == day.day();
        });

        if(today_time_slot) {
            today_time_slot.slots.forEach(function(ts) {
                var ts_span = createElement('div', 'time-slot', ts, 'data-event', ts);

                if(selected_slots){
                    if(selected_slots.indexOf(JSON.stringify([day.format(), ts])) != -1 ){
                        ts_span.className = "time-slot selected";
                    }
                }

                element.appendChild(ts_span);

                ts_span.addEventListener('click', function () {
                    self.select_time_slot(this, day);
                });
            });
        }
    }

    // A function to add a different class to "today"
    Calendar.prototype.get_day_class = function(day) {
        classes = ['day'];

        if(day.week() !== this.current.week()) {
            classes.push('other');
        }
        else if(today.isSame(day, 'day')) {
            classes.push('today');
        }
        return classes.join(' ');
    }

    Calendar.prototype.select_time_slot = function(element) {
        var element_data = [element.parentNode.getAttribute('data-date'),element.getAttribute('data-event')];

        if(element.className.includes('selected')) {
            element.className = "time-slot";

            // Find and remove element in selections array
            var element_index = this.selection.findIndex(function(item){
                return JSON.stringify(item) == JSON.stringify(element_data);
            });

            this.selection.splice(element_index, 1);
        }
        else {
            element.className = "time-slot selected";
            this.selection.push(element_data);
        }

        localStorage.setItem('availablities', JSON.stringify(this.selection));
    }

    // A function to create html elements
    function createElement(tagName, className, innerText, dataAttributeName, dataAttributeValue) {
        var html_element = document.createElement(tagName);
        if(className) {
            html_element.className = className;
        }
        if(innerText) {
            html_element.innerText = html_element.textContent = innerText;
        }
        if(dataAttributeName && dataAttributeValue) {
            html_element.setAttribute(dataAttributeName, dataAttributeValue);
        }
        return html_element;
    }

    window.Calendar = Calendar;

}();

!function() {
    var time_slots = [
        {   weekday: 1,
            slots:
                [
                    "Interclasse",
                    "Goûter / Etude"
                ]
        },
        {
            weekday: 2,
            slots:
                [
                    "Interclasse",
                    "TAP",
                    "Goûter / Etude"
                ]
        },
        {
            weekday: 3,
            slots:
                [
                    "Interclasse",
                    "Centre de Loisirs"
                ]
        },
        {   weekday: 4,
            slots:
                [
                    "Interclasse",
                    "Goûter / Etude"
                ]
        },
        {
            weekday: 5,
            slots:
                [
                    "Interclasse",
                    "TAP",
                    "Goûter / Etude"
                ]
        }
    ];

    var calendar = new Calendar('#calendar', time_slots);

}();

!function() {

    var validate_availabilities = document.querySelector('#calendar_validate');

    function onAvailabilityValidate() {
        var JsonLocalStorageObj = JSON.stringify(localStorage);
        console.log(JsonLocalStorageObj);
        $.ajax({
            url: "/availabilities",
            type: "POST",
            data: { availability: {date: "ma_date", time_slot: "mon_slot"} },
            success: function (data) {
                console.log(data);
            }
        });
    }

    validate_availabilities.addEventListener('click', onAvailabilityValidate);
}();