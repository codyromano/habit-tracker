/** @jsx React.DOM */

(function(exports, PubSub, Habit, Messages, U) {
  'use strict';

  var sortHabits = function(a, b) {
     var now = new Date().getTime(),
     ageA = (now - a.lastTap) / a.freq,
     ageB = (now - b.lastTap) / b.freq;

     if (ageA === ageB) {
         return 0; 
     }
     return (ageA > ageB) ? -1 : 1;
  };

  var HabitApp = exports.HabitApp = React.createClass({
    getInitialState: function() {
      return {
        habits: HabitStore.getHabits(),
        queue: MessageStore.getMessages()
      };
    },
    componentDidMount: function() {
      var _self = this; 
      PubSub.subscribe('habitListChanged', function(habits) {
        _self.setState({habits: habits});
      });
      PubSub.subscribe('messageListChanged', function(messages) {
        _self.setState({queue: messages}); 
      });
    },
    render: function() {
      var habits = this.state.habits.sort(sortHabits).map(function(h) {
        return <Habit title={h.title} freq={h.freq} level={h.level} 
          totalTaps={h.totalTaps} lastTap={h.lastTap}/>;
      });

      return <div>
        <div>{habits}</div>
        <Messages queue={this.state.queue}/>
      </div>;
    }
  });

  React.render(<HabitApp/>, document.getElementById('reactRoot')); 

})(window, PubSub, Habit, Messages, U);
