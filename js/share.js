
// Parameters: This module captures url parameters
var Parameters = (function() {

  function par(name) {
    /* from Netlobo.com (http://www.netlobo.com/url_query_string_javascript.html) */
    var regexS = "[\\?&]" + name + "=([^&]*)";
    var regex = new RegExp(regexS);
    var tmpURL = window.location.href;

    var results = regex.exec(tmpURL);
    if (results == null)
      return "";
    else
      return decodeURIComponent(results[1]);
  }

  var title = par("title"),
    url = par("url")

  return {
    title: title,
    url: url,
    notes: par("notes"),
    redir: par("redirect"),
    urlautolist: par("urlautolist"),
    shortened: null,
    use_shortened: false,

    toggleMarkdown: function() {

    }
  }
})

// Selector: Module to retrieve and modify user selection of pod
var Selector = (function() {
  var pods, selected = -1

  return {
    updatePods: function() {
      pods = document.querySelectorAll(".pod-list a")
    },

    selected: function() {
      return pods[selected]
    },

    selectNext: function() {
      if (selected >= 0) pods[selected].classList.remove("selected")

      if (++selected == pods.length)
        --selected

      pods[selected].classList.add("selected")

      return this.selected()
    },

    selectPrev: function() {
      pods[selected].classList.remove("selected")

      if (--selected < 0)
        ++selected

      pods[selected].classList.add("selected")

      return this.selected()
    }
  }
})()

// Keyboard: Module in charge of appropiate responses to keyboard events
var Keyboard = (function() {
  const downKey = 40, upKey = 38
  var target

  return {
    setEvents: function() {
      target = document.querySelector(".search input")

      // Detect up and down keys to move selected pod
      target.onkeydown = function(e) {
        var event = window.event ? window.event : e

        if (event.keyCode == downKey) {
          Selector.selectNext()
        } else if (event.keyCode == upKey) {
          Selector.selectPrev()
        }
      }

      target.focus()
    }
  }
})()

window.onload = function() {
  Selector.updatePods()
  Selector.selectNext()
  Keyboard.setEvents()
}
