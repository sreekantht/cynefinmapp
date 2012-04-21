function Conection_Manager()
{
	var self = this;
	self.socket;
	self.channel;
	self.channel_token;
	
	self.sock = new io.connect('http://' + window.location.host);
    self.message = new io.connect('http://' + window.location.host + '/mensaje');
    
    self.sock.on('disconnect', function( )
    {
    	self.sock.socket.reconnect( );
    });
    
    self.message.on('message', function( data )
    {
    	self.on_message( data );
    });
    
    //send message
    
}

Conection_Manager.prototype.start = function( )
{
    //var self = this;
    //self.get_channel_token( );
}

Conection_Manager.prototype.get_channel_token = function( )
{
    var self = this;
    var path = '/getchanneltoken?id=' + application.user_manager.get_user_id( );
    var response;
    
    $.post(path, null, function(data)
    {
        response = JSON.parse(data);
        self.channel_token = response.token;
        self.initialize_channel(response.token);
    });
}

Conection_Manager.prototype.initialize_channel = function( token )
{
    var self = this;
    if (self.socket)
    {
		self.socket.close();
	}
    self.channel = new goog.appengine.Channel(token);
    self.socket = self.channel.open();
    //self.socket.onopened = onOpened;
    self.socket.onmessage = self.on_message; 
    
    //self.channelConected = token;
}

Conection_Manager.prototype.send_message = function( path, json_msg )
{
    var self = this;
    
    if ( path == '/mensaje' )
    {
    	self.message.send( json_msg );
    }
}

Conection_Manager.prototype.on_message = function(m)
{
    self = this;
    console.dir(m);
    
    var message = JSON.parse(m.data);
    
    if (message.message_type == 'cambiar_escenario' && !application.user_manager.get_session_leader( ) )
    {
        application.session.cambiar_escenario( message.escenario );
    }
    else if ( message.message_type == 'add_rooms' )
        {
            $('#' + message.room_type ).empty( );
            console.dir(message);
            application.room_containers[message.room_type].rooms = {};
            
            $.each( message.rooms, function( index, room )
            {
                application.room_containers[room.room_type].rooms[room.id] = application.room_containers[room.room_type].__sacar_create_room_from_db( room );
            });
            
            application.room_containers[message.room_type].set_active_first_room( );
        }
    else if (message.user_id == application.user_manager.get_user_id( ))
    {
        switch(message.message_type)
        {
            case 'add_marker':
                application.active_room.place_marker( message );
                break;
            case 'update_marker':
                application.active_room.remove_marker( message );
                application.active_room.place_marker( message );
                break;
            case 'add_polyline':
                application.active_room.place_polyline( message );
                break;
            case 'remove_marker':
                application.active_room.remove_marker( message );
                break;
            case 'remove_polyline':
                application.active_room.remove_polyline( message );
                break;
            case 'map_move':
                application.active_room.move_to( message );
                break;
            }
        return;
    }
        
    else
    {
        if (message.room_id == application.get_active_room( ).id && message.room_collaborative)
        {
            switch(message.message_type)
            {
                
                case 'add_marker':
                    application.workspace.map.place_marker_from_other( message );
                    application.active_room.place_marker( message );
                    break;
                case 'update_marker':
                    application.workspace.map.markers[message.marker_id].deleteFromOther();
                    application.active_room.remove_marker( message );
                    
                    application.workspace.map.place_marker_from_other( message );
                    application.active_room.place_marker( message );
                    break;
                case 'add_polyline':
                    application.workspace.map.place_polyline_from_other(message);
                    application.active_room.place_polyline( message );
                    break;
                case 'remove_marker':
                    application.workspace.map.markers[message.marker_id].delete_from_other( );
                    application.active_room.remove_marker( message );
                    break;
                case 'remove_polyline':
                    application.workspace.map.polylines[message.polyline_id].delete_from_other( );
                    application.active_room.remove_polyline( message );
                    break;
                case 'mensaje':
                    alert(message.mensaje);
                    break;
                case 'map_move':
                    if ( !application.user_manager.is_using_chat( ) )
                    {
                        application.workspace.map.move_to(message);
                        application.active_room.move_to( message );
                    }
                    break;
                case 'remove_room':
                    application.room_containers[message.room_type].__sacar_delete_room_from_other( message );
                    break;
                case 'user_editing':
                    application.user_manager.set_editing( message );
                    break;
                case 'user_disconected':
                    if ( message.room_collaborative )
                    {
                    
                        //REMOVE IT FROM THE MAP??
                        application.get_active_room( ).user_markers[message.user_id].delete_from_other( );
                        
                        //REMOVE FROM THE HTML
                        application.screen_manager.remove_user( message );
                        
                        //REMOVE FROM THE ROOM
                        application.get_active_room( ).remove_user( message );
                        
                        
                        

                    }
                    break;
                case 'user_conected':
                    if ( message.room_collaborative )
                    {
                        // ADD TO THE ROOM
                            application.get_active_room( ).add_user( message );
                        
                        // ADD TO THE HTML
                            application.screen_manager.add_user( message );
                            
                        // ADD TO THE MAP
                        var coords = new google.maps.LatLng(message.user_position[0], message.user_position[1]);
                      
                        if ( application.active_room.user_markers[message.user_id])
                        {
                            application.workspace.map.user_markers[message.user_id].gmarker.setMap( application.workspace.map.gmap );
                            application.active_room.user_markers[message.user_id].gmarker.setPosition(coords);
                        }
                        else
                        {
                            var user_marker_options =
                            {
                                user_position: coords,
                                user_id: message.user_id,
                                draggable: false,
                                user_markers: true
                            }
                            
                            application.workspace.map.place_user_marker( user_marker_options );
                            //application.get_active_room( ).user_markers[message.user_id] = user_marker;
                        }
                    }
                    break;
                case 'user_position':
                    if (message.room_collaborative)
                    {
                      var coords = new google.maps.LatLng(message.user_position[0], message.user_position[1]);
                      
                      if ( application.get_active_room( ).user_markers[message.user_id])
                      {
                        //workspace.staticRoom.userMarkers[message.userId].gmarker.setMap(workspace.map.gmap);
                        applicaiton.get_active_room( ).user_markers[message.user_id].gmarker.setPosition(coords);
                      }
                    }
                    break;
                case 'message':
                    application.get_active_room( ).user_markers[message.user_id].message_received(message);
                    break;
                    
            }
        }
        else if ( message.room_collaborative )
        {
            switch(message.message_type)
            {
                case 'add_marker':
                    application.room_containers[message.room_type].rooms[message.room_id].place_marker( message );
                    break;
                
                case 'update_marker':
                    application.room_containers[message.room_type].rooms[message.room_id].remove_marker(message);
                    application.room_containers[message.room_type].rooms[message.room_id].place_marker(message);
                    break;
                    
                case 'add_polyline':
                    application.room_containers[message.room_type].rooms[message.room_id].place_polyline( message );
                    break;
                case 'remove_marker':
                    application.room_containers[message.room_type].rooms[message.room_id].remove_marker(message);
                    break;
                case 'remove_polyline':
                    application.room_containers[message.room_type].rooms[message.room_id].remove_polyline( message );
                    break;
                case 'map_move':
                    application.room_containers[message.room_type].rooms[message.room_id].move_to( message );
                    break;
                case 'add_room':
                    application.room_containers[message.room_type].__sacar_create_room_from_other( message );
                    break;   
                case 'remove_room':
                    application.room_containers[message.room_type].__sacar_delete_room_from_other( message );
                    break;
                case 'user_disconected':
                    //REMOVE FROM THE ROOM
                    application.room_containers[message.room_type].rooms[message.room_id].remove_user( message );
                    break;
                case 'user_conected':
                    application.room_containers[message.room_type].rooms[message.room_id].add_user( message );
                    break;
            }
        }
    }
}
