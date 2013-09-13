function renderMessages(data, container) {
  var msgs = data[0];
  var content = msgs[0];
  var section = $("<div class='section'>");
  container.append(section);
  var headers = content.headers;
  var headerDiv = $("<div class='headers'>");
  headerDiv.append("<div>From: " + headers.From + "</div>");
  headerDiv.append("<div>Subject: " + headers.Subject + "</div>");
  headerDiv.append("<div>Date: " + headers.Date + "</div>");
  section.append(headerDiv);
  var bodyContent = content.body[0].content;
  var body;
  if (typeof bodyContent === 'string') {
    body = bodyContent
  } else {
    var tmp = bodyContent.filter(function (o) { return o["content-type"] == "text/plain"});
    if (tmp.length > 0) {
      body = tmp[0].content;
    } else {
      body = "Could not find message body in JSON.";
    }
  }
  var bodyDiv = $("<div class='body'>" + body.replace(/\n/g, "<br />") + "</div>");
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
        link.click(function () {
          $(".message").removeClass("active");
          $(".message-large").remove();
          link.addClass("active");
          var message = $("<div class='message-large'></div>");
          var close = $("<div class='close'>close</div>");
          close.click(function () {
            message.remove();
            link.removeClass("active");
          });
          $.ajax("/mail/" + e.thread, {
            data: {p: getPassword()},
            success: function (data) {
              container.prepend(message);
              message.append(close);
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
  var reload = $("<button class='reload'>reload</button>");
  reload.click(function () {
    loadMail(container)
  });

  var set = $("<button class='set'>set pass</button>");
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
