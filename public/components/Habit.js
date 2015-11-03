(function(exports, React, PubSub, HabitActionMenu) {
  'use strict';

  //test

  var Habit = exports.Habit = React.createClass({
    getInitialState: function() {
      return {
        /* Setting the initial progress to 1 gives us the cool
        bar-expanding animation without appearing initially demoted
        as it would if we were to use 0 as the starting integer. */
        timeLeftAsPercentage: 1,
        actionMenuHidden: true,
        warned: false,
        demoteWarned: false
      };
    },

    onHabitDemoted: function(habit) {
      if (this.state.demoteWarned) { return; }
      this.setState({demoteWarned: true});
    },

    componentDidMount: function() {
      var id = this.props.habit.habitID,
          habit = this.props.habit,
          _self = this;

      /* toggledId is the id of the parent habit of the menu that 
      is going to appear */
      PubSub.subscribe('actionMenuWillAppear', function(toggledId) {
        if (toggledId !== id) {
          _self.setState({actionMenuHidden: true});
        }
      });

      /*
      PubSub.subscribe('habitCompleted', function(uniqueProperty, uniqueValue) {
        if (habit[uniqueProperty] === uniqueValue) {
          habit.lastTap = new Date().getTime();
        }
      });
      */

      setInterval(this.getTimeRemaining, 1000);
    },

    toggleActionMenu: function() {
      var id = this.props.habit.habitID;

      /* Instruct other menus to hide themselves because 
      this menu is going to open */
      PubSub.publish('actionMenuWillAppear', id);
      this.setState({actionMenuHidden: !!!this.state.actionMenuHidden});
    },

    getTimeRemaining: function() {
      var now = new Date().getTime();
      var habit = this.props.habit;

      var msPassed = now - habit.lastTap,
      msLeft = msPassed / habit.freq;

      var timeLeftAsPercentage = (100 - ((msPassed / habit.freq) * 100)).toFixed(3);

      if (timeLeftAsPercentage < 0) {
        // Demote the user by a level for each cycle that has passed. 
        PubSub.publish('habitPastDue', habit.habitID, Math.floor(msPassed / habit.freq));
        timeLeftAsPercentage = 0;
      }

      this.setState({'timeLeftAsPercentage': timeLeftAsPercentage});

      if (timeLeftAsPercentage > 0 && timeLeftAsPercentage < 25 && !this.state.warned) {
        this.setState({warned: true}); 
      }
    },

    render: function() {
      var _self = this;
      var progressStyle = {width: _self.state.timeLeftAsPercentage + '%'};
      var habit = this.props.habit; 

      var wrapperClasses = U.getClassStr({
        'habit' : true,
        'grid' : true,
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
        'habit-action-icon-expanded' : !!!_self.state.actionMenuHidden,
        'col-1' : true,
        'col-last' : true,
        'valign-wrapper' : true
      });

      var titleClasses = U.getClassStr({
        'habit-title' : true,
        'col-8' : true,
        'valign-wrapper' : true
      });

      return <div className={wrapperClasses} onClick={this.toggleActionMenu}>

        <div className="habit-bar-container">
          <div className={progressClasses} style={progressStyle}></div>

          <div className="valign-wrapper habit-level col-3">
            <div className="valign-inner"><span className="lvl-text">Lvl</span> {habit.level}</div>
          </div>

          <div className={titleClasses}>
            <div className="valign-inner">{habit.content}</div>
          </div>

          <div className={habitIconClasses}>
            <div className="valign-inner">
              <div className="habit-icon-inner"></div>
            </div>
          </div>
        </div>

        <HabitActionMenu habitID={habit.habitID} habitTitle={habit.title} 
        hidden={_self.state.actionMenuHidden}/>
      </div>;
    }
  });
})(window, React, PubSub, HabitActionMenu); 
