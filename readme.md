flexya-date-time-picker
=======================

Copyright (c) 2017 Flexya A/S

About
-----

flexya-date-time-picker is a jQuery plugin which interfaces with Flexya's calendar services. It
creates a calendar widget which makes it simple for your users to select available dates and times
from your calendars.

Installation
------------

The installation files can be downloaded as a zip file from this project's release page on github,
or installed using npm.  The files in the npm installation's dist folder are the same as those
found on the github release page.  The files include a single css and js file, along with
corresponding minified versions, and then finally a source map for each file.

Once the files are downloaded, they can be included in your project in various ways:

You can use them directly in your html:

```html
<link rel="stylesheet" href="flexya-date-time-picker.min.css">
<script src="flexya-date-time-picker.min.js"></script>
```

Or, if you're using a module bundler like webpack, you can require them directly into your project:

```javascript
require('flexya-date-time-picker');
```

Usage
-----

flexya-date-time-picker works just like any other jQuery widget.  Simply select an input element
and then call the plugin's method with options:

```javascript
$('input[name="date"]').flexyaDateTimePicker(options);
```

The available options, as well as their default values, are as follows:

```javascript
{
	// The url which is used for retrieving calendar data.  Since the calendar
	// API currently does not support CORS, you will need to proxy to your own
	// service to provide credentials.
	"url": "https://service.boligsystem.flexya.dk/service/v20/calendar/list",
	
	// If the calendar is tied to a specific case, rather than a global
	// calendar, then the case key should be provided here.
	"caseKey": null,
	
	// The size of a time slot on the time picker.
	// Defaults to 15 minutes (900000 milliseconds).
	"calendarInterval": 900000,
	
	// The locale used by the calendar, for displaying dates, times, etc.
	"locale": "da-DK"
	
	// Indicates where the widget should appear relative to its host control.
	// Valid values are "above" or "below".
	"location": "below"
}
```

Locales can be implemented by adding a locale definition to the plugin's list of locales:

```javascript
$.fn.flexyaDateTimePicker.locales['my-locale-name'] = {
	// ... locale definition ...
};
```

See the default locales included in the project to see the locale definition format.

Customization
-------------

Due to the complexity of the widget, it may be difficult to customize the look and feel by
overriding the css.  The easiest way to customize the widget would be by using scss, overriding
the following variables, and then compiling to css yourself:

```scss
// The background color of the entire widget.
$background-color: white;

// The background color of days and times which are "unavailable".
$unavailable-background-color: #eee;

// The text color of days outside the current month.
$adjacent-color: #999;

// The margin used by various components within the widget.
$widget-margin: 1rem;

// The border properties of the entire widget.
$widget-border-thickness: 1px;
$widget-border-color: #888;
$widget-border-pattern: solid;

// The border properties of a selected/hovered day or time.
$selection-border-thickness: 2px;
$selection-hover-border-color: #3bf;
$selection-selected-border-color: #9d3;
$selection-selected-unavailable-border-color: #d88;
$selection-border-pattern: solid;
```

License
-------

flexya-date-time-picker is licensed under the MIT License.  See license.md.
