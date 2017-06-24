// YOUR CODE HERE:
/*eslint-disable quotes*/
/*eslint-disable semi*/
var app = {

  _messages: [],

  _lastMessage: '',

  _rooms: {'allRooms': 1},

  _roomCount: 0,

  _currentRoom: '',

  _friends: {},

  init: function() {
    $(document).ready(function() {
      // app.fetch();
      window.setInterval(function() { app.fetch() }, 1000);
    });

  },


  fetch: function() {
    var settings = {
      url: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
      type: 'GET',
      dataType: 'json',
      data: encodeURI('order=-createdAt'),
      complete: function(data) {
        var messagesArr = data.responseJSON.results;
        app.scrub(messagesArr);
      },
    };

    $.ajax(settings);
  },

  scrub: function(data) {
    if (Object.prototype.toString.call(data) === '[object Array]') {

      var optionalMessageKeys = ['username', 'roomname', 'text'];

      data.forEach(function(el) {
        for (var key in el) {
          if (el[key] !== undefined && el[key] !== null) {
            el[key] = el[key].replace('&', '&amp').replace('<', '&lt').replace('>', '&gt').replace('"', '&quot').replace("'", '&#x27').replace('/', '&#x2F');
          } else {
            el[key] = el[key];
          }
        }

        for (var i = 0; i < optionalMessageKeys.length; i ++) {
          if (!el[optionalMessageKeys[i]]) {
            el[optionalMessageKeys[i]] = '';
          }
        }

      });

      app.addNewMessages(data);
      app.addNewRooms(data);
      return;
    }
    //Formats dates to Date.parse('01/01/2011 5:10:10')
    if (Object.prototype.toString.call(data) === '[object String]') {
      var dateStr = data.split('');
      return dateStr.slice(5, 7).join('') + '/' + dateStr.slice(8, 10).join('') + '/' + dateStr.slice(0, 4).join('') + ' ' + dateStr.slice(11, 19).join('');
    }

    return;
  }, //end of scrub

  addNewRooms: function(messagesArr) {
    for (var i = 0; i < messagesArr.length; i++) {
      if (!app._rooms[messagesArr[i]['roomname']]) {
        app._rooms[messagesArr[i]['roomname']] = 1;
      }
    }
    app.renderRooms();
  },

  addOneRoom: function() {
    var text = document.getElementById('newRoom').value;
    console.log(text);
    document.getElementById('newRoom').value = '';

    app._rooms[text] = 1;
  },

  addNewMessages: function(messageArr) {
    if (app._messages.length === 0) {
      app._currentRoom = 'allRooms';
      app._messages = messageArr.slice(0);
      app._lastMessage = app.scrub(app._messages[app._messages.length - 1]['createdAt']);
      //add filter here for rooms
      app.renderMessage(app._messages);
    } else {

      var roomMessages = messageArr.filter(function(el) {
        if (app._currentRoom === 'allRooms') {
          return el;
        }

        if (el['roomname'] === app._currentRoom) {
          return el;
        }
      });

      roomMessages.forEach(function(el) {
        var msgDate = app.scrub(el['createdAt']);
        if (Date.parse(msgDate) > Date.parse(app._lastMessage) ) {
          app._messages.push(el);
          app._messages.slice(1, 0);
          app._lastMessage = app.scrub(app._messages[app._messages.length - 1]['createdAt']);
          app.renderMessage(app._messages[app._messages.length - 1]);
        }
      });
    }

  }, //end of addNewMessages
/* <a href=""></a> */

  renderMessage: function(data) {

    if (Object.prototype.toString.call(data) === '[object Object]') {
      var objDate = app.scrub(data['createdAt']);
      if (!app._friends[data.username]) {

        $('#chats').prepend('<div class="messageBox"><p><span class="username">' + data.username + '</span> @ ' + app.scrub(data.createdAt) + ':</p>' + '<p>' + data.text + '</p></div>');
      } else {
        $('#chats').prepend('<div class="messageBox friend"><p><span class="username">' + data.username + '</span> @ ' + app.scrub(data.createdAt) + ':</p>' + '<p>' + data.text + '</p></div>');
      }

      if ( document.body.getElementsByClassName('messageBox').length > 250) {
        var chatLength = document.body.getElementsByClassName('messageBox').length;
        for ( var i = 0; i < chatLength - 250; i++) {
          $('#chats:last-child', this).remove();
        }
      }
    }
    if (Object.prototype.toString.call(data) === '[object Array]') {
      data.forEach(function(el) {

        if (!app._friends[el.username]) {
          $('#chats').append('<div class="messageBox"><p><span class="username">' + el.username + '</span> @ ' + app.scrub(el.createdAt) + 'from room:' + el.roomname + ':</p>' + '<p>' + el.text + '</p></div>');
        } else {
          $('#chats').append('<div class="messageBox friend"><p><span class="username">' + el.username + '</span> @ ' + app.scrub(el.createdAt) + 'from room:' + el.roomname + ':</p>' + '<p>' + el.text + '</p></div>');
        }
      });
    }
    return;
  },

  //1.add friend to global friend array
  //render friend list
  //3. make friends bold
  addFriend: function(friendName) {
    app._friends[friendName] = true;
    console.log(app._friends[friendName]);

  },

  renderRooms: function() {
    var newRoomCount = Object.keys(app._rooms).length;
    if ( newRoomCount > app._roomCount) {
      $('#roomSelect').text('');
      for (var roomName in app._rooms) {
        $('#roomSelect').append('<option value=' + roomName + '>' + roomName + '</option>'); //add room name
      }
      app._roomCount = document.body.getElementsByTagName('option').length;
    }
  },

  createMessage: function() {
    var link = window.location.href;
    var username = link.slice(link.indexOf('username=') + 9);
    var text = document.getElementById('message').value;
    document.getElementById('message').value = '';
    var roomname = app._currentRoom;
    var message = {
      username: username,
      text: text,
      roomname: roomname
    };
    app.send(message);
  },

  send: function(messageObj) {
    $.ajax({
      url: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
      type: 'POST',
      data: JSON.stringify(messageObj),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function(data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
    return true;
  },


  clearMessages: function() {
    $('#chats').empty();
  },

  filterRooms: function(roomName) {
    var filteredRooms = app._messages.filter(function(el) {
      if (app._currentRoom === 'allRooms') {
        return el;
      }

      if (el['roomname'] === roomName) {
        return el;
      }

    });
    app.clearMessages();
    app.renderMessage(filteredRooms);
  }







};
