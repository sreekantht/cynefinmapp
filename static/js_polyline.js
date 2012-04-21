function Polyline(data, options)
{
	var self = this;
	
	self._showingOptions = false;
	self._moveStartPositionX;
	self._moveStartPositionY;
	self._dragging;
	self._type = 'polyline';
	
	self.pointClicked;
	
	
	if(data)
	{
	    self.id = data.id;
		self.color = data.color; 
		self.weight =data.weight;
		self.zoom = data.zoom;
	} 
	else
	{
		self.points = [];
		self.pointIndexsToKeep = [];
		self.color = "#FF0000"; 
		self.weight =4;
		self.zoom = 8;
	}
	
	self.gpolyline = new google.maps.Polyline({
	   strokeColor: self.color,
	   strokeOpacity: self.opacity,
	   strokeWeight: self.weight
	});
	
	if (data.path)
	{
	   path = google.maps.geometry.encoding.decodePath(data.path);//self.setPath(data.path);
	   self.gpolyline.setPath(path);
	}
	self.gpolyline.setMap(data.map);
	self.map = data.map;
	self.gpolyline.id = self.id;
	
	self.addListener()
}

Polyline.prototype.updatePolyline = function(location)
{
    var self = this;
    
    if ( application.workspace.drawingSketch ){
        var path = polyline.gpolyline.getPath( );
        path.push( location );
    }
}

Polyline.prototype.addListener = function()
{
    var self = this;
    	
	var listener = google.maps.event.addListener(self.gpolyline, 'mouseup', function()
	{
    	self.endPolyline()
  	});
  	
  	var listener = google.maps.event.addListener(self.gpolyline, 'click', function(event)
	{
	    id = this.id
	    if (application.workspace._showingOverlayOptionsId == id)
	    {
	       application.workspace.hideOverlayOptions();
	    }
	    else
	    {
	       self.pointClicked = event.latLng;
	       self.showOptions(event.latLng, id);
	       
	    }
    	
  	});
  	
}

Polyline.prototype.endPolyline = function(location)
{
    var self = this;
	application.workspace.drawingSketch = false;
	
	json = self.to_JSON( );
	application.conection_manager.send_message('/mensaje', json);
}

Polyline.prototype.startDrag = function(position)
{
    self._moveStartPositionX = position.pageX;
    self._moveStartPositionY = position.pageY;
    //alert(position.lng());
	self._dragging = true;
	
}

Polyline.prototype.endDrag = function()
{
	var self = this;
	self._dragging = false;
}

Polyline.prototype.delete = function(location)
{
    var self = this;
    
	this.gpolyline.setMap(null);
	
	//send delete to others
	
	json = {
	   user_id: application.user_manager.get_user_id( ),
	   room_id: application.get_active_room( ).id,
	   message_type: 'remove_polyline',
	   polyline_id: this.id
	   };
	   
	jsonText = $.toJSON(json);
	application.conection_manager.send_message('/mensaje', jsonText);
}

Polyline.prototype.delete_from_other = function( )
{
    var self = this;
	this.gpolyline.setMap( null );
}

Polyline.prototype.getNewPath = function()
{
    var self = this;
    
    path = self.gpolyline.getPath()
    
    //modificar el path.. solo moverlo un poco mas arriba y la derecha
    
    newPath = []
    
	path.b.forEach( function(current_item)
	{
	   point = new google.maps.LatLng(current_item.lat() + 0.0005, current_item.lng() + 0.0005);
	   newPath.push(point);
	});
	
	return newPath;
}

Polyline.prototype.setPath = function(path)
{
    var self = this;
    
    
    //modificar el path.. solo moverlo un poco mas arriba y la derecha
    
    newPath = []
    
    for (i=0; i < path.length; i++)
    {
        point = new google.maps.LatLng(path[i][0], path[i][1]);
	   newPath.push(point);
    }
    /*
	path.b.forEach( function(current_item)
	{
	   point = new google.maps.LatLng(current_item[0], current_item[1]);
	   newPath.push(point);
	});
	*/
	
	return newPath;
}

Polyline.prototype.move = function(direction)
{
    var self = this;
    startPath = self.gpolyline.getPath();
    var deltaLng = 0;
    var deltaLat = 0;
    
    switch(direction)
    {
        case 'up':
            deltaLat = -0.0001;
        case 'down':
            deltaLat = -0.0001;
        case 'left':
            deltaLng = -0.0001;
        case 'right':
            deltaLng = 0.0001;
        
    }
    
    var newPath = [];
    
	startPath.b.forEach( function(current_item)
	{
	   point = new google.maps.LatLng(current_item.lat() + deltaLat, current_item.lng() + deltaLng);
	   newPath.push(point);
	});
	
	self.gpolyline.setPath(newPath)
}

Polyline.prototype.showOptions = function(location, id)
{
    var self = this;
    application.workspace.overlayOptionsLocation = location;
    
    if (!workspace.drawingSketch)
    {
        var scale = Math.pow(2, application.workspace.map.gmap.getZoom());
        var nw = new google.maps.LatLng(
            application.workspace.map.gmap.getBounds().getNorthEast().lat(),
            application.workspace.map.gmap.getBounds().getSouthWest().lng()
        );
    
        var worldCoordinateNW = application.workspace.map.gmap.getProjection().fromLatLngToPoint(nw);
        var worldCoordinate = application.workspace.map.gmap.getProjection().fromLatLngToPoint(location);
        var position = new google.maps.Point(
            Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale) - 30, 
            Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale) - 10
        );
    	application.workspace.showOverlayOptions(position,id);
    }
    
    self._showingOptions = true;
}

Polyline.prototype.addInfowindow = function(position)
{
	var self = this;
	
	//position = workspace.getLatLngFromPixel(position);
	self.infowindow = new InfoWindow(
	{
		map: self.map,
		//polyline: self.gpolyline
		position: position
	});
	//self.infowindow.addImageUpload();
}


Polyline.prototype.to_JSON = function( )
{
    var self = this;
    
    json = {
        user_id: application.user_manager.get_user_id( ),
        room_id: application.get_active_room( ).id,
        room_type: application.get_active_room( ).type,
        room_collaborative: application.get_active_room( ).collaborative,
        message_type: 'add_polyline',
        polyline_id: self.id,
        polyline_color: self.color.replace('#', ''), //have to remove the # character
        polyline_weight: self.weight,
        polyline_zoom: self.zoom,
        polyline_path: self.get_path( )
    }
    
    
    jsonText = $.toJSON(json);
    
    return jsonText;
	
}

Polyline.prototype.get_path = function( )
{
    var self = this;
    old_path = self.gpolyline.getPath( )
    path = google.maps.geometry.encoding.encodePath( old_path );
	
	return path;
}