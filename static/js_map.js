//HERE IS THE Map CLASS

function Map(options)
{
    var self = this;
    self.userMove;
    self.id = Utils.guid();
    //self.dom = document.getElementById("map");
    self.dom = options.dom;
    self.jqueryDom = options.jqueryDom;
    self.controllable = options.controllable;
    self.showCredits = options.showCredits;
    self.markers = {};
    self.locked;
    self.listeners = [];
    
    self.polylines = {};
    self.polylineBeingDrawn;
    
    self.map_type_id = 'roadmap';
    
    var latlng;
    if (options.center)
    {
        latlng = new google.maps.LatLng(options.center[0], options.center[1]);
    }
    else
    {
        latlng = new google.maps.LatLng(-33.442274640638544, -70.63674688339233);
    }
    var mapOptions = 
    {
        zoom: 16,
		center: latlng,
		zoomControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		streetViewControl: true,
		streetViewControlOptions:
		{
		  position: google.maps.ControlPosition.BOTTOM_CENTER
		},
		mapTypeControl: true,
		mapTypeControlOptions:
		{
		  position: google.maps.ControlPosition.BOTTOM_CENTER,
		  mapTypeIds: [google.maps.MapTypeId.ROADMAP,
		               google.maps.MapTypeId.HYBRID,
		               google.maps.MapTypeId.SATELLITE,
		               google.maps.MapTypeId.TERRAIN
		               ],
		  style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
		},
		panControlOptions:
		{
		    position: google.maps.ControlPosition.TOP_RIGHT
		},
		
		panControl: false
	};
	
	if (!self.controllable)
	{
		//mapOptions.disableDoubleClickZoom = true;
		mapOptions.disableDefaultUI = true;
		mapOptions.draggable = false;
		mapOptions.scrollwheel = false;
	}
	else
	{
		mapOptions.navigationControlOptions = 
		{
			style: google.maps.NavigationControlStyle.SMALL
		}
	}
	

	self.gmap = new google.maps.Map(self.dom, mapOptions);
	self.panorama = self.gmap.getStreetView();
	
	//TEXT SEARCH
	var input = document.getElementById('searchBox');        
    var autocomplete = new google.maps.places.Autocomplete(input); 
    
    autocomplete.bindTo('bounds', self.gmap); 
    
    
    google.maps.event.addListener(autocomplete, 'place_changed', function() 
    {          
        //infowindow.close();          
        //alert('place changed');
        var place = autocomplete.getPlace();          
        if (place.geometry.viewport)
        {            
            self.gmap.fitBounds(place.geometry.viewport);          
        } 
        else 
        {            
            self.gmap.setCenter(place.geometry.location);            
            self.gmap.setZoom(17);  // Why 17? Because it looks good.   
            self.placeCustomMarker(place.geometry.location);       
        }          
        
        self.send_move( );
        
        //var image = new google.maps.MarkerImage(
        //                                         place.icon,              
        //                                         new google.maps.Size(71, 71),              
        //                                         new google.maps.Point(0, 0),              
        //                                         new google.maps.Point(17, 34),              
        //                                         new google.maps.Size(35, 35)
        //                                       );          
        //marker.setIcon(image);          
        //marker.setPosition(place.geometry.location);          
        //var address = '';          
        //if (place.address_components) 
        //{            
        //    address = [(place.address_components[0] && place.address_components[0].short_name || ''),                       
        //               (place.address_components[1] && place.address_components[1].short_name || ''),
        //               (place.address_components[2] && place.address_components[2].short_name || '')                      
        //              ].join(' ');          
        //}          
        //infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);          
        //infowindow.open(map, marker);        
    });
    
    
    //END TEXT SEARCH 

	//if(options.position)
	//	self.moveTo(options.position);

	google.maps.event.addListener(self.gmap, 'dragstart', function()
	{
		self.userMove = true
	});
	google.maps.event.addListener(self.gmap, 'dragend', function()
	{
		self.userMove = false
	});
	
	google.maps.event.addListener(self.gmap, 'maptypeid_changed', function()
	{
		self.map_type_id = self.gmap.getMapTypeId();
		//self.sendMove();
	});
	
	google.maps.event.addListener(self.panorama, 'visible_changed', function() {

    if ( application.workspace.map.panorama.getVisible( ) ) {
        application.workspace.activate_streetview_select( );

    } else {
        application.workspace.deactivate_streetview_edit( );

    }

});

	// Create Overlay to capture XY Position
	self.overlay = new google.maps.OverlayView();
	self.overlay.draw = function() {};
	self.overlay.onRemove = function() {};
	self.overlay.setMap(self.gmap);

	// Clean the exesive gmaps credits.
	if(!self.showCredits)
		setTimeout(function()
		{
			$('a[target="_blank"]', self.dom).parent().detach();
		}, 800);
}


Map.prototype.lock = function()
{
	this.locked = true;

	this.gmap.setOptions(
	{
		zoomControl: false,
		//panControl: false,
		scrollwheel: false,
		disableDoubleClickZoom: true,
		draggable: false
	})
}


Map.prototype.add_streetview_overlay = function()
{
	var self = this;
	var image_url = self.getStreetViewURL('100x75');
	var location = self.get_street_view_location();
	
	
	var id = Utils.guid();
	
	marker = new Marker(
	{
	    id: id,
		position: location,
		title: 'hola',
		map: self.gmap,
	});
	
	marker.addListener( );
	
	var icon_url = image_url;
	marker.gmarker.setIcon(icon_url);
	
	//var id = marker.gmarker.id;
	self.markers[id] = marker;
	
	self.gmap.streetView.setVisible(false);
	//workspace.deactivate_streetview_edit();
	
}


Map.prototype.add_streetview_overlay_from_other = function( options )
{
	var self = this;
	var image_url = options.image_url;
	var location = options.location;
	var id = options.id;
	
	marker = new Marker(
	{
	    id: id,
		position: location,
		title: 'hola',
		map: self.gmap,
	});
	
	marker.addListener();
	
	var icon_url = image_url;
	marker.gmarker.setIcon(icon_url);
	
	//var id = marker.gmarker.id;
	self.markers[id] = marker;
	
	self.gmap.streetView.setVisible(false);
	//workspace.deactivate_streetview_edit();
	
}

Map.prototype.add_streetview_draw = function( image_url, canvas_id )
{
	var self = this;
	var id = 'marker_' + canvas_id;
	var size = new google.maps.Size(50,50);
	var marker_image = new google.maps.MarkerImage(image_url,null,null,null, size);
	var location = self.get_street_view_location();
	$('#' + canvas_id).css('z-index', '-1');
	
	if ( self.markers[id] )
	{
	    self.markers[id].gmarker.setIcon( marker_image );
	    
	    application.workspace.deactivate_streetview_edit();
	    
	}
	
	else
	{
        
        self.gmap.streetView.setVisible(false);
        
        
        //var id = Utils.guid();
        
        var marker = new Marker(
        {
            id: id,
            position: location,
            title: 'hola',
            map: self.gmap,
        });
        
        marker.canvas_id = application.workspace.last_canvas.id;
        
        
        
            
        
        marker.add_streetview_overlay_listener( );
        
        marker.gmarker.setIcon(marker_image);
        marker.gmarker.setDraggable( false );
        
        //var id = marker.gmarker.id;
        self.markers[id] = marker;
	}
	
	var json =
	{
	    message_type: 'add_streetview_marker',
	    user_id: application.user_manager.get_user_id( ),
	    room_id: application.get_active_room( ).id,
	    room_type: application.get_active_room( ).type,
	    room_collaborative: application.get_active_room( ).collaborative,
	    id: id,
	    marker_image: marker_image,
	    location: location,
	    canvas_id: application.workspace.last_canvas.id
	}
	
	var json_text = $.toJSON( json );
	application.conection_manager.send_message( '/mensaje', json_text );
	
}

Map.prototype.add_streetview_draw_from_other = function( options )
{
	var self = this;
	var id = options.id
	var size = new google.maps.Size(50,50);
	var marker_image = options.marker_image;
	
	if ( self.markers[id] )
	{
	    self.markers[id].gmarker.setIcon( marker_image );
	}
	
	else
	{
        var location = options.location;
        
        var marker = new Marker(
        {
            id: id,
            position: location,
            title: 'hola',
            map: self.gmap,
        });
        
        marker.canvas_id = options.canvas_id;
        marker.gmarker.setIcon(marker_image);
        marker.gmarker.setDraggable( false );
        self.markers[id] = marker;
	}
}



Map.prototype.add_streetview_image = function()
{
	var self = this;
	var image_url = self.getStreetViewURL('640x640');
	var canvas_id = Utils.guid();
	var canvas_obj = new Canvas_M( { id: canvas_id, image_url: image_url } );
	
	application.get_active_room( ).canvases[canvas_id] = canvas_obj;
}

Map.prototype.unlock = function()
{
	this.locked = false;
	if (this.lastMove)
	{
		this.moveTo(this.lastMove);
		delete this.lastMove;
	}

	this.gmap.setOptions(
	{
		//zoomControl: true,
		//panControl: true,
		//scrollwheel:true,
		//disableDoubleClickZoom: false,
		draggable: true
	})
}



Map.prototype.addMarkerListener = function()
{
	var map = this;
	var listener = google.maps.event.addListener(map.gmap, 'click', function(event)
	{
    	map.placeMarker(event.latLng);
  	});
  	
  	this.listeners.push(listener);

}

Map.prototype.add_polyline_listener = function()
{
	var map = this;
	google.maps.event.addListener(map.gmap, 'mousedown', function(event)
	{
    	map.place_polyline(event.latLng);
  	});
  	
  	google.maps.event.addListener(map.gmap, 'touchdown', function(event)
	{
    	map.place_polyline(event.latLng);
  	});
  	
  	google.maps.event.addListener(map.gmap, 'mousemove', function(event)
	{
    	map.update_polyline(event.latLng);
  	});
  	
  	google.maps.event.addListener(map.gmap, 'touchmove', function(event)
	{
    	map.update_polyline(event.latLng);
  	});
  	
  	google.maps.event.addListener(map.gmap, 'mouseup', function(event)
	{
    	map.end_polyline(event.latLng);
  	});
  	
  	google.maps.event.addListener(map.gmap, 'touchup', function(event)
	{
    	map.end_polyline(event.latLng);
  	});
  	
  	

}

Map.prototype.remove_listeners = function()
{
	var map = this;
	
	google.maps.event.clearListeners(map.gmap, 'click');
	google.maps.event.clearListeners(map.gmap, 'mousedown');
	google.maps.event.clearListeners(map.gmap, 'touchdown');

}



Map.prototype.placeMarker = function(location)
{
	var self = this;
	id = Utils.guid();
	
	marker = new Marker(
	{
	    id: id,
		position: location,
		title: 'hola',
		map: self.gmap
	});
	
	marker.add_listener();
	id = marker.gmarker.id;
	self.markers[id] = marker;
	
	/*** SEND MARKER TO OTHERS ***/
	var json = marker.to_JSON( );
	var json_text = $.toJSON( json );
	application.conection_manager.send_message( '/mensaje', json_text );
	
}

Map.prototype.placeCustomMarker = function(location, userId)
{
	var self = this;
	
	if (!self.client_marker)
	{
        id = Utils.guid();
        
        
        
        if (!userId)
        {
           userId = application.user_manager.get_user_id( );
        }
        
        marker = new Marker(
        {
            id: id,
            position: location,
            title: 'hola',
            map: self.gmap,
            userId: userId
            
        });
        
        marker.addCustomListener();
        
        var icon_url = 'https://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=glyphish_user|edge_bc|' + userId + '|FFFFFF|000000'
        marker.gmarker.setIcon(icon_url);
        
        
        //marker.gmarker.setIcon('images/positionDot.png');
        id = marker.gmarker.id;
        self.client_marker = marker;
	}
	
	else
	{
	    self.client_marker.gmarker.setPosition( location );
	}
	
}

Map.prototype.place_user_marker = function( options )
{
	var self = this;
	
	if (!self.client_marker)
	{
        var id = Utils.guid();
        var marker_options = 
        {
            id: id,
            map: self.gmap
        }
        
        if ( options)
        {
            if ( options.user_id )
            {
                marker_options['user_id'] = options.user_id;
                marker_options['icon'] = 'https://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=glyphish_user|edge_bc|' + options.user_id + '|FFFFFF|000000'
            }
            
            if ( options.user_position )
            {
                marker_options['position'] = options.user_position;
            }
            
            if ( options.draggable )
            {
                marker_options['draggable'] = true;
            }
            else
            {
                marker_options['draggable'] = false;
            }
        }
        
        marker = new User_Marker( marker_options );
        
        marker.add_listener( );
        
        if ( options )
        {
            if ( options.client_marker )
            {
                self.client_marker = marker;
            }
            else if ( options.user_markers )
            {
                application.get_active_room( ).user_markers[ marker_options['user_id'] ] = marker;
            }
        }
	}
	
	else
	{
	    self.client_marker.gmarker.setPosition( options.user_position );
	}
	
}

Map.prototype.placeUserPosition = function(location, userId)
{
	var self = this;
	id = Utils.guid();
	
	if (!userId)
	{
	   userId = application.user_manager.get_user_id( );
	}
	marker = new Marker(
	{
	    id: id,
		position: location,
		title: 'hola',
		map: self.gmap,
		userId: userId
		
	});
	
	marker.addCustomListener();
	
	var icon_url = 'https://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=glyphish_user|edge_bc|' + userId + '|ffffff|000000'
	marker.gmarker.setIcon(icon_url);
	marker.gmarker.setDraggable(false);
	id = marker.gmarker.id;
	return marker;
	
}

Map.prototype.place_marker_from_other = function( data )
{
	var self = this;
	
	var position = new google.maps.LatLng(data.marker_position[0], data.marker_position[1]);
	
	marker = new Marker(
	{
	    id: data.marker_id,
		position: position,
		title: 'hola',
		map: self.gmap
	});
	
	marker.add_listener( );
	id = marker.id;
	self.markers[id] = marker;
	
}

Map.prototype.place_polyline = function(location)
{
	var self = this;
	id = Utils.guid();
	
	polyline = new Polyline({
	   id: id,
	   color: application.workspace._sketchColorHTML,
	   weight: application.workspace._sketchThicknessNumber,
	   zoom: 8,
	   map: self.gmap
	   
	});
	
	self.polylines[id] = polyline;
	self.polylineBeingDrawn = polyline;
	application.workspace.drawingSketch = true;
	
	//send polyline to the others users
	
	
	
}

Map.prototype.place_polyline_from_other = function( data )
{
	var self = this;
	
	polyline = new Polyline({
	   color: '#' + data.polyline_color,
	   weight: data.polyline_weight,
	   zoom: data.polyline_zoom,
	   map: self.gmap,
	   path: data.polyline_path,
	   id: data.polyline_id
	   
	});
	
	//id = polyline.gpolyline.__gm_id;
	id = polyline.id;
	self.polylines[id] = polyline;
	
	//send polyline to the others users
	
	
	
}

Map.prototype.update_polyline = function(location)
{
	var self = this;
	//alert(self.polylines.length);
	//ultima_posicion = self.polylines.length -1; 
	
	if (application.workspace.drawingSketch)
	{
	   self.polylineBeingDrawn.updatePolyline(location);
	}
	
}

Map.prototype.copyPolyline = function(polyline)
{
	var self = this;
	var id = Utils.guid();
	var newPath = polyline.getNewPath();
	
	var newPolyline = new Polyline({
	   id : id,
	   color: polyline.gpolyline.strokeColor,
	   weight: polyline.gpolyline.strokeWeight,
	   zoom: 8,
	   map: self.gmap
	   
	});
	
	newPolyline.gpolyline.setPath(newPath);
	
	var id = newPolyline.id;
	self.polylines[id] = newPolyline;
	
	self.polylines[id].showOptions(workspace.overlayOptionsLocation, id);
	
	var json = newPolyline.toJson();
	application.conection_manager.send_message('/mensaje', json);
}

Map.prototype.end_polyline = function(location)
{
	application.workspace.drawingSketch = false;
}

Map.prototype.hideOptionsPolyline = function(location)
{
	for (polyline in self.polylines)
	{
	   polyline._showingOptions = false;
	}
}

Map.prototype.add_listener = function( )
{
	var self = this;
	
	google.maps.event.addListener(self.gmap, 'dragend', function()
	{
		application.workspace.map.send_move();
	});
}

Map.prototype.send_move = function()
{
	var self = this;
	var json = self.to_JSON( );
	var json_text = $.toJSON( json );
	
	application.conection_manager.send_message('/mensaje', json_text);
}

Map.prototype.changeUserZoomChange = function()
{
	var self = this;
	
	setTimeout(function()
	{
	   self.userZoomChange = false;
	}, 100);
	

}

Map.prototype.sendZoomChanged = function()
{
	var self = this;
	
	
	var json = self.to_JSON( );
	
	var jsonText = $.toJSON(json);
	
	sendMessage('/mensaje', jsonText);
}

Map.prototype.get_position = function( )
{
	var center = this.gmap.getCenter( );
	
	return [ center.lat( ),center.lng( )]
}

Map.prototype.get_zoom = function( )
{
	return this.gmap.getZoom();	
}

Map.prototype.move_to = function( data )
{
	if (this.locked)
	{
		return;
	}

	this.gmap.panTo(new google.maps.LatLng(data.map_center[0], data.map_center[1]));
	this.gmap.setZoom(data.map_zoom);
	if (data.map_type_id)
	{
	    this.gmap.setMapTypeId(data.map_type_id);
	}
}

Map.prototype.getStreetViewURL = function(size)
{
    
    var self = this;
    var position = self.gmap.streetView.getPosition();
    var pov = self.gmap.streetView.getPov();
    
    var location =  position.lat() + ',' + position.lng();
    var heading = pov.heading;
    var fov =  (180/Math.pow(2,pov.zoom));
    var pitch = pov.pitch;
    
    response_url = '/get_map_url?size=' + size + '&location=' + location + '&heading=' + heading + '&fov=' + fov + '&pitch=' + pitch;
    
    return response_url;
    /*
    
    var response = $.get('/get_map_url',
        {
            image_url: url 
        }, 
        function(data) {
            return data;
        }
    );
    
    
    
	return response;
	*/
}

Map.prototype.get_street_view_location = function()
{
    
    var self = this;
    var position = self.gmap.streetView.getPosition();
    
	return position;
}

Map.prototype.get_map_type_id = function( )
{
    
    var self = this;
	return self.map_type_id;
}

Map.prototype.to_JSON = function( )
{
    var self = this;
    
    var json = {
	    user_id: application.user_manager.get_user_id( ),
	    room_id: application.get_active_room( ).id,
	    room_type: application.get_active_room( ).type,
        room_collaborative: application.get_active_room( ).collaborative,
	    message_type: 'map_move',
	    map_center: self.get_position( ),
	    map_zoom: self.get_zoom( ),
	    map_type_id: self.get_map_type_id( )
	}
	
	return json;
}

