function Canvas_Marker( data )
{
	var self = this;
	var marker_options = {}
	
	self.primer_mensaje = true;
	self._type = 'marker';
	
	if ( data )
	{
	    if ( data.position )
	    {
            self.position = data.position;
            marker_options['position'] = data.position;
	    }
	    
	    if ( data.map )
	    {
	        self.map = data.map;
	        marker_options['map'] = data.map;
	    }
	    
	    if ( data.id )
	    {
	        self.id = data.id;
	    }
	    else
	    {
	        self.id = Utils.guid( );
	    }
	    
	    if (data.draggable )
	    {
	        marker_options['draggable'] = true;
	    }
	    else
	    {
	        marker_options['draggable'] = false;
	    }
	    
	    if ( data.user_id )
	    {
	        marker_options['title'] = data.user_id;
	        self.user_id = data.user_id;
	    }
	    
	    if ( data.icon )
	    {
	        marker_options['icon'] = data.icon;
	    }
	    
	}
	
	
	self.gmarker = new google.maps.Marker( marker_options );
    self.gmarker.id = self.id;
    
}

Canvas_Marker.prototype.add_listener = function( )
{
    var marcador = this;
	
	var listener = google.maps.event.addListener(marcador.gmarker, 'click', function(event)
	{
	   marcador.add_chat_infowindow();
	   marcador.primer_mensaje = false;       
  	});
  	
  	var listener2 = google.maps.event.addListener(marcador.gmarker, 'dragend', function(event)
	{
	   id = this.id;
	   
	   marcador.updateUserPosition();
	   //SEND MESSAGE TO OTHER USERS
        var json = marker.to_JSON( ) 
        var json_text = $.toJSON(json);
        
        application.conection_manager.send_message('/mensaje', json_text);
       
  	});
  	
  	
}

Canvas_Marker.prototype.add_streetview_overlay_listener = function()
{
    var marcador = this;
	
	var listener = google.maps.event.addListener(marcador.gmarker, 'click', function(event)
	{
	   marcador.mostrar_streetview_canvas();
	   workspace.activate_streetview_edit();
	          
  	});
  	
}

Canvas_Marker.prototype.mostrar_streetview_canvas = function(location){
    
    var self = this;
    
    $('#' + self.canvas_id).css('z-index', '2');
    workspace.last_canvas = workspace.canvas[self.canvas_id];
    
    
}

Canvas_Marker.prototype.updateUserPosition = function(location){
    
    var self = this;    
    application.geo.client_position = self.gmarker.getPosition();
}

Canvas_Marker.prototype.has_infowindow = function(){
    
    var self = this;
    
    if (self.infowindow)
    {
        return true;
    }
    else
    {
        return false;
    }
}

Canvas_Marker.prototype.addInfowindow = function()
{
	var self = this;
	self.infowindow = new InfoWindow(
	{
		map: self.map,
		marker: self.gmarker
	});
	//self.infowindow.addImageUpload();
}

Canvas_Marker.prototype.add_chat_infowindow = function()
{
	var self = this;
	
	if (self.chat_infowindow)
	{
	    self.chat_infowindow.ginfowindow.open(self.map, self.gmarker);
	}
	else
	{
        self.chat_infowindow = new Chat_InfoWindow(
        {
            map: self.map,
            gmarker: self.gmarker,
            marker: self
        });
    }
}

Canvas_Marker.prototype.showOptions = function(location,id)
{
    var self = this;
    
    
    var scale = Math.pow(2, workspace.map.gmap.getZoom());
    var nw = new google.maps.LatLng(
        workspace.map.gmap.getBounds().getNorthEast().lat(),
        workspace.map.gmap.getBounds().getSouthWest().lng()
    );

    var worldCoordinateNW = workspace.map.gmap.getProjection().fromLatLngToPoint(nw);
    var worldCoordinate = workspace.map.gmap.getProjection().fromLatLngToPoint(location);
    var position = new google.maps.Point(
        Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
        Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale) - 30
    );


    //var position = workspace.map.gmap.getProjection().fromLatLngToPoint(location);
    
    //var position = location.fromLatLngToDivPixel(location);
    //alert(pixelOffset);
	workspace.showOverlayOptions(position, id);
}

Canvas_Marker.prototype.delete = function()
{
    var self = this;
    
	this.gmarker.setMap(null);
	
	//send delete to others
	
	var json = {
	   user_id: application.user_manager.get_user_id( ),
	   room_id: getActiveRoom(),
	   message_type: 'removeCanvas_Marker',
	   marker_id: self.id
	   };
	   
	var jsonText = $.toJSON(json);
	clientManager.sendMessage('/mensaje', jsonText);
}

Canvas_Marker.prototype.delete_from_other = function( )
{
    var self = this;
    
	this.gmarker.setMap(null);
}

Canvas_Marker.prototype.to_JSON = function( )
{
    var self = this;
    
    var json = {
            user_id: application.user_manager.get_user_id( ),
            user_position: self.get_position( ),
            room_id: application.get_active_room( ).id,
            room_collaborative: application.get_active_room( ).collaborative,
            message_type: 'user_position'
        }
    
    
    return json;
	
}

Canvas_Marker.prototype.get_position = function( )
{
    var self = this;
    
    position = self.gmarker.getPosition();
    position = [[position.lat()],[position.lng()]]
	
	return position;
}

Canvas_Marker.prototype.message_received = function( data )
{
    var self = this;
    
    if (self.primer_mensaje)
    {
        var position = self.get_position( );
        self.primer_mensaje = false;
 //       workspace.map.moveTo(position);
        
        self.add_chat_infowindow();
    }
    
    else if(!self.chat_infowindow.opened)
    {
        self.chat_infowindow.ginfowindow.open(self.map, self.gmarker);
        self.chat_infowindow.opened = true;
    }
    
    self.chat_infowindow.add_message_log(data.message, data.user_id);
    
  //  alert('/mensaje recibido');
}