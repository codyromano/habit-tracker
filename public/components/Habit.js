(function(exports, React, PubSub, HabitActionMenu, U) {
  'use strict';

  var Habit = exports.Habit = React.createClass({
    getInitialState: function() {
      return {
        /* Setting the initial progress to 1 gives us the cool
        bar-expanding animation without appearing initially demoted
        as it would if we were to use 0 as the starting integer. */
        timeLeftAsPercentage: 1,
        actionMenuHidden: true,
        warned: false,
        demoteWarned: false,
        dueDateDisplay: ''
      };
    },

    onHabitDemoted: function(habit) {
      if (this.state.demoteWarned) { return; }
      this.setState({demoteWarned: true});
    },

    componentWillUnmount: function() {
      this.mounted = false; 
    },

    componentDidMount: function() {
      var id = this.props.habit.habitID,
          habit = this.props.habit,
          _self = this;

      this.mounted = true;

      /* toggledId is the id of the parent habit of the menu that 
      is going to appear */
      PubSub.subscribe('actionMenuWillAppear', function(toggledId) {
        if (toggledId !== id && _self.mounted) {
          _self.setState({actionMenuHidden: true});
        }
      });

      setTimeout(function recursiveTimeCheck() {
        _self.getTimeRemaining();
        if (_self.mounted) {
          setTimeout(recursiveTimeCheck, 1000);
        }
      }, 1000);
    },

    toggleActionMenu: function() {
      var id = this.props.habit.habitID;

      /* Instruct other menus to hide themselves because 
      this menu is going to open */
      PubSub.publish('actionMenuWillAppear', id);

      if (this.mounted) {
        this.setState({actionMenuHidden: !!!this.state.actionMenuHidden});
      }
    },

    getDueDateText: function(habit) {
      var msInOneWeek = 1000 * 60 * 60 * 24 * 7;

      if (habit.taps.length) {
        let lastTap = habit.taps[habit.taps.length - 1];
      } else {
        let lastTap = habit.timeCreated;
      }
      let dueTime = habit.lastTap + habit.freq;
      let dueDate = new Date(dueTime);
      let timeDiff = dueTime - new Date().getTime();

      if (timeDiff < 0) {
        return 'Overdue';
      }

      let dueDateText = 'Due ' + U.getDayName(dueDate.getDay());

      // Only display date if it's more than a week from now
      if (dueTime - new Date().getTime() > msInOneWeek) {
        dueDateText+= ', ' + U.getMonthName(dueDate.getMonth()) + 
          ' ' + dueDate.getDate();

      // Don't display specific time if the due date is >1 week in the future
      } else {
        dueDateText+= ' by ' + U.getFriendlyTime(dueDate);
      }

      return dueDateText;
    },

    getTimeRemaining: function() {
      var now = new Date().getTime();
      var habit = this.props.habit;

      if (this.mounted) {
        this.setState({'dueDateDisplay': this.getDueDateText(habit)});
      }


      var msPassed = now - habit.lastTap,
          msLeft = msPassed / habit.freq;

      var timeLeftAsPercentage = Math.max(0, (100 - 
        ((msPassed / habit.freq) * 100)).toFixed(3));

      if (timeLeftAsPercentage >= 15 && timeLeftAsPercentage <= 30) {
        // TODO: Add warning style to progress bar
      }
      if (timeLeftAsPercentage > 0 && timeLeftAsPercentage < 15) {
        // TODO: Add danger style to progress bar
      }
      if (this.mounted) {
        this.setState({'timeLeftAsPercentage': timeLeftAsPercentage});
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
          <div className="dueDateDisplay">{this.state.dueDateDisplay}</div>
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
})(window, React, PubSub, HabitActionMenu, U); 
