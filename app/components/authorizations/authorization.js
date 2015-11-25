/** @jsx React.DOM */
/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 * 
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
var React = require('react');
var request = require('superagent');

module.exports = React.createClass({

	displayName: 'Authorization',
	getInitialState: function(){
		return {
			authorization: { }
		};
	 },
    render: function() {
    	if (this.props.auth.isAuthorized) {
            return (
                <tr><td>{this.props.auth.shimName}</td><td><a href="#" onClick={this.onClick}>Disconnect</a></td></tr>
                );
    				
    	} else {
    		return (
                <tr><td>{this.props.auth.shimName}</td><td><a href={this.props.auth.authorizationUrl} target="_blank">Connect</a></td></tr>
                );
    		
    	}
    },

    onClick: function(e) {
        console.log('deauth call goes here:'+ this.props.auth.shimName);
        //TODO: move this all to a better location in line what what is done with the rest of Blip
        request.get(window.config.MUSSEL_HOST+'/deauthorize/'+this.props.auth.shimKey+'?username='+shimmerUid, function(err, response) {
            if (err) {
                console.log('error'+err);
            } else {
                console.log('deauthorized shim');
            }
        });
    return false;
    }
});
