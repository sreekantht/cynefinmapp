
function Marker(data)
{
	var self = this;
	
	self.position = data.position;
	self.title = data.title;
	self.map = data.map;
	self.id  = data.id;
	self.primer_mensaje = true;
	
	self._type = 'marker';
	
	self.gmarker = new google.maps.Marker({
      position: data.position, 
      map: data.map,
      title: data.title,
      draggable: true
  });
  
    self.gmarker.id = self.id;
    
    if (data.userId)
    {
        self.userId = data.userId;
        self.gmarker.setTitle('user ' + data.userId);
    }
}

Marker.prototype.addListener = function()
{
    var marcador = this;
	
	var listener = google.maps.event.addListener(marcador.gmarker, 'click', function(event)
	{
	    var id = this.id;
	    
	    if (workspace._showingOverlayOptionsId == id)
	    {
	       workspace.hideOverlayOptions();
	    }
	    else
	    {
	       marcador.showOptions(event.latLng, id);
	    }
  	});
  	
  	var listener2 = google.maps.event.addListener(marcador.gmarker, 'dragend', function(event)
	{
	    var id = this.id;
	    
	    var json = marcador.toJson(true);
	    application.conection_manager.send_message('/mensaje', json);
	    
  	});
  	
  	
}


Marker.prototype.addCustomListener = function()
{
    var marcador = this;
	
	var listener = google.maps.event.addListener(marcador.gmarker, 'click', function(event)
	{
	   marcador.add_chat_infowindow();
	   marcador.primer_mensaje = false;
	   
	   /*
	   var mensaje = prompt('Write your message', 'Hello');
	   
	   var json = {
	       userId: application.user_manager.get_user_id( ),
	       roomId: application.get_active_room( ).id,
	       to: marcador.userId,
	       type: 'message',
	       message: mensaje
	   }
	   
	   var jsonText = $.toJSON(json);
    
       application.conection_manager.send_message('/mensaje', jsonText);
       */
       
  	});
  	
  	var listener2 = google.maps.event.addListener(marcador.gmarker, 'dragend', function(event)
	{
	   id = this.id;
	   
	   marcador.updateUserPosition();
	   //SEND MESSAGE TO OTHER USERS
			var json = {
			userId: application.user_manager.get_user_id( ),
			roomId: application.get_active_room( ).id,
			type: 'userPosition',
			}
			
			
			
			json['user_position'] = getClientPosition()
			
			var jsonText = $.toJSON(json);
	        application.conection_manager.send_message('/mensaje', jsonText);
       
  	});
  	
  	
}

Marker.prototype.add_streetview_overlay_listener = function()
{
    var marcador = this;
	
	var listener = google.maps.event.addListener(marcador.gmarker, 'click', function(event)
	{
	   marcador.mostrar_streetview_canvas();
	   workspace.activate_streetview_edit();
	          
  	});
  	
}

Marker.prototype.mostrar_streetview_canvas = function(location){
    
    var self = this;
    
    $('#' + self.canvas_id).css('z-index', '2');
    workspace.last_canvas = workspace.canvas[self.canvas_id];
    
    
}

Marker.prototype.updateUserPosition = function(location){
    
    var self = this;
    //alert('position changed');
    
    clientManager.clientPosition = self.gmarker.getPosition();
}

Marker.prototype.has_infowindow = function(){
    
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

Marker.prototype.addInfowindow = function()
{
	var self = this;
	self.infowindow = new InfoWindow(
	{
		map: self.map,
		marker: self.gmarker
	});
	//self.infowindow.addImageUpload();
}

Marker.prototype.add_chat_infowindow = function()
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

Marker.prototype.showOptions = function(location,id)
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

Marker.prototype.delete = function()
{
    var self = this;
    
	this.gmarker.setMap(null);
	
	//send delete to others
	
	var json = {
	   userId: application.user_manager.get_user_id( ),
	   roomId: application.get_active_room( ).id,
	   type: 'removeMarker',
	   markerId: self.id
	   };
	   
	var jsonText = $.toJSON(json);
	application.conection_manager.send_message('/mensaje', jsonText);
}

Marker.prototype.deleteFromOther = function()
{
    var self = this;
    
	this.gmarker.setMap(null);
}

Marker.prototype.toJson = function(updated)
{
    var self = this;
    var json = {
            userId: application.user_manager.get_user_id( ),
            roomId: application.get_active_room( ).id,
            markerId: self.id,
            position: self.getPosition()
        }
        
    if (updated)
    {
        json['type'] = 'updateMarker';
    }
    
    else{
        json['type'] = 'addMarker';
    }
    
    jsonText = $.toJSON(json);
    
    return jsonText;
	
}

Marker.prototype.getPosition = function()
{
    var self = this;
    
    position = self.gmarker.getPosition();
    position = [[position.lat()],[position.lng()]]
	
	return position;
}

Marker.prototype.message_received = function(data)
{
    var self = this;
    
    if (self.primer_mensaje)
    {
        var position = self.getPosition();
        self.primer_mensaje = false;
 //       workspace.map.moveTo(position);
        
        self.add_chat_infowindow();
    }
    
    else if(!self.chat_infowindow.opened)
    {
        self.chat_infowindow.ginfowindow.open(self.map, self.gmarker);
        self.chat_infowindow.opened = true;
    }
    
    self.chat_infowindow.add_message_log(data.message, data.userId);
    
  //  alert('/mensaje recibido');
}