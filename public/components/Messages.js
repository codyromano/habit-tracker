(function(exports, React) {
  'use strict';

  var Messages = exports.Messages = React.createClass({
    render: function() {

      let listItems = this.props.queue.map((el,i) => <li key={i}>{el.content}</li>);
      let showMessages = this.props.queue[0] !== undefined;

      let classes = U.getClassStr({
        'messages-wrapper' : true, 
        'messages-show' : showMessages
      }); 

      let containerClasses = U.getClassStr({
        'messages-container' : true,
        'message-container-show' : showMessages
      });

      return (<div className={containerClasses}>
        <div className="main-content grid">
          <div className="col-2 message-icon-wrapper">
            <div className="valign-wrapper">
              <div className="valign-inner">
                <img src="https://cdn2.iconfinder.com/data/icons/life-moments/566/fireworks-512.png" className="icon"/>
              </div>
            </div>
          </div>

          <div className="col-10 col-last">
            <ul className={classes}>{listItems}</ul>
          </div>
          <div className="clearfix"></div>
        </div>
      </div>);
    }
  });

})(window, React); 
