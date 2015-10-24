(function(exports, React, U) {
  'use strict';

  var NewHabitForm = exports.NewHabitForm = React.createClass({
    getInitialState: function() {
      return {
        formHidden: true,
        freqType: 'days'
      };
    },

    toggleFormVisibility: function() {
      this.setState({'formHidden': !!!this.state.formHidden});
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

    onFormSubmit: function() {
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

      // TODO: Smarter way of delaying focus; this is
      // a potential race condition
      setTimeout(function() {
        this.refs.title.getDOMNode().focus();
      }.bind(this), 50);
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
        return <span key={type}><input type="radio" ref="freqType" defaultChecked={checked}
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

})(window, React, U); 
