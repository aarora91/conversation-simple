// The Api module is designed to handle all interactions with the server

var Api = (function() {
  var requestPayload;
  var responsePayload;
  var messageEndpoint = '/api/message';

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,
    reply_click: reply_click,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      responsePayload = JSON.parse(newPayloadStr);
    }
  };

  // Send a message request to the server
  function sendRequest(text, context) {
    // Build request payload
    var payloadToWatson = {};
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    if (context) {
      payloadToWatson.context = context;
    }

    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        Api.setResponsePayload(http.responseText);

        // Check if buttons need to be displayed.
        var buttonsToDisplay = displayButtons(JSON.parse(http.responseText));
        if (buttonsToDisplay) {
          makeButtons(buttonsToDisplay);
        }
      }
    };

    var params = JSON.stringify(payloadToWatson);
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
      Api.setRequestPayload(params);
    }

    // Send request
    http.send(params);
  }

  function makeButtons(data) {
    for (var i = 0; i < data.length; i++) {
      var text = data[i];
      var button = document.createElement('button');
      var t = document.createTextNode(text);
      button.appendChild(t);
      button.setAttribute('text', text);
      button.setAttribute(
        'onClick',
        'Api.reply_click(this.getAttribute("text"))'
      );
      button.setAttribute(
        'style',
        'display:block; margin: 0 auto; margin-top: 8px; margin-bottom: 8px; padding:4px; background:#9855D4; color:#ffffff; border: none; border-radius: 5px; height: 40px; width: 240px; font-size: 14px;'
      );
      document.getElementById('scrollingChat').appendChild(button);
    }
  }

  function displayButtons(response) {
    return response.output.attachments &&
      response.output.attachments.property &&
      response.output.attachments.property.buttons;
  }

  function reply_click(text) {
    sendRequest(text, Api.getResponsePayload().context); // Call Conversation again!!
  }
})();
