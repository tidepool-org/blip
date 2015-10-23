var React = require('react');
var request = require('superagent');

module.exports = React.createClass({

	displayName: 'Authorization',
	getInitialState: function(){
		return {
			authorization: { }
		}
	 },
    render: function() {
    	if (this.props.auth.isAuthorized) {
    		//return <tr><td>{this.props.auth.shimName}</td><td><p onClick={this.handleClick}>Connected</p></td></tr>
            return <tr><td>{this.props.auth.shimName}</td><td><a href="#" onClick={this.onClick}>Disconnect</a></td></tr>
    				
    	} else {
    		return <tr><td>{this.props.auth.shimName}</td><td><a href={this.props.auth.authorizationUrl} target="_blank">Connect</a></td></tr>
    		
    	}
    },

    onClick: function(e) {
        console.log('deauth call goes here:'+ this.props.auth.shimName);
        //TODO: move this all to a better location in line what what is done with the rest of Blip
        request.get('http://localhost:5000/deauthorize/'+this.props.auth.shimKey+'?username='+shimmerUid, function(err, response) {
            if (err) {
                console.log('error'+err);
            } else {
                console.log('deauthorized shim');
            }
        });
    return false;
    }
});



//{this.props.auth.deauthURL}