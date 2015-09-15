/** @jsx React.DOM */

(function(exports, React, PubSub, HabitActionMenu) {
  'use strict';

  var Habit = exports.Habit = React.createClass({
    getInitialState: function() {
      return {
        timeLeftAsPercentage: 0,
        actionMenuHidden: true,
        warned: false
      };
    },

    componentDidMount: function() {
      setInterval(this.getTimeRemaining, 1000);
    },

    toggleActionMenu: function() {
      this.setState({actionMenuHidden: !!!this.state.actionMenuHidden});
    },

    getTimeRemaining: function() {
      var now = new Date().getTime();
      var msPassed = now - this.props.lastTap,
      msLeft = msPassed / this.props.freq;

      var timeLeftAsPercentage = (100 - ((msPassed / this.props.freq) * 100)).toFixed(3);
      if (timeLeftAsPercentage < 0) {
        timeLeftAsPercentage = 0;
      }

      this.setState({'timeLeftAsPercentage': timeLeftAsPercentage});

      if (timeLeftAsPercentage > 25 && timeLeftAsPercentage < 50 && !this.state.warned) {
        this.setState({warned: true}); 
        PubSub.publish('messageAdded', "Warning: You need to" + this.props.title + 
          " ASAP or you'll be demoted to a lower level.", 4000); 
      }
    },

    render: function() {
      var _self = this;
      var progressStyle = {width: _self.state.timeLeftAsPercentage + '%'};

      var progressClasses = U.getClassStr({
        'progress': true, 
        'progress-warn' : _self.state.timeLeftAsPercentage < 50, 
        'progress-danger' : _self.state.timeLeftAsPercentage < 33
      });

      var habitIconClasses = U.getClassStr({
        'habit-action-icon' : true,
        'habit-action-icon-expanded' : !_self.state.actionMenuHidden
      });

      return <div className="habit noselect" onClick={this.toggleActionMenu}>
        <div className={progressClasses} style={progressStyle}></div>

        <div className="habit-level">Lvl {this.props.level}</div>

        <div className="habit-title">
          {this.props.title}
        </div>
        <div className={habitIconClasses}>
          <div className="habit-icon-inner"></div>
        </div>
        <HabitActionMenu habitTitle={this.props.title} hidden={_self.state.actionMenuHidden}/>
      </div>;
    }
  });
})(window, React, PubSub, HabitActionMenu); 
