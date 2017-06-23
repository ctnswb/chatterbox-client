// YOUR CODE HERE:
var app = {

  init: function() {
    $(document).ready(function() {
      //app.fetch();
      app.lastMessageTime;
      window.setInterval(function(){ app.fetch() }, 1000);
    });

  },

  send: function(messageObj) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
      type: 'POST',
      data: JSON.stringify(messageObj),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function(data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
    return true;
  },

  fetch: function() {
    //app.clearMessages();
    var settings = {
      url: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
      type: 'GET',
      dataType: 'json',
      data: encodeURI('limit=10000'),
      data: encodeURI('order=-createdAt'),
      complete: function(data) {
        var messagesArr = data.responseJSON.results;
        app.dataHandlingFunction(messagesArr);
      },
    };

    $.ajax(settings);
  },

  createMessage: function() {
    var link = window.location.href;
    var username = link.slice(link.indexOf('username=') + 9);
    var text = document.getElementById('message').value;
    document.getElementById('message').value = '';
    var roomname = 'Roomy'; //set default room, need to come back and fix
    var message = {
      username: username,
      text: text,
      roomname: roomname
    };
    app.send(message);
    console.log(text);
  },

  dataHandlingFunction: function(messagesArr) {
    var roomNames = {};
    // console.log(messagesArr)
    for (var i = 0; i < messagesArr.length; i++) {
      var messageObj = messagesArr[i];
      roomNames[messageObj.roomname] = messageObj.roomname;
      app.renderMessage(messageObj);
    }
    app.lastMessageTime = messagesArr[messagesArr.length - 1].createdAt;
    console.log(app.lastMessageTime); //last left off looking at query for returning new messages based on time
    for (var key in roomNames) {
      app.renderRoom(key);
    }

  },

  clearMessages: function() {
    $('#chats').empty();
  },

  dateFormatter: function(date) {
    var newDate = date.split('').slice(5, 10).join('') + ' ' + date.split('').slice(11, 19).join('');
    return newDate;
  },

  stringScrubber: function(dirtyString) {
    if (dirtyString) {
      var cleanString = dirtyString.replace('&', '&amp').replace('<', '&lt').replace('>', '&gt').replace('"', '&quot').replace("'", '&#x27').replace('/', '&#x2F');
      return cleanString;
    }
  },


  renderMessage: function(messageObj) {
    $('#chats').append('<div class="messageBox"><p>'+ app.stringScrubber(messageObj.username) + ' @ ' + app.dateFormatter( messageObj.createdAt ) + ':</p>' + '<p>' + app.stringScrubber(messageObj.text) +'</p></div>');

  },

  renderRoom: function(roomName) {
    $('#roomSelect').append('<option value=' + app.stringScrubber(roomName) + '>' + app.stringScrubber(roomName) + '</option>'); //add room name
  }


};
