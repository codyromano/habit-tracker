(function(exports, React, PubSub, U, ProfileIcon) {
  'use strict';

  exports.HabitHeader = React.createClass({
    getDefaultProps: function() {
      return {
        user: {}
      };
    },

    componentDidMount: function() {
      if (this.refs.addHabitLink) {
        let addHabitLink = this.refs.addHabitLink.getDOMNode();

        addHabitLink.addEventListener('click', function() {
          PubSub.publish('addHabitButtonClicked');
        }, false);
      }
    },

    getAddHabitLink: function() {
      var link = '';
      if (this.props.user.name) {
        link = (<a href="#" ref="addHabitLink" 
        className="main-header-link"><span>Add Habit</span></a>);
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
