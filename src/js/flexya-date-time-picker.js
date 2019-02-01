require('../scss/flexya-date-time-picker.scss');

(function ($) {

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
	 * Constants                                                                     *
	\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	const WEEKS_TO_SHOW = 6;
	const DAYS_PER_WEEK = 7;
	const DAYS_TO_SHOW = WEEKS_TO_SHOW * DAYS_PER_WEEK;

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
	 * Plugin Definition                                                             *
	\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	const flexyaDateTimePicker = $.fn.flexyaDateTimePicker = function (methodName) {
		if (methods[methodName]) {
			return methods[methodName].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return methods.init.apply(this, arguments);
		}
	};

	const methods = {
		init: function (options) {
			const element = this;
			options = $.extend({}, flexyaDateTimePicker.defaultOptions, options);

			const month = new Date();
			month.setHours(0, 0, 0, 0);
			month.setDate(1);

			const start = new Date(month);
			setDateToCalendarStart(start, options);

			const end = new Date(start);
			end.setDate(end.getDate() + DAYS_TO_SHOW);

			const defaultData = {
				startTime: start.getTime(),
				endTime: end.getTime(),
				calendarInterval: options.calendarInterval,
				bookingDuration: 3600000,
				travelDuration: 0,
				openHours: [],
				openHouse: [],
				unavailable: []
			};

			const dateTimePicker = dom.create.dateTimePicker(new Date(month), transform(defaultData), options);
			dateTimePicker.data('element', element);
			dateTimePicker.data('options', options);
			dateTimePicker.data('month', new Date(month));

			const hidden = $('<input type="hidden">');
			element.after(hidden);
			element.data('date-time-picker', dateTimePicker);
			dateTimePicker.data('hidden', hidden);

			element.on('focus click', () => showDateTimePicker(dateTimePicker));
			$(document.body).append(dateTimePicker);

			updateMonth(dateTimePicker);

			return element;
		},
		value: function () {
			return this.data('date-time-picker').data('hidden').val();
		}
	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
	 * Public Implementation                                                         *
	\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	$.extend(flexyaDateTimePicker, {
		defaultOptions: {
			url: 'https://services.boligsystem.flexya.dk/service/v20/calendar/list',
			calendarInterval: 900000,
			locale: 'da-DK',
			location: 'below'
		},
		timeFormats: {
			"12": function (date) {
				let hours = date.getHours() % 12;
				hours = hours === 0 ? 12 : hours;
				const minutes = lpad(date.getMinutes(), 2, 0);
				const meridian = date.getHours() < 12 ? "AM" : "PM";
				return hours + ":" + minutes + " " + meridian;
			},
			"24": function (date) {
				return date.getHours() + ":" + lpad(date.getMinutes(), 2, 0);
			}
		},
		locales: {
			"da-DK": require('./locales/da-DK'),
			"en-GB": require('./locales/en-GB'),
			"en-US": require('./locales/en-US')
		}
	});

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
	 * DOM Creators                                                                  *
	\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	const dom = flexyaDateTimePicker.dom = {
		create: {
			dateTimePicker: function (date, data, options) {
				const dateTimePicker = $('<div>');
				dateTimePicker.addClass('date-time-picker');
				dateTimePicker.append(dom.create.datePicker(date, data, options));
				dateTimePicker.append(dom.create.timePicker([], options));
				dateTimePicker.css('position', 'absolute');
				dateTimePicker.hide();
				return dateTimePicker;
			},

			datePicker: function (date, data, options) {
				const datePicker = $('<div>');
				datePicker.addClass('date-picker');
				datePicker.append(dom.create.calendar(date, data, options));
				return datePicker;
			},

			calendar: function (date, data, options) {
				const calendar = $('<table>');
				calendar.data('blocks', data.blocks);
				calendar.addClass('calendar');
				calendar.append(dom.create.calendarHead(date, data, options));
				calendar.append(dom.create.calendarBody(date, data, options));
				return calendar;
			},

			calendarHead: function (date, data, options) {
				const calendarHead = $('<thead>');
				calendarHead.append(dom.create.monthRow(date, data, options));
				calendarHead.append(dom.create.weekdayRow(options));
				return calendarHead;
			},

			monthRow: function (date, data, options) {
				const monthRow = $('<tr>');
				monthRow.append(dom.create.previousButton(date, data, options));
				monthRow.append(dom.create.monthHeader(date, data, options));
				monthRow.append(dom.create.nextButton(date, data, options));
				return monthRow;
			},

			previousButton: function () {
				const previousButton = $('<td>');
				previousButton.addClass('previous');
				previousButton.text('<');
				return previousButton;
			},

			monthHeader: function (date, data, options) {
				const monthHeader = $('<th>');
				monthHeader.attr('colspan', DAYS_PER_WEEK - 2);
				monthHeader.text(getLocale(options).months[date.getMonth()]);
				return monthHeader;
			},

			nextButton: function () {
				const nextButton = $('<td>');
				nextButton.addClass('next');
				nextButton.text('>');
				return nextButton;
			},

			weekdayRow: function (options) {
				const weekdayRow = $('<tr>');
				for (let day = 0; day < DAYS_PER_WEEK; day++) {
					weekdayRow.append(dom.create.weekdayHeader(day, options));
				}
				return weekdayRow;
			},

			weekdayHeader: function (day, options) {
				const locale = getLocale(options);
				const weekdayHeader = $('<th>');
				weekdayHeader.addClass('day-name');
				weekdayHeader.text(locale.days[mod(locale.weekStart + day, DAYS_PER_WEEK)]);
				return weekdayHeader;
			},

			calendarBody: function (date, data, options) {
				const month = new Date(date);
				setDateToCalendarStart(date, options);
				const calendarBody = $('<tbody>');
				for (let week = 0; week < WEEKS_TO_SHOW; week++) {
					calendarBody.append(dom.create.week(month, date, data));
				}
				return calendarBody;
			},

			week: function (month, date, data) {
				const week = $('<tr>');
				week.addClass('week');
				for (let day = 0; day < DAYS_PER_WEEK; day++) {
					week.append(dom.create.day(month, date, data));
				}
				return week;
			},

			day: function (month, date, data) {
				const day = $('<td>');
				day.addClass('day');
				day.data('date', date.getTime());
				const times = data.dates[date.getTime()];
				day.data('times', times.times);
				if (!times.status) {
					day.addClass('unavailable');
				}
				if (month.getMonth() !== date.getMonth()) {
					day.addClass('adjacent');
				}
				day.text(date.getDate());
				date.setDate(date.getDate() + 1);
				return day;
			},

			timePicker: function (times, options) {
				const timePicker = $('<div>');
				timePicker.addClass('time-picker');
				timePicker.append(dom.create.timeList(times, options));
				return timePicker;
			},

			timeList: function (times, options) {
				const timeList = $('<ul>');
				times.forEach(function (time) {
					timeList.append(dom.create.time(time, options));
				});
				return timeList;
			},

			time: function (time, options) {
				const timeItem = $('<li>');
				const dateTime = new Date(time.time);
				const timeDisplay = $('<div>');
				const isHour = dateTime.getMinutes() === 0;
				timeDisplay.addClass(isHour ? 'hour' : 'minute');
				timeDisplay.text(isHour ? flexyaDateTimePicker.timeFormats[getLocale(options).timeFormat](dateTime) : dateTime.getMinutes());
				timeItem.data('time', time.time);
				if (time.unavailable) {
					timeItem.addClass('unavailable');
				}
				timeItem.append(timeDisplay);
				return timeItem;
			}
		}
	};

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
	 * Private Implementation                                                        *
	\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	function lpad(object, size, padding) {
		object = String(object);
		while (object.length < size) {
			object = padding + object;
		}
		return object;
	}

	function mod(a, b) {
		return a % b + (a < 0 ? b : 0);
	}

	function setDateToCalendarStart(date, options) {
		return date.setDate(1 - mod(date.getDay() - getLocale(options).weekStart, DAYS_PER_WEEK));
	}

	function getLocale(options) {
		return flexyaDateTimePicker.locales[options.locale];
	}

	function showDateTimePicker(dateTimePicker) {
		$('.date-time-picker').hide();
		const element = dateTimePicker.data('element');
		const options = dateTimePicker.data('options');
		dateTimePicker.css('top', options.location === 'above' ?
			element.offset().top - dateTimePicker.outerHeight() :
			element.offset().top + element.outerHeight());
		dateTimePicker.css('left', element.offset().left);
		dateTimePicker.css('visibility', 'hidden');
		dateTimePicker.show();
		dateTimePicker.find('ul').outerHeight(dateTimePicker.find('.date-picker').outerHeight());
		dateTimePicker.css('visibility', 'visible');
		return false;
	}

	function deltaMonth(dateTimePicker, delta) {
		const month = dateTimePicker.data('month');
		month.setMonth(month.getMonth() + delta);
		dateTimePicker.data('month', month);
		updateMonth(dateTimePicker);
	}

	function updateMonth(dateTimePicker) {
		const month = dateTimePicker.data('month');
		const options = dateTimePicker.data('options');

		const start = new Date(month);
		setDateToCalendarStart(start, options);

		const end = new Date(start);
		end.setDate(end.getDate() + DAYS_TO_SHOW);

		$.get({
			url: options.url,
			data: {
				caseKey: options.caseKey,
				startTime: start.getTime(),
				endTime: end.getTime()
			},
			success: function (data) {
				data.startTime = start.getTime();
				data.endTime = end.getTime();
				data.calendarInterval = options.calendarInterval;

				dateTimePicker
					.find('.date-picker')
					.empty()
					.append(dom.create.calendar(new Date(month), transform(data), options));
			}
		});
	}

	function setTimeSelection(type, current, typesToRemove) {
		current = $(current);
		const dateTimePicker = $(current).closest('.date-time-picker');
		(typesToRemove || [type]).forEach(function (typeToRemove) {
			['', '-first', '-last'].forEach(function (suffix) {
				dateTimePicker.find('li').removeClass(typeToRemove + suffix);
			});
		});

		const blocks = dateTimePicker.find('.calendar').data('blocks');
		for (let i = 1; i <= blocks; i++) {
			current.addClass(type);
			if (i === 1) {
				current.addClass(type + '-first');
			}
			if (i === blocks) {
				current.addClass(type + '-last');
			}
			current = current.next();
		}
	}

	function transform(data) {

		const unavailable = data.unavailable.concat(data.openHouse);
		unavailable.push({ startTime: data.startTime, endTime: new Date().getTime() });

		const dates = {};

		const day = new Date(data.startTime);
		day.setHours(0, 0, 0, 0);
		while (day.getTime() < data.endTime) {
			const times = [];
			let status = false;
			const openHours = data.openHours.filter(openSlot => day.getDay() === openSlot.dayOfWeek % DAYS_PER_WEEK);
			let time = day.getTime();
			let timeEnd = time + data.calendarInterval;
			const endOfDay = new Date(day);
			endOfDay.setDate(endOfDay.getDate() + 1);
			while (timeEnd <= endOfDay.getTime()) {
				const isUnavailable =
					!openHours.some(openSlot => day.getTime() + openSlot.startTime <= time && timeEnd <= day.getTime() + openSlot.endTime) ||
					unavailable.some(unavailable => time < unavailable.endTime && unavailable.startTime < timeEnd);
				times.push({
					time: time,
					unavailable: isUnavailable
				});
				if (!isUnavailable) {
					status = true;
				}
				time += data.calendarInterval;
				timeEnd = time + data.calendarInterval;
			}
			dates[day.getTime()] = {
				times: times,
				status: status
			};
			day.setDate(day.getDate() + 1);
		}

		return {
			dates: dates,
			blocks: Math.ceil(data.bookingDuration / data.calendarInterval)
		};
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\
	 * Events                                                                        *
	\* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	$(document).on('click', function () {
		$('.date-time-picker').hide();
	});

	$(document).on('click', '.date-time-picker', function () {
		return showDateTimePicker($(this));
	});

	$(document).on('mouseout', '.date-time-picker .date-picker', function () {
		const dateTimePicker = $(this).closest('.date-time-picker');
		dateTimePicker.find('.day').removeClass('hover');
	});

	$(document).on('mouseover', '.date-time-picker .date-picker .day', function () {
		const dateTimePicker = $(this).closest('.date-time-picker');
		dateTimePicker.find('.day').removeClass('hover');
		$(this).addClass('hover');
	});

	$(document).on('click', '.date-time-picker .date-picker .previous', function () {
		deltaMonth($(this).closest('.date-time-picker'), -1);
	});

	$(document).on('click', '.date-time-picker .date-picker .next', function () {
		deltaMonth($(this).closest('.date-time-picker'), 1);
	});

	$(document).on('click', '.date-time-picker .date-picker .day', function () {
		const dateTimePicker = $(this).closest('.date-time-picker');
		const options = dateTimePicker.data('options');
		dateTimePicker.find('.day').removeClass('selected');
		$(this).addClass('selected');

		const times = $(this).data('times');
		dateTimePicker.find('.time-picker').remove();
		dateTimePicker.append(dom.create.timePicker(times, options));

		const timeList = dateTimePicker.find('.time-picker ul');
		const available = timeList.find('li:not(.unavailable)');
		if (available.length) {
			timeList.scrollTop(timeList.scrollTop() + available.position().top);
		}
	});

	$(document).on('mouseout', '.date-time-picker .time-picker', function () {
		const dateTimePicker = $(this).closest('.date-time-picker');
		dateTimePicker.find('li').removeClass('hover hover-first hover-last');
	});

	$(document).on('mouseover', '.date-time-picker .time-picker li', function () {
		setTimeSelection('hover', this);
	});

	$(document).on('click', '.date-time-picker .time-picker li', function () {
		const dateTimePicker = $(this).closest('.date-time-picker');
		const blocks = dateTimePicker.find('.calendar').data('blocks');
		let current = $(this);
		let unavailable = false;
		for (let i = 1; i <= blocks; i++) {
			unavailable |= current.hasClass('unavailable');
			current = current.next();
		}

		setTimeSelection(unavailable ? 'selected-unavailable' : 'selected', this, ['selected', 'selected-unavailable']);

		const value = unavailable ? '' : $(this).data('time');
		const display = unavailable ? '' : new Date(value).toLocaleString();
		dateTimePicker.data('element').val(display).trigger('input');
		dateTimePicker.data('hidden').val(value);
	});

})(jQuery);
