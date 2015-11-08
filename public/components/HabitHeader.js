(function(exports, React, PubSub, U, ProfileIcon) {
  'use strict';

  exports.HabitHeader = React.createClass({
    getDefaultProps: function() {
      return {
        user: {}
      };
    },

    habitButtonClicked: function() {
      PubSub.publish('addHabitButtonClicked');
    },

    getAddHabitLink: function() {
      var link = '';
      if (this.props.user.name) {
        link = (<a href="#" ref="addHabitLink" 
        className="main-header-link" onClick={this.habitButtonClicked}><span>Add Habit Timer</span></a>);
      }
      return link;
    },

    render: function() {
      var addHabitLink = this.getAddHabitLink();

      return (<header className="primary-header">
        <div className="main-content">
          {addHabitLink}
          <ProfileIcon user={this.props.user}/>
        </div>
      </header>);
    }
  });

})(window, React, PubSub, U, ProfileIcon);
