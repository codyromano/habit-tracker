/** @jsx React.DOM */

(function(exports, React, PubSub, HabitActionMenu) {
  'use strict';

  var Habit = exports.Habit = React.createClass({
    getInitialState: function() {
      return {
        timeLeftAsPercentage: 0,
        actionMenuHidden: true,
        warned: false,
        demoteWarned: false
      };
    },

    onHabitDemoted: function(habit) {
      if (this.state.demoteWarned) { return; }
      PubSub.publish("messageAdded", "WARNING: You're losing progress in " + habit.attr('title') + "!", 5000); 
      this.setState({demoteWarned: true});
    },

    componentDidMount: function() {
      var id = this.props.habit.attr('id'); 

      setInterval(this.getTimeRemaining, 1000);
      PubSub.subscribe('habitHasPendingDemotion:' + id, this.onHabitDemoted);
    },

    toggleActionMenu: function() {
      this.setState({actionMenuHidden: !!!this.state.actionMenuHidden});
    },

    getTimeRemaining: function() {
      var now = new Date().getTime();
      var habit = this.props.habit;

      var msPassed = now - habit.attr('lastTap'),
      msLeft = msPassed / habit.attr('freq');

      var timeLeftAsPercentage = (100 - ((msPassed / habit.attr('freq')) * 100)).toFixed(3);

      if (timeLeftAsPercentage < 0) {
        // Demote the user by a level for each cycle that has passed. 
        PubSub.publish('habitPastDue', habit.attr('id'), Math.floor(msPassed / habit.attr('freq')));
        timeLeftAsPercentage = 0;
      }

      this.setState({'timeLeftAsPercentage': timeLeftAsPercentage});

      if (timeLeftAsPercentage > 25 && timeLeftAsPercentage < 50 && !this.state.warned) {
        this.setState({warned: true}); 
        PubSub.publish('messageAdded', "Warning: You need to " + habit.attr('title') + 
          " ASAP or you'll be demoted to a lower level.", 4000); 
      }
    },

    render: function() {
      var _self = this;
      var progressStyle = {width: _self.state.timeLeftAsPercentage + '%'};
      var habit = this.props.habit; 

      var wrapperClasses = U.getClassStr({
        'habit' : true,
        'noselect' : true,
        'demote' : (_self.state.timeLeftAsPercentage == 0)
      });

      var progressClasses = U.getClassStr({
        'progress': true, 
        'progress-warn' : _self.state.timeLeftAsPercentage < 50, 
        'progress-danger' : _self.state.timeLeftAsPercentage < 33
      });

      var habitIconClasses = U.getClassStr({
        'habit-action-icon' : true,
        'habit-action-icon-expanded' : !!!_self.state.actionMenuHidden
      });

      var titleClasses = U.getClassStr({
        'habit-title' : true
      });

      return <div className={wrapperClasses} onClick={this.toggleActionMenu}>
        <div className={progressClasses} style={progressStyle}></div>

        <div className="habit-level">Lvl {habit.attr('level')}</div>

        <div className={titleClasses}>
          {habit.title}
        </div>
        <div className={habitIconClasses}>
          <div className="habit-icon-inner"></div>
        </div>
        <HabitActionMenu id={habit.id} habitTitle={habit.title} hidden={_self.state.actionMenuHidden}/>
      </div>;
    }
  });
})(window, React, PubSub, HabitActionMenu); 
