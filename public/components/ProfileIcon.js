(function(exports, React, PubSub, U) {
  'use strict';

  exports.ProfileIcon = React.createClass({
    getDefaultProps: function() {
      return {
        user: {}
      };
    },

    render: function() {
      var user = this.props.user,
          profileContents;

      if (user.name && user.profilePicture) {
        profileContents = (<div className="main-header-link main-header-link-right profile-wrapper">
          <div className="main-header-link life-score-wrapper" id="ls-wrapper">
            <strong className="user-name">{user.firstName}</strong>
          </div>
          <div className="profile-pic-wrapper">
            <img src={user.profilePicture} className="profile-picture"/>
            <img src="http://findicons.com/files/icons/2799/flat_icons/256/ribbon.png" className="ribbon"/>
            <span className="ls-text">{user.lifeScore}</span>
          </div>
        </div>);

      } else {
        profileContents = (<div>
          <a href="/auth/facebook/" className="main-header-link main-header-link-right">
          <span>Sign In</span></a>
        </div>);
      }

      return profileContents;
    }
  });

})(window, React, PubSub, U);
