/** @jsx React.DOM */

(function(exports, React) {
  'use strict';

  var Messages = exports.Messages = React.createClass({
    render: function() {
      var _self = this;
      var listItems = this.props.queue.map(function(el) {
        return <li>{el.content}</li>;
      });
      var classes = U.getClassStr({
        'messages-wrapper' : true, 
        'messages-show' : _self.props.queue[0] !== undefined
      }); 
      return <ul className={classes}>{listItems}</ul>;
    }
  });

})(window, React); 
