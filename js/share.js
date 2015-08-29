
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

  return {
    title: par("title"),
    url: par("url"),
    notes: par("notes"),
    redir: par("redirect"),
    reloadPods: par("refresh"),
    urlautolist: par("urlautolist"),
    shortened: null,

    shorten: function() {
      if (!this.shortened) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://api.bitly.com/v3/shorten?login=bartimeo&apiKey=R_5fe8386a052e3f3d6ece604eab0c59db&format=txt&domain=j.mp&longUrl=" + url);

        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              console.log(xhr.responseText);
              this.shortened = decodeURIComponent(encodeURIComponent(xhr.responseText).replace("%0A",""));
            } else {
              console.log("Error:", xhr);
            }
          }
        }
        xhr.send();
      }
    }
  };
})();

// PodLoader: Module for load and storage of a list of pods from Poduptime
var PodLoader = (function() {
  "use strict";

  var now = Math.round(Date.now() / 1000);

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

    var target = document.querySelector(".pod-list");

    for (var i = 0; i < pods.length; i++) {
      if (pods[i]) {
        var link = document.createElement("a");

        link.href = "https://" + pods[i] + "/stream";
        link.setAttribute("data-pod-url", "http://" + pods[i]);
        link.textContent = pods[i];

        target.appendChild(link);
      }
    }

    Selector.updatePods();
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
  };
})();

// Selector: Module to retrieve and modify pod list and user selection
var Selector = (function() {
  "use strict";

  var pods, selected = -1;

  function selectPod(index) {
    if (index >= 0 && index < pods.length) {
      if (pods[selected])
        pods[selected].classList.remove("selected");

      selected = index;
      pods[selected].classList.add("selected");
    }
  }

  return {
    updatePods: function() {
      pods = document.querySelectorAll(".pod-list a");

      for (var i = 0; i < pods.length; i++) {
        pods[i].setAttribute("data-index", i);

        pods[i].onclick = function(e) {
          var event = window.event ? window.event : e;
          event.preventDefault();

          selectPod(this.getAttribute("data-index"));
          Redirection.go();
        }
      }
    },

    selected: function() {
      return pods[selected];
    },

    selectNext: function() {
      selectPod(selected + 1);
      return this.selected();
    },

    selectPrev: function() {
      selectPod(selected - 1);
      return this.selected();
    }
  };
})();

// Keyboard: Module in charge of appropiate responses to keyboard events
var Keyboard = (function() {
  "use strict";

  const downKey = 40, upKey = 38;

  return {
    setEvents: function() {
      var form = document.querySelector(".search");

      form.onsubmit = function(e) {
        var event = window.event ? window.event : e;
        event.preventDefault();
        Redirection.go();
      }

      var target = form.querySelector("input");

      // Detect up and down keys to move selected pod
      target.onkeydown = function(e) {
        var event = window.event ? window.event : e;

        if (event.keyCode == downKey) {
          Selector.selectNext().scrollIntoView(false);
        } else if (event.keyCode == upKey) {
          Selector.selectPrev().scrollIntoView(false);
        }
      }

      target.focus();
    }
  };
})();

var Redirection = (function() {
  return {
    go: function() {
      var pod = Selector.selected().getAttribute("data-pod-url"),
        useMarkdown = document.querySelector("#markdown").checked,
        useShortened = document.querySelector("#shorten").checked,
        rememberChoice = document.querySelector("#remember").checked;

      var url = useShortened ? Parameters.shortened : Parameters.url,
        title = useMarkdown ?
          ("[" + Parameters.title + "]" + "(" + url + ")") :
          Parameters.title;

      if (useMarkdown)
        url = "";

      var bookmarklet = pod + "/bookmarklet?title=" +
        encodeURIComponent(title) +
        "&url=" + encodeURIComponent(url) +
        (Parameters.notes.length > 0 ? ("&notes=" + Parameters.notes) : "") +
        "&jump=doclose";

      location.href = bookmarklet;
    }
  };
})();

window.onload = function() {
  "use strict";

  PodLoader.loadPods();
  Selector.updatePods();
  Selector.selectNext();
  Keyboard.setEvents();
};
