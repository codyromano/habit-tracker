/** @jsx React.DOM */

(function(exports, React, U) {
  'use strict';

  var NewHabitForm = exports.NewHabitForm = React.createClass({
    getInitialState: function() {
      return {
        formHidden: true,
        freq: 2,
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

    componentDidMount: function() {
      var submit = this.refs.submit.getDOMNode();
      submit.addEventListener('click', this.onFormSubmit.bind(this), false);
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

      // Convert the user's frequency preference to milliseconds 
      // Example: "2 days" => 2 * 86400 * 1000
      var freq = (this.state.freq * freqTypes[this.state.freqType]) * 1000;
      var habit = {
        id: U.unique(),
        level: 1,
        title: U.abbrev(this.state.title, 30),
        freq: freq,
        freqType: this.state.freqType,
        lastTap: new Date().getTime(),
        totalTaps: 0
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

      var freqTypes = ['days','hours','minutes'].map(function(type) {
        var checked = (type === _self.state.freqType);
        return <span><input type="radio" ref="freqType" defaultChecked={checked}
        value={type} name="freqType"/>{type}</span>;
      });

      return <div>
        <a className={buttonClasses} onClick={this.expandFormButtonClicked}
        id="expand-habit-form">Develop a Positive Habit</a>

        <div className="form-wrapper">
          <form name="habit" ref="form" 
          onChange={this.onFormUpdated} 
          onSubmit={this.onFormSubmit}
          id="habit-form" className={formClasses}>
            <fieldset>
              <label htmlFor="title">I want to</label>
              <input type="text" ref="title" value={this.state.title} name="title" autoComplete="off" maxLength="30" 
              placeholder="exercise"/>
            </fieldset>
            <fieldset>
              <label htmlFor="freq">every</label>
              <input type="number" ref="freq" name="freq" placeholder="2" className="small"/>
              {freqTypes}
            </fieldset>
            <fieldset>
              <a id="close-form" onClick={this.collapseFormButtonClicked} 
              className="form-btn">Cancel</a>
              <a id="submit-habit-form" ref="submit" className={addHabitBtnClasses}>Add Habit</a>
            </fieldset>
          </form>
        </div>
      </div>;
    }
  });

})(window, React, U); 
