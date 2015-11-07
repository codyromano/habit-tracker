(function(exports, PubSub, Habit, NewHabitForm, Messages, U) {
  'use strict';

  console.log('%cThanks for using Habit Tracker (working title).', 'font-size:18px;color:green;');
  console.log('%cView source and contribute at %s', 'font-size: 15px;color:blue;', 'https://github.com/codyromano/habit-tracker');

  function sortHabits(a, b) {
     var now = new Date().getTime(),
     ageA = (now - a.lastTap) / a.freq,
     ageB = (now - b.lastTap) / b.freq;

     if (ageA === ageB) {
         return 0; 
     }
     return (ageA > ageB) ? -1 : 1;
  }

  function isNotDeleted(habit) {
    return habit.deleted !== true; 
  }

  var HabitApp = exports.HabitApp = React.createClass({
    getInitialProps: function() {
      return {
        user: {}
      };
    },

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
      PubSub.subscribe('userProfileChanged', function(profile) {
        _self.setProps({user: profile});
      });
    },
    render: function() {
      var habits = this.state.habits.sort(sortHabits).map(function(h, i) {
        return <Habit habit={h} key={i}/>;
      });

      // Show the welcome landing page unless the user is logged in
      var mainContent = (<LandingPage/>);

      /* TODO: Must add React Router for organization
      this won't be sustainable as more pages are added */
      if (this.props.user) {
        mainContent = (
          <div>
          <NewHabitForm/>
            <div className="main-content">
              <div>{habits}</div>
            </div>
            <Messages queue={this.state.queue}/>
          </div>
        );
      }

      return <div>
        <HabitHeader user={this.props.user}/>
        {mainContent}
      </div>;
    }
  });

  React.render(<HabitApp/>, document.getElementById('reactRoot')); 

})(window, PubSub, Habit, NewHabitForm, Messages, U);
