function Geo( )
{
	var self = this;
	self.client_position;
}

Geo.prototype.get_client_position = function( )
{
    var self = this;
    var client_position;
    if ( self.client_position )
    {
        client_position = [self.client_position.lat( ), self.client_position.lng( )];
    }
    else
    {
        client_position = [0,0]
    }
    return client_position;
}

Geo.prototype.get_user_position = function( options )
{
    var self = this;
    var coords;
    
    if(navigator.geolocation)
    {
		var latitude;
		var longitude;
		navigator.geolocation.getCurrentPosition(function(position)
		{
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            
            coords = new google.maps.LatLng(latitude, longitude);
            
            self.client_position = coords;
            
            if ( options )
            {
                if ( options.add_marker )
                {
                    var user_marker_options = 
                    {
                        user_id: application.user_manager.get_user_id( ),
                        user_position:  coords,
                        draggable: true,
                        client_marker: true
                    }
                    
                    application.workspace.map.place_user_marker( user_marker_options );
                    
                    var move_options = 
                    {
                        map_center: [latitude, longitude],
                        map_zoom: application.workspace.map.get_zoom( )
                    }
                    
                    application.workspace.map.move_to( move_options );
                    
                    var json = application.workspace.map.client_marker.to_JSON( );
                    var json_text = $.toJSON( json );
                    application.conection_manager.send_message('/mensaje', json_text );
                }
            
            }
			
        });
	}
	
	//return self.client_position;
}

Geo.prototype.get_initial_position = function()
{
    var self = this;
    self.get_user_position( );
}

Geo.prototype.getCurrentLocation = function()
{

    /***
    var self = this;
    
    if(navigator.geolocation)
    {
		var latitude;
		var longitude;
		navigator.geolocation.getCurrentPosition(function(position)
		{
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            
            //alert(latitude +'; ' + longitude);
            
            //var blueIcon = new GIcon(G_DEFAULT_ICON);
            //blueIcon.image = 'image/positionDot.png';
            
            //markerOptions = { icon:blueIcon };
            
            var data =
            {
                center:  [latitude,longitude],
                zoom:     workspace.map.getZoom() 
            }
            
           
            
            workspace.map.moveTo(data);
            
            var coords = new google.maps.LatLng(latitude, longitude);
            
            //workspace.map.gmap.addOverlay(new GMarker(coords, markerOptions));
			workspace.map.placeCustomMarker(coords);
			
			 clientManager.clientPosition = coords;
			
			//SEND MESSAGE TO OTHER USERS
			var json = {
			userId: getUserId(),
			roomId: getActiveRoom(),
			type: 'userPosition',
			}
			
			
			
			json['user_position'] = getClientPosition()
			
			var jsonText = $.toJSON(json);
	        clientManager.sendMessage('/mensaje', jsonText);
        });
        
        
	}
	***/
}