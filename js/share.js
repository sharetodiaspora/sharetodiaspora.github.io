
// Parameters: This module captures url parameters
var Parameters = (function() {
  "use strict";

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
    url = par("url"),
    usingMarkdown = false

  return {
    title: title,
    url: url,
    notes: par("notes"),
    redir: par("redirect"),
    urlautolist: par("urlautolist"),
    shortened: null,
    use_shortened: false,

    toggleMarkdown: function() {
      if (!usingMarkdown) {
        this.title = "[" + title + "](" + url + ")"
        this.url = ""
      } else {
        this.title = title
        this.url = url
      }
    },

    toggleShorten
  }
})

//
var PodLoader = (function() {
  "use strict";

  var now = Math.round(Date.now() / 1000)

  function generateList(pods) {
    /*var podsHtmlList = document.createElement('datalist');
    podsHtmlList.setAttribute('id','podslist');

    for (var i = 0; i < pods.length; i++) {
      var optionHtml = document.createElement('option');
      optionHtml.setAttribute('value', pods[i]);
      podsHtmlList.appendChild(optionHtml);
    }

    document.getElementById('podinput').appendChild(podsHtmlList);
    document.getElementById('podurl').setAttribute('list', 'podslist');
    document.getElementById('podurl').placeholder = pods[Math.floor(Math.random() * pods.length)];*/

    var target = document.querySelector(".pod-list")

    for (var i = 0; i < pods.length; i++) {
      if (pods[i]) {
        var link = document.createElement("a")
        link.textContent = pods[i]
        target.appendChild(link)
      }
    }

    Selector.updatePods()
  }

  return {
    loadPods: function() {
      if (localStorage.podslisttime && ((parseInt(localStorage.podslisttime) + 86400) > now)) {
        var pods = JSON.parse(localStorage.podslist);
        generateList(pods);
      } else {
        var script = document.createElement('script');
        script.src = 'https://podupti.me/api.php?key=4r45tg&format=json&method=jsonp&callback=PodLoader.fromPoduptime';
        document.head.appendChild(script);
      }
    },

    fromPoduptime: function(result) {
      if (typeof(result.podcount) !== 'undefined') {
        var pods = [];

        for (var i = 0; i < result.podcount; i++) {
          var pod = result.pods[i];

          if (pod.status.toLowerCase() === 'up') {
            pods[pod.id] = pod.domain;
          }
        }

        localStorage.podslist = JSON.stringify(pods);
        localStorage.podslisttime = Math.round(Date.now() / 1000);
        generateList(pods);
      }
    }
  }
})()

// Selector: Module to retrieve and modify user selection of pod
var Selector = (function() {
  "use strict";

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
  "use strict";

  const downKey = 40, upKey = 38
  var target

  return {
    setEvents: function() {
      target = document.querySelector(".search input")

      // Detect up and down keys to move selected pod
      target.onkeydown = function(e) {
        var event = window.event ? window.event : e

        if (event.keyCode == downKey) {
          Selector.selectNext().scrollIntoView(false)
        } else if (event.keyCode == upKey) {
          Selector.selectPrev().scrollIntoView(false)
        }
      }

      target.focus()
    }
  }
})()

window.onload = function() {
  "use strict";

  PodLoader.loadPods()
  Selector.updatePods()
  Selector.selectNext()
  Keyboard.setEvents()
}
