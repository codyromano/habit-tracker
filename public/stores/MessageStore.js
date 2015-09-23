(function (exports, PubSub) {
  'use strict';

  var MessageStore = exports.MessageStore = {};
  var messages = []; 

  // A waiting list for the messages array
  var addMessageQueue = []; 

  function addMessage(content, expires) {
    addMessageQueue.push({content: content, expires: expires}); 
    tick();
  }

  function tick() {
    // If nothing is on display and the add message queue is empty
    if (!messages[0] && !addMessageQueue[0]) {
      return false; 
    }
    if (!messages[0]) {
      messages = [addMessageQueue.shift()];
      PubSub.publish('messageListChanged', messages);

      setTimeout(function() {
        messages = []; 
        PubSub.publish('messageListChanged', messages);
      }, messages[0].expires); 
    }

    setTimeout(tick, 10); 
  }

  function showNextMessage() {
    var message = addMessageQueue.shift();
    messages = [message]; 
    PubSub.publish('messageListChanged', messages);
  }

  function removeMessage() {
    var removed; 
    if (messages.length) {
      removed = messages.shift();
      PubSub.publish('messageListChanged', messages); 
    }
    return removed;
  }

  PubSub.subscribe('messageAdded', addMessage);

  MessageStore.getMessages = function() {
    return messages; 
  };

})(window, PubSub); 
