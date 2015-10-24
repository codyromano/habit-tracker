(function(exports, React, PubSub, U, ProfileIcon) {
  'use strict';

  exports.HabitHeader = React.createClass({
    getDefaultProps: function() {
      return {
        user: {}
      };
    },

    componentDidMount: function() {
      var _self = this,
          addHabitLink = this.refs.addHabitLink.getDOMNode();

      addHabitLink.addEventListener('click', function() {
        PubSub.publish('addHabitButtonClicked');
      }, false);
    },

    render: function() {
      return (<header className="primary-header">
        <div className="main-content">
          <a href="#" ref="addHabitLink" className="main-header-link"><span>Add Habit</span></a>
          <ProfileIcon user={this.props.user}/>
        </div>
      </header>);
    }
  });

})(window, React, PubSub, U, ProfileIcon);
