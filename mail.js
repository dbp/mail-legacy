function loadMail(container) {
  container.contents().hide();
  container.append($("<div class='loading'>Loading...</div>"));
  $.ajax("/mail/all", {
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
            success: function (data) {
              container.prepend(message);
              message.append(close);
              window.data = data.content;
              data.content[0].forEach(function (mcontent) {
                content = mcontent[0];
                var section = $("<div class='section'>");
                message.append(section);
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
              });
            }
          });
        });
        container.append(link);
      });
    }
  });
}

$(function () {
  var reload = $("<div class='reload'>reload</div>");
  reload.click(function () {
    loadMail(container)
  });

  var container = $("<div class='container'>");
  $("body").append(reload).append(container);

  loadMail(container);
});
