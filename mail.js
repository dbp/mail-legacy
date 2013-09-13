function findBody(bodyContent, setBody) {
  if (typeof bodyContent === 'string') {
    setBody(bodyContent.replace(/\n/g, "<br />"));
  } else {
    var tmp = bodyContent.filter(function (o) { return o["content-type"] == "text/plain"});
    if (tmp.length > 0) {
      setBody(tmp[0].content.replace(/\n/g, "<br />"));
    } else {
      // look for html
      tmp = bodyContent.filter(function (o) { return o["content-type"] == "text/html"});
      if (tmp.length > 0) {
        // need to load via a separate call... :(
        var load = $("<button class='button'>Load HTML</button>");
        setBody(load);
        load.click(function () {
          $.ajax("/mail/html/" + content.id + "/" + tmp[0].id, {
            data: {p: getPassword()},
            success: function (data) {
              setBody(data);
            }
          });
        });
      } else {
        // see if we need to go deeper
        tmp = bodyContent.filter(function (o) { return o["content-type"] == "multipart/alternative"});
        if (tmp.length > 0) {
          findBody(tmp[0].content, setBody);
        } else {
          setBody("Could not find message body in JSON.");
        }
      }
    }
  }

}

function renderMessages(data, container) {
  var msgs = data[0];
  var content = msgs[0];
  var section = $("<div class='section'>");
  container.append(section);
  var headers = content.headers;
  var headerDiv = $("<div class='headers'>");
  headerDiv.append("<div>From: " + headers.From + "</div>");
  headerDiv.append("<div>To: " + headers.To + "</div>");
  headerDiv.append("<div>Subject: " + headers.Subject + "</div>");
  headerDiv.append("<div>Date: " + headers.Date + "</div>");
  section.append(headerDiv);
  var bodyContent = content.body[0].content;
  var bodyDiv = $("<div class='body'>");
  function setBody(body) {
    bodyDiv.html(body);
  }
  findBody(bodyContent, setBody);
  section.append(bodyDiv);

  if (msgs.length > 1 && msgs[1].length > 0) {
    renderMessages(msgs[1], container);
  }
}

function loadMail(container) {
  container.contents().hide();
  container.append($("<div class='loading'>Loading...</div>"));
  $.ajax("/mail/all", {
    data: {p: getPassword()},
    error: function (_, errorType, errorMsg) {
      container.contents().show();
      $(".loading").remove();
      $(".error").remove();
      container.prepend($("<div class='error'>" + errorType + ": " + errorMsg + "</div>"));
    },
    success: function (data) {
      container.contents().remove();
      data.content.forEach(function (e) {
        var link = $("<div class='message'></div>");
        link.text(e.date_relative + " - " + e.authors + " - " + e.subject);
        link.attr("data-thread", e.thread);
        link.click(function () {
          $(".message").removeClass("active");
          $(".message-large").remove();
          link.addClass("active");
          var message = $("<div class='message-large'></div>");
          var buttons = $("<div class='message-buttons'></div>");
          var close = $("<button>close</button>");
          close.click(function () {
            message.remove();
            link.removeClass("active");
          });
          var junk = $("<button>junk</button>");
          junk.click(function () {
            message.remove();
            link.removeClass("active");
            $.ajax("/mail/junk/" + e.thread, {
              data: {p: getPassword()},
              success: function (data) {
                $(".message[data-thread=" + e.thread + "]").remove();
              }
            });
          });
          var archive = $("<button>archive</button>");
          archive.click(function () {
            message.remove();
            link.removeClass("active");
            $.ajax("/mail/archive/" + e.thread, {
              data: {p: getPassword()},
              success: function (data) {
                $(".message[data-thread=" + e.thread + "]").remove();
              }
            });
          });
          buttons.append(junk).append(archive).append(close);
          $.ajax("/mail/" + e.thread, {
            data: {p: getPassword()},
            success: function (data) {
              container.prepend(message);
              message.append(buttons);
              renderMessages(data.content[0], message);
            }
          });
        });
        container.append(link);
      });
    }
  });
}

function getPassword() {
  return window.localStorage.p;
}

function setPassword(container) {
  var input = $("<input>");
  var button = $("<button>Save</button>");
  var holder = $("<div>");
  button.click(function () {
    window.localStorage.p = input.val();
    holder.remove();
    loadMail(container);
  });
  holder.append($("<div>Password:</div>")).append(input).append(button);
  container.prepend(holder);
}

$(function () {
  var reload = $("<button class='button'>reload</button>");
  reload.click(function () {
    loadMail(container)
  });

  var set = $("<button class='button'>set pass</button>");
  set.click(function () {
    setPassword(container);
  });

  var container = $("<div class='container'>");
  $("body").append(reload).append(set).append(container);

  if (getPassword()) {
    loadMail(container);
  } else {
    getPassword(container);
  }
});
