(function(exports, React, UserStore, HabitStore, U) {
  'use strict';

  var NewHabitForm = exports.NewHabitForm = React.createClass({
    getInitialState: function() {
      return {
        formHidden: true,
        freqType: 'days'
      };
    },

    toggleFormVisibility: function() {
      var _self = this; 

      /* Don't expand the new habit button if the user hasn't 
      met the Life Score requirement for adding a new habit */
      if (this.state.formHidden && !this.checkLifeScoreReq()) {
        return;
      }

      let titleNode = this.refs.title.getDOMNode();
      this.setState({'formHidden': !!!this.state.formHidden});

      /* TODO: Replace this arbitrary timeout with logic to focus the 
      title input only after the initial render of the form has completed.
      Calling it here without a timeout doesn't work because the focus/blur
      call is made before the element is completely rendered. */
      setTimeout(function() {
        (_self.state.formHidden) ? titleNode.blur() : titleNode.focus();
      }, 500);
    },

    formIsValid: function() {
      var title = this.state.title || '',
          freq = this.state.freq || 0;
      return title[0] && !isNaN(freq) && freq > 0;
    },

    submitOnEnter: function(ev) {
      var ENTER = 13, 
          keyCode = ev.keyCode || e.which;

      if (this.formIsValid && keyCode === ENTER) {
        this.onFormSubmit();
      }
    },

    componentDidMount: function() {
      var _self = this,
          submit = this.refs.submit.getDOMNode(),
          title = this.refs.title.getDOMNode(),
          freq = this.refs.freq.getDOMNode();

      submit.addEventListener('click', this.onFormSubmit, false);
      title.addEventListener('keydown', this.submitOnEnter, false);
      freq.addEventListener('keydown', this.submitOnEnter, false);

      PubSub.subscribe('addHabitButtonClicked', function() {
        _self.expandFormButtonClicked();
      });
    },

    onFormUpdated: function(ev) {
      var target = ev.target,
      newState = {};

      newState[target.name] = target.value; 
      this.setState(newState);
    },

    resetForm: function() {
      this.setState({
        title: ''
      });
    },

    checkLifeScoreReq: function() {
      var allHabits = HabitStore.getShowableHabits(),
          lifeScore = UserStore.getProfile().lifeScore,
          newHabitNumber = allHabits.length + 1;

      var notLoggedIn = (isNaN(parseInt(lifeScore)) || lifeScore < 1); 

      if (notLoggedIn) {
        return true;
      }

      let scoreRequired = UserStore.getLifeScoreRequiredForNewHabit(newHabitNumber);

      if (scoreRequired > lifeScore) {
        let extraRequired = scoreRequired - lifeScore;

        // TODO: Function for pluralizing nouns
        let extraNotice = extraRequired + ' more ' + 
          ((extraRequired > 1) ? 'points' : 'point');

        PubSub.publish('messageAdded', 'You need a Life Score of ' + scoreRequired +
         ' (' + extraNotice + ') to add another habit. Mark habits as done to boost' +
         ' your Life Score.', 8000);
        return false;
      }
      return true; 
    },

    onFormSubmit: function() {
      if (!this.checkLifeScoreReq()) {
        return;
      }
      if (!this.formIsValid()) {
        return PubSub.publish('messageAdded', 'Please fill out everything.', 2000);
      }
      var freqTypes = {
        'days' : 86400, // seconds in a day
        'hours' : 3600,
        'minutes': 60
      };

      var now = new Date().getTime();

      // Convert the user's frequency preference to milliseconds 
      // Example: "2 days" => 2 * 86400 * 1000
      var freq = (this.state.freq * freqTypes[this.state.freqType]) * 1000;
      var habit = {
        id: U.unique(),
        level: 1,
        pendingDemotions: 0, 
        title: U.abbrev(this.state.title, 30),
        freq: freq,
        freqType: this.state.freqType,
        lastTap: now,
        totalTaps: 0,
        taps: [now]
      };

      // Tell the habit store a new habit should be created
      PubSub.publish('habitAdded', habit); 
      this.resetForm();
    },

    expandFormButtonClicked: function() {
      // Show the form and focus on the title field
      this.toggleFormVisibility();
    },

    collapseFormButtonClicked: function() {
      this.toggleFormVisibility();
      this.resetForm();
    },

    render: function() {
      var _self = this;

      var formClasses = U.getClassStr({
        'hidden' : _self.state.formHidden
      }); 
      var buttonClasses = U.getClassStr({
        'form-btn' : true,
        'hidden' : !_self.state.formHidden
      });
      var addHabitBtnClasses = U.getClassStr({
        'form-btn' : true, 
        'disabled' : !this.formIsValid()
      });

	    var showFreqTypes = {days: 'days', hours: 'hrs', minutes: 'mins'};
      var freqTypes = ['days','hours','minutes'].map(function(type) {
        var checked = (type === _self.state.freqType);
        return <span key={type} className="freq-type"><input type="radio" ref="freqType" defaultChecked={checked}
        value={type} name="freqType"/>{showFreqTypes[type]}</span>;
      });

      // TODO: Create a separate component for the inner content of the form
      return <div>

        <div className="form-wrapper">
          <form name="habit" ref="form" 
          onChange={this.onFormUpdated} 
          onSubmit={this.onFormSubmit}
          id="habit-form" className={formClasses}>
            <div className="main-content">
            <fieldset>
              <label htmlFor="title">I want to</label>
              <input type="text" ref="title" value={this.state.title} name="title" autoComplete="off" maxLength="30" 
              placeholder="exercise"/>
            </fieldset>
            <fieldset>
              <label htmlFor="freq">every</label>
              <input type="number" ref="freq" name="freq" defaultValue={this.state.freq} placeholder="2" className="small"/>
              {freqTypes}
            </fieldset>
            <fieldset>
              <a id="close-form" onClick={this.collapseFormButtonClicked} 
              className="form-btn">Cancel</a>
              <a id="submit-habit-form" ref="submit" className={addHabitBtnClasses}>Create</a>
            </fieldset>
            </div>
          </form>
        </div>
      </div>;
    }
  });

})(window, React, UserStore, HabitStore, U); 
