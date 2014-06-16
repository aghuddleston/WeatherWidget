;(function() {
  var jQuery, scriptTag;

  // looking for correct version of jQuery.  If not found, load it from CDN.
  // Assign jQuery to a local variable.
  if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.11.1') {
    scriptTag = document.createElement('script');

    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js");
    if (scriptTag.readyState) {
      scriptTag.onreadystatechange = function() {
        if (this.readyState === 'complete' || this.readyState === 'loaded') {
          scriptLoadHandler();
        }
      };
    } else {
      scriptTag.onload = scriptLoadHandler;
    }
    // try to find head element
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(scriptTag);
  } else {
    jQuery = window.jQuery;
  }

  function scriptLoadHandler (){
    // Restore $ and window.jQuery to their previous values and store the
    // new jQuery in our local jQuery variable
    jQuery = window.jQuery.noConflict(true);
    main();
  }

  /**
   * Assumes #annie-weather-widget div is on the page.  Links two stylesheets
   * into the page, cleanslate.css and ww.css.  Builds up an html string of the
   * widget and then inserts it into the #annie-weather-widget div.
   */
  function main() {
    jQuery(document).ready(function($) {
      $('<link rel=stylesheet href="cleanslate.css">').appendTo('head');
      $('<link rel=stylesheet href="ww.css">').appendTo('head');

      var jsonpUrl = "http://query.yahooapis.com/v1/public/yql?" +
            "q=select%20item%20from%20weather.forecast%20where%20location%3D%2222102%22&format=json&callback=?";
      $.getJSON(jsonpUrl, function(data) {
        try {
          var item = data.query.results.channel.item,
              loc, html;
          loc = item.title || 'Unknown location';
          html = "<div class='annieweather cleanslate'>";
          html += buildLocation(loc);
          html += buildCurrentCondition(item);
          html += buildForecastHtml(item.forecast);
          html += "</div>";
          $('#annie-weather-widget').html(html);
        } catch (e) {
          $('#annie-weather-widget').html("<div class='annieweather cleanslate'>Snap!  Can't show the weather right now!</div>");
        }
      });
    });
  }

  /**
   * Build location div.
   * @param loc  Assume string is structured "Conditions for <city> at ..."
   * @returns {string} Location div
   */
  function buildLocation(loc) {
    var opener = "Conditions for ",
        tempStr = loc,
        re = / at /,
        endIndex, cleanLoc, str;

    endIndex = tempStr.search(re);
    cleanLoc = tempStr.slice(opener.length, endIndex);
    str = "<div class='weatherloc'>" + cleanLoc + "</div>";
    return str;
  }

  /**
   * Build the current conditions div
   * @param item full weather response object
   * @returns {string} current conditions div
   */
  function buildCurrentCondition(item) {
    var currentTemp = item.condition.temp,
        currentText = item.condition.text,
        descr = item.description,
        // description includes an img tag with weather img
        imgTag = jQuery(descr).filter('img')[0],
        str;

    str = "<div class='current'>"
        + "<div class='condition'>"
        + "<img src='" + jQuery(imgTag).attr('src') +"'/>"
        + "<span>" + currentText + "</span>"
        + "</div>"
        + "<div class='temp'>"
        + asDegree(currentTemp)
        + "</div>"
        + "</div>";

    return str;
  }

  /**
   * Build the forecast ul
   * @param forecast array of forecasts
   * @returns {string} forecast ul or span if an error occurs
   */
  function buildForecastHtml(forecast) {
    var i, len, str;
    try {
      str = "<ul class='forecast'>";
      for (i=0, len=forecast.length; i<len; i+=1) {
        str += "<li>"
            + "<div class='daily'>"
            + "<div class='day'>" + forecast[i].day + "</div>"
            + "<div class='highlow'>" + asDegree(forecast[i].high) + " / " + asDegree(forecast[i].low) + "</div>"
            + " </div>"
            + "</li>";
      }
      str += "</ul>";
    } catch (e) {
      str = "<span>Forecast unavailable</span>";
    }
    return str;
  }

  function asDegree(temp) {
    return temp + "&deg;";
  }

})();
