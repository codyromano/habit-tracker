(function(exports) {
  let LandingPage = exports.LandingPage = React.createClass({
    render: function() {
      return (
        <section className="landing-hero">
          <div className="valign-wrapper">
            <div className="valign-inner">
              <h1 className="landing-tagline">
                Stick to positive habits
                <a href="/auth/facebook/" className="fb-signup"></a>
              </h1>
            </div>
          </div>
              
            {/*<div className="down-arrow"></div>*/}
        </section>);
    }
  });
})(window);
