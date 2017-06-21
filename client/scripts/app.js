// YOUR CODE HERE:
var app = {

  'init': function() {
    $(document).ready()

    return true;
  },

  'send': function(message) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
      type: 'POST',
      data: JSON.stringify(message),
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

  'fetch': function() {
    $.get(undefined);
  },

  'clearMessages': function() {
    $('#chats').empty();
  },

  'renderMessage': function(message) {
    $('#chats').append('<p>' + message.text + '</p>');
  },

  'renderRoom': function(roomName) {
    $('#roomSelect').append('<p>' + roomName + '</p>'); //add room name
  }


};
