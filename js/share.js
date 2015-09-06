
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
    redirect: par("redirect"),
    reloadPods: par("refresh"),
    shortened: null,

    shorten: function(callback) {
      if (!this.shortened) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api-ssl.bitly.com/v3/shorten?login=bartimeo&apiKey=R_5fe8386a052e3f3d6ece604eab0c59db&format=txt&domain=j.mp&longUrl=" + encodeURIComponent(this.url));

        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              Parameters.shortened = decodeURIComponent(encodeURIComponent(xhr.responseText).replace("%0A",""));
              callback();
            } else {
              console.error(xhr);
            }
          }
        }
        xhr.send();
      }
    },

    displayUI: function() {
      document.querySelector(".title").textContent = this.title.length > 0 ?
        this.title : "[no title]";
      document.querySelector(".url").textContent = this.url.length > 0 ?
        this.url : "[no url]";
    }
  };
})();

// PodLoader: Module for load and storage of a list of pods from Poduptime
var PodLoader = (function() {
  "use strict";

  var now = Math.round(Date.now() / 1000);

  function generateList(pods) {
    var podList = [];

    for (var i = 0; i < pods.length; i++) {
      if (pods[i]) {
        var link = document.createElement("a");

        link.href = "https://" + pods[i] + "/stream";
        link.setAttribute("data-pod-url", pods[i]);
        link.textContent = pods[i];

        podList.push(link);
      }
    }

    Selector.insertPods(podList);
    Selector.filter(document.querySelector(".search input").value);
  }

  return {
    loadPods: function() {
      if (localStorage.podslisttime && ((parseInt(localStorage.podslisttime) + 86400) > now) && Parameters.reloadPods !== "true") {
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

  var pods, visible = [], selected = -1;

  function selectPod(index) {
    if (index >= 0 && index < visible.length) {
      if (document.querySelector(".selected"))
        document.querySelector(".selected").classList.remove("selected");

      selected = index;
      visible[selected].classList.add("selected");
    }
  }

  return {
    insertPods: function(podList) {
      pods = podList;
      var listNode = document.querySelector(".pod-list");

      // Retrieve last pods used
      if (Memory.suggest()) {
        var memo = Memory.getPods();

        for (var i = memo.length - 1; i >= 0; i--) {
          var newLink = document.createElement("a");
          newLink.classList.add("memorized");
          newLink.textContent = memo[i];
          newLink.setAttribute("data-pod-url", memo[i]);
          pods.unshift(newLink);
        }
      }

      for (var i = 0; i < pods.length; i++) {
        pods[i].onclick = function(e) {
          var event = window.event ? window.event : e;
          event.preventDefault();
          Redirection.go(this.getAttribute("data-pod-url"));
        }

        listNode.appendChild(pods[i]);
      }
    },

    filter: function(query) {
      var lastSelected = this.selected();
      visible = [];

      // When query resembles an url, add a custom option
      var customLink = document.querySelector(".custom");

      if (query.indexOf(".") > -1) {
        if (!customLink) {
          customLink = document.createElement("a");
          customLink.classList.add("custom");
          document.querySelector(".pod-list").insertBefore(customLink, pods[0]);
        }

        customLink.textContent = query;
        customLink.setAttribute("data-pod-url", query);
        visible.push(customLink);
      } else if (customLink) {
        customLink.parentNode.removeChild(customLink);
      }

      if (query.length > 0) { // Search for matching pods
        for (var i = 0; i < pods.length; i++) {
          var index = pods[i].textContent.indexOf(query);

          if (index > -1) {
            pods[i].innerHTML = pods[i].textContent.replace(query, "<strong>" + query + "</strong>");
            pods[i].classList.remove("hidden");
            visible.push(pods[i]);
          } else {
            pods[i].classList.add("hidden");
          }
        }
      } else { // Reset the list of pods
        for (var i = 0; i < pods.length; i++) {
          pods[i].innerHTML = pods[i].textContent;

          if (i > 10)
            pods[i].classList.add("hidden");
          else {
            pods[i].classList.remove("hidden");
            visible.push(pods[i]);
          }
        }
      }

      // Last resort: if no matches are found and query doesn't look
      // like a link, show a custom link
      if (visible.length === 0 && !document.querySelector(".custom")) {
        customLink = document.createElement("a");
        customLink.classList.add("custom");
        document.querySelector(".pod-list").insertBefore(customLink, pods[0]);
        visible.push(customLink);
        customLink.textContent = query;
        customLink.setAttribute("data-pod-url", query);
      }

      // Select either previous selected pod or first pod in list
      selectPod(visible.indexOf(lastSelected) > -1 ?
        visible.indexOf(lastSelected) : 0);
    },

    selected: function() {
      return visible[selected];
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

// EventHandler: Module in charge of appropiate responses to keyboard
// events and changes in options
var EventHandler = (function() {
  "use strict";

  const downKey = 40, upKey = 38;

  return {
    setEvents: function() {
      // Redirection when enter key is pressed
      var form = document.querySelector(".search");

      form.onsubmit = function(e) {
        var event = window.event ? window.event : e;
        event.preventDefault();
        Redirection.go();
      }

      // Detect up and down keys to move selected pod
      var target = form.querySelector("input");

      target.onkeydown = function(e) {
        var event = window.event ? window.event : e;

        if (event.keyCode == downKey) {
          Selector.selectNext().scrollIntoView(false);
        } else if (event.keyCode == upKey) {
          Selector.selectPrev().scrollIntoView(false);
        }
      }

      target.oninput = function() {
        Selector.filter(this.value);
      }

      target.select();

      // Shorten link when corresponding option is selected
      document.querySelector("#shorten").onchange = function() {
        if (this.checked) {
          if (!Parameters.shortened)
            Parameters.shorten(function() {
              document.querySelector(".url").textContent = Parameters.shortened;
            });
          else
            document.querySelector(".url").textContent = Parameters.shortened;
        } else {
          document.querySelector(".url").textContent = Parameters.url;
        }

        document.querySelector(".search input").focus();
      };

      // Let search input always capture focus
      document.querySelector("#markdown").onchange = function() {
        document.querySelector(".search input").focus();
      };

      document.querySelector("#remember").checked = Memory.direct() ? "checked" : "";

      document.querySelector("#remember").onchange = function() {
        Memory.direct(this.checked);
        document.querySelector(".search input").focus();
      };

      document.querySelector("#nosuggest").checked = Memory.suggest() ? "" : "checked";

      document.querySelector("#nosuggest").onchange = function() {
        Memory.suggest(!this.checked);
        document.querySelector(".search input").focus();
      };
    }
  };
})();

// Memory: Manages local stored values such as memorized pods and options
var Memory = (function() {
  "use strict";
  
  return {
    direct: function(value) {
      if (value !== undefined)
        localStorage.remember = value;

      return localStorage.remember == "true" && localStorage.lastPod;
    },

    suggest: function(value) {
      if (value !== undefined) {
        localStorage.forget = !value;

        if (value === false) {
          var keys = ["lastPod", "lastPod2", "lastPod3"];

          for (var k in keys)
            localStorage.removeItem(keys[k]);
        }
      }

      return !localStorage.forget || localStorage.forget == "false"
    },

    getPods: function() {
      var keys = ["lastPod", "lastPod2", "lastPod3"],
        memorized = [];

      for (var k in keys) {
        if (localStorage[keys[k]])
          memorized.push(localStorage[keys[k]]);
      }

      return memorized;
    },

    add: function(newPod) {
      if (localStorage.lastPod && localStorage.lastPod !== newPod) {
        if (localStorage.lastPod2 && localStorage.lastPod2 !== newPod)
          localStorage.lastPod3 = localStorage.lastPod2;

        localStorage.lastPod2 = localStorage.lastPod;
      }

      localStorage.lastPod = newPod;
    }
  };
})();

// Redirection: This module composes and redirects to the appropriate url
var Redirection = (function() {
  "use strict";

  return {
    go: function(p) {
      var pod = p || Selector.selected().getAttribute("data-pod-url"),
        useMarkdown = document.querySelector("#markdown").checked,
        useShortened = document.querySelector("#shorten").checked;

      var url = useShortened ? Parameters.shortened : Parameters.url,
        title = useMarkdown ?
          ("[" + Parameters.title + "]" + "(" + url + ")") :
          Parameters.title;

      if (useMarkdown)
        url = "";

      var bookmarklet = "http://" + pod + "/bookmarklet?title=" +
        encodeURIComponent(title) +
        "&url=" + encodeURIComponent(url) +
        (Parameters.notes.length > 0 ? ("&notes=" + Parameters.notes) : "") +
        "&jump=doclose";

      // Remember this pod
      if (Memory.suggest()) {
        Memory.add(pod);
      }

      location.href = bookmarklet;
    }
  };
})();

window.onload = function() {
  "use strict";

  if (Memory.direct() && Parameters.redirect !== "false") {
    Redirection.go(Memory.direct());
  }
  PodLoader.loadPods();
  EventHandler.setEvents();
  Parameters.displayUI();
};
