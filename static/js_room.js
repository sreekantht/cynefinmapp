function Room( data )
{
	var self = this;
	
	if (data)
	{
	    if (data.id)
	    {
	        self.id = data.id;
	    }
	    else
	    {
	        self.id = Utils.guid();
	    }
	    
	    if (data.room_type)
	    {
	        self.type = data.room_type;
	    }
	    if ( data.collaborative )
	    {
	        self.collaborative = true;
	    }
	    else
	    {
	        self.collaborative = false;
	    }
	}
	
	self.users = {}
    
	self.SELECTED ="1";
	self.NOT_SELECTED = "0.15";
	self.polylines = {};
	self.markers = {};
	self.user_markers = {};
	self.streetview_markers = {};
	self.canvases = {};
	self.position = 
	{
	   lat: -33.442274640638544,
	   lng: -70.63674688339233,
	   zoom: 16
	}
	
	self.map_src = 'http://maps.google.com/maps/api/staticmap?center=-33.44227,-70.63674&zoom=13&size=150x100&sensor=false&markers=color:red|size:tiny|'
	self.map_type_id = 'roadmap';
	self.dom = self.create_div( );
	
	self.add_listener()
	
}

Room.prototype.create_div = function( )
{
    var self = this;
    var map_div = document.createElement('div');
    var map_img = document.createElement('img');
    
	map_div.id = self.id;
	
	map_div.className = 'mini_room';
	map_img.className = 'mini_map';
	
	map_img.style.opacity = self.NOT_SELECTED;
	
	map_div.setAttribute('type', self.type);
	
	map_img.src = self.map_src;
	
	$(map_div).prependTo('#' + self.type);
	$(map_img).appendTo($(map_div));
	
	
	
	//mapImage.room = self;
	
	
	
	
}

Room.prototype.add_listener = function( )
{
    var self = this;
    var room = $('#' + self.id);
    
    room.click( function( )
    {
        application.room_containers[self.type].set_active_room( self.id );
    });

}

Room.prototype.obtener_lista_de_ids = function( )
{
    var self = this;
    var ids = []
    
    $.each( self.polylines, function( key, polyline)
    {
        ids.push( key );
    });
    
    $.each( self.markers, function( key, polyline)
    {
        ids.push( key );
    });
    
    ids.sort( );
    //console.dir( ids );
    return ids;

}

Room.prototype.place_play_room_overlays = function( lista_de_ids )
{
    var self = this;
    var map = application.workspace.map.gmap;
    
    if ( lista_de_ids.length > 0 )
    {
        if( self.polylines[lista_de_ids[0]] )
        {
           application.workspace.map.polylines[lista_de_ids[0]].gpolyline.setMap( map );
        }
        
        else if( self.markers[lista_de_ids[0]] )
        {
            application.workspace.map.markers[lista_de_ids[0]].gmarker.setMap( map );
        }
        
        lista_de_ids.shift( );
        
        setTimeout( function( )
        {
            self.place_play_room_overlays( lista_de_ids );
        },1500) 
        
    }

}

Room.prototype.play_room = function( )
{
    var self = this;
    
    var lista_de_ids = self.obtener_lista_de_ids( );
    
    // to_do, borrar los objetos del mapa, o set null y despues en orden set map this map
    
    for ( var i = 0; i < lista_de_ids.length; i++ )
    {
        if( self.polylines[lista_de_ids[i]] )
        {
           application.workspace.map.polylines[lista_de_ids[i]].gpolyline.setMap(null);
        }
        
        else if( self.markers[lista_de_ids[i]] )
        {
            application.workspace.map.markers[lista_de_ids[i]].gmarker.setMap(null);
        }
    }
    
    setTimeout( function( )
        {
            self.place_play_room_overlays( lista_de_ids );
        },1500) 
}

Room.prototype.paste_overlays = function()
{
    var self = this;
    
    $('.room_paste').css('background-image', "url('/images/icons/copyRoom.png')");
    //PASTE MARKERS
    var markers =  application.clipboard.markers;
    var active_room = application.get_active_room( );
	
	for ( marker_id in markers)
	{
	   var new_marker_id = Utils.guid( );
	   var position = [[markers[marker_id].position[0]], [markers[marker_id].position[1]]];
	   
	   var data = 
	   {
	       marker_id: new_marker_id,
	       marker_position: position
	   }
	   
	   //PASTE MARKER ON THE MAP
	   application.workspace.map.place_marker_from_other(data);
	   
	   //PASTE MARKER ON THE MINIMAP
	   active_room.place_marker(data);
	   
	   
	   
	   var json = {
            user_id: application.user_manager.get_user_id( ),
            room_id: application.get_active_room( ).id,
            room_type: application.get_active_room( ).type,
            room_collaborative: application.get_active_room( ).collaborative,
            marker_id: new_marker_id,
            marker_position: position,
            message_type: 'add_marker'
        }
    
    
		var json_text = $.toJSON(json);
		application.conection_manager.send_message('/mensaje', json_text);
	}
	
	
	
    
    //PASTE POLYLINES
	var polylines =  application.clipboard.polylines;
	
	for ( polyline_id in polylines)
	{
	   var new_polyline_id = Utils.guid( );
	   var color = polylines[polyline_id].color.substring(2,8);
	   var weight = polylines[polyline_id].weight;
	   var path   = polylines[polyline_id].path;
	   var zoom   = polylines[polyline_id].zoom;
	   
	   
	   data = 
	   {
	       polyline_id: new_polyline_id,
	       polyline_color: color,
	       polyline_weight: weight,
	       polyline_zoom: zoom,
	       polyline_path: path
	   }
	   
	   //PASTE POLYLINE ON THE MAP
	   application.workspace.map.place_polyline_from_other(data);
	   
	   //PASTE POLYLINE ON THE MINIMAP
	   active_room.place_polyline(data);
	   
	   
	   json = {
            user_id: application.user_manager.get_user_id( ),
            room_id: application.get_active_room( ).id,
            room_type: application.get_active_room( ).type,
            room_collaborative: application.get_active_room( ).collaborative,
            message_type: 'add_polyline',
            polyline_id: new_polyline_id,
            polyline_color: color,
            polyline_zoom: zoom,
            polyline_weight: weight,
            polyline_path: path
        }
    
    
    json_text = $.toJSON(json);
	application.conection_manager.send_message('/mensaje', json_text);
    
    
	}
}

Room.prototype.add_user = function(data)
{
    var self = this;
    
    var user =
    {
        user_id: data.user_id,
        user_position: data.user_position
    };
    
    self.users[data.user_id] = user;    
}

Room.prototype.remove_user = function(data)
{
    var self = this;
    delete application.get_active_room( ).user_markers[data.user_id];
    
}

Room.prototype.remove_users = function()
{
    var self = this;
    
    var roomates_div = $('.roommateF');
    roomates_div.remove();
    
}

Room.prototype.to_JSON = function( type )
{
    var self = this;
    
    var response = 
    {
        user_id: application.user_manager.get_user_id( ),
        new_room_id: self.id,
        room_type: self.type,
        room_collaborative: self.collaborative,
        message_type: 'add_room',
        session_id: application.session.get_session_id( ),
        room_type: self.type,
        room_collaborative: self.collaborative
        //AGREGAR MAP TYPE ID
    }
    
    return response;
}

Room.prototype.place_polyline = function( data )
{
    var self = this;
    
    self.polylines[data.polyline_id] = 
    {
        weight: data.polyline_weight,
        color: '0x' + data.polyline_color +'ff',
        path: data.polyline_path
    }
    
    self.update_map_url( );
    self.update_map( );
}

Room.prototype.update_map = function( )
{
    var self = this;
    
    div_img = $('#' + self.id + '>img');
    div_img.attr('src', self.map_src);
}

Room.prototype.update_map_url = function( )
{
    var self = this;
    
    var src = 'http://maps.google.com/maps/api/staticmap?';
    
    src += 'center=' + self.position.lat + ',' + self.position.lng;
    
    //CHANGE SO IT CAN BE READ FROM STATIC ROOM
    src += '&maptype=' + self.mapTypeId;
    
    src += '&zoom=13&size=150x100&sensor=false&markers=color:red|size:tiny|';
    
    
    
    for (marker_id in self.markers)
    {
        src += self.markers[marker_id].position[0] + ',' + self.markers[marker_id].position[1] + '|';
    }
    
    $.each(self.polylines, function(index, polyline){
        src += '&path=color:' + polyline.color + '|weight:' + (polyline.weight -2) + '|enc:' + polyline.path;
    });
    
    self.map_src = src;
}

Room.prototype.place_marker = function( data )
{
    var self = this;
    
    self.markers[data.marker_id] = 
    {
          position: [data.marker_position[0], data.marker_position[1]]
    }
    
    self.update_map_url( );
    self.update_map( );
}

Room.prototype.remove_marker = function( data )
{
    var self = this;
    
    delete self.markers[data.marker_id];
    self.update_map_url( );
    self.update_map( );
}

Room.prototype.remove_polyline = function( data )
{
    var self = this;
    
    delete self.polylines[data.polyline_id];
    self.update_map_url( );
    self.update_map( );
}

Room.prototype.move_to = function( data )
{
    var self = this;
    
    self.position.lat = data.map_center[0];
    self.position.lng = data.map_center[1];
    self.map_type_id = data.map_type_id;
    
    self.update_map_url( );
    self.update_map( );
}


