function Room_Container( name, order, collaborative )
{
	var self = this;
	self.selected_room;
	self.name = name;
	self.collaborative = collaborative;
	self.order = order;
	self.rooms = {};
	
	self.create_div( );
}

Room_Container.prototype.create_room = function( )
{
    var self = this;
    var data =
    {
        id: Utils.guid(),
        room_type: self.name,
        collaborative: self.collaborative
    }
    
    var room = new Room( data );
    
    self.rooms[room.id] = room;
    
    
    var json = room.to_JSON( );
    
    var json_text = $.toJSON(json);
	application.conection_manager.send_message('/mensaje', json_text); 
}

Room_Container.prototype.create_div = function(id, type)
{
    var self = this;
    var div_options          = document.createElement('div');
    var div_name             = document.createElement('div');
    var div_container        = document.createElement('div');
    var div_options_add      = document.createElement('div');
    var div_options_delete   = document.createElement('div');
    var div_options_copy     = document.createElement('div');
    var div_options_paste    = document.createElement('div');
    var div_options_play     = document.createElement('div');
    
    
    
    div_options.id         = self.name + '_room_options';
    div_name.id            = self.name + '_name';
    div_options_add.id     = self.name + '_add';
    div_options_delete.id  = self.name + '_delete';
    div_options_copy.id    = self.name + '_copy';
    div_options_paste.id   = self.name + '_paste';
    div_options_play.id    = self.name + '_play';
    div_container.id       = self.name;
    
    
    $(div_options).attr('class', 'room_options');
    $(div_name).attr('class', 'room_name');
    $(div_options_add).attr('class', 'room_add');
    $(div_options_delete).attr('class', 'room_delete');
    $(div_options_copy).attr('class', 'room_copy');
    $(div_options_paste).attr('class', 'room_paste');
    $(div_options_play).attr('class', 'room_play');
    $(div_container).attr('class','room space');
    
    $(div_name).append(self.name);
    
    
    $(div_options).append(div_options_add);
    $(div_options).append(div_options_delete);
    $(div_options).append(div_options_play);
    
    $(div_options).append(div_options_copy);
    $(div_options).append(div_options_paste);
    
    $('#rooms').append(div_options);
    $('#rooms').append(div_name);
    $('#rooms').append(div_container);
    
    self.add_listener( );
}

Room_Container.prototype.add_listener = function( )
{
    var self = this;
    
    $( '#' + self.name + '_add' ).click( function( )
    {
        self.create_room( );
    });
    
    $( '#' + self.name + '_delete' ).click( function( )
    {
        self.delete_room( );
    });
    
    $( '#' + self.name + '_copy' ).click( function( )
    {
        application.copy_overlays( );
        $(this).css('background-image', "url('/images/icons/copiar_seleccionado.png')");
    });
    
    $( '#' + self.name + '_paste' ).click( function( )
    {
        application.get_active_room( ).paste_overlays( );
    });
    
    $( '#' + self.name + '_play' ).click( function( )
    {
        self.rooms[self.selected_room].play_room( );
    });
}

Room_Container.prototype.set_active_first_room = function( )
{
    var self = this;
    var rooms = $('.mini_room');
    var room_type = self.name;
    
    rooms = rooms.filter( function( )
    {
        return $(this).attr('type') == room_type;
    });

    
    var q_rooms = rooms.length;
    
    if (q_rooms == 0)
    {
        
    }
    else
    {
        var room_id = $( rooms.first( ) ).attr( 'id' );
        self.set_active_room( room_id );
        $( '#' + room_type ).scrollTop( 0 );
    }
}

Room_Container.prototype.set_active_room = function( room_id )
{
    var self = this;
    var room_div = $('#' + room_id);
    var map     = $('#' + room_id + '>img');
    var type = room_div.attr('type');
    var room = self.rooms[room_id];
    
    application.unset_active_room( type );
    self.selected_room = room_id;
    
    room_div.css('border', 'solid 5px #000000');
    map.css('opacity', '1.0'); 
    
    
    //PREPARE MESSAGE SENDING
    if ( application.get_active_room( ) )
    {
        var json = {
            user_id: application.user_manager.get_user_id( ),
            user_position: application.geo.get_client_position( ),
            session_id: application.session.get_session_id( ),
            room_id: room_id,
            room_collaborative: self.collaborative,
            room_type: self.name,
            message_type: 'user_conected'
        }
    
    
    
        var json_text = $.toJSON(json);
        
        application.conection_manager.send_message('/mensaje', json_text);
    }
        
    
    
    application.active_room =  room;
    application.workspace.start( false );
    
    self.set_active_room_class( );

    
    application.workspace.addOverlay = false;
    
    /***HERE ADD THE SEMIPUBLIC RESTRICTIONS ***/
    if (type != 'execute')
    {
        application.workspace.no_edit = false;
    }
    else
    {
        if( self.session_leader)
        {
            application.workspace.no_edit = false;
        }
        else
        {
            application.workspace.no_edit = true;
        }
    }
}

Room_Container.prototype.__sacar_create_room_from_other = function( data )
{
    var room_options =
    {
        id: data.new_room_id,
        room_type: data.room_type,
        collaborative: data.room_collaborative
    }
    
    var room = new Room( room_options );
    
    application.room_containers[data.room_type].rooms[room.id] = room;
    
}

Room_Container.prototype.delete_room = function( )
{   
    var self = this;
	var room_to_delete_id = application.get_active_room( ).id;
	var room_to_delete_type = application.get_active_room( ).type;
	var room_to_delete_collaborative = application.get_active_room( ).collaborative;
	
	self.__sacar_remove_room_div( room_to_delete_id );
	
	delete self.rooms[room_to_delete_id];
    
    self.set_active_first_room( );
    
    
    //PREPARE AND SEND MESSAGE
    var json = 
    {
        user_id: application.user_manager.get_user_id( ),
        room_id: room_to_delete_id,
        room_type: room_to_delete_type,
        room_collaborative: room_to_delete_collaborative,
        message_type: 'remove_room'
    }
    
    var json_text = $.toJSON( json );
	application.conection_manager.send_message('/mensaje', json_text);
}


Room_Container.prototype.__sacar_delete_room_from_other = function( data )
{   
    var self = this;
	var room_id = data.room_id;
	var room_type = data.room_type;
	
	self.__sacar_remove_room_div( room_id );
    
    delete self.rooms[room_id];
	
    if ( application.get_active_room( ).id == room_id )
    {
        self.set_active_first_room( );
    }
}

Room_Container.prototype.__sacar_remove_room_div = function( room_id )
{   
	var room_div = $( '#' + room_id );
	room_div.remove( );
}


Room_Container.prototype.restringir_acceso = function( )
{
    var self = this;
    var rooms = self.rooms;
    
    /*** CAMBIAR LISTENERS DE LOS ROOMS ***/
    $.each( rooms, function( index, room)
    {
        var room_div = $('#' + room.id );
        var img_div  = $('#' + room.id + '>img');
        room_div.unbind('click');
        
        room_div.click( function( )
        {
            alert('no puedes acceder a este tipo de room' );
        });
        
        /*** FALTA SACARLO DEL ROOM SI ES QUE ESTA ACTIVO ***/
        
        /*** CAMBIAR EL CSS DE LOS ROOMS ***/
        img_div.attr('src', '/images/icons/no_map.png');
        
    });
}

Room_Container.prototype.conceder_acceso = function( )
{
    var self = this;
    var rooms = self.rooms;

    
    /*** CAMBIAR LISTENERS DE LOS ROOMS ***/
    $.each( rooms, function( index, room)
    {
        var room_div = $('#' + room.id );
        
        room_div.unbind('click');
        
        room_div.click(function()
        {
            self.set_active_room(room.id);
        });
        
        /*** CAMBIAR EL CSS DE LOS ROOMS ***/
        room.update_map_url();
        room.update_map();
        
        
    });
}


Room_Container.prototype.__sacar_create_room_from_db = function( data )
{
    var self = this;
    var room_data =
    {
        id: data.id,
        room_type: data.room_type,
        collaborative: data.room_collaborative
    }
    
    var markers     = data.markers;
    var polylines   = data.polylines;
    var users       = data.users;
    var room  = new Room( room_data );
    
    
    $.each(markers, function(index, marker){
                room.place_marker( marker );
            });
            
    $.each(polylines, function(index, polyline){
                room.place_polyline( polyline );
            });
                   
    $.each(users, function(index, user){
                room.add_user( user );
            });    
    
    return room;
}



Room_Container.prototype.set_active_room_class = function( )
{
    var self                = this;
    var users_room_preview  = $('#usersRoomPreview');
    
    var room_options = $('#' + self.type + '_room_options');
    
    room_options.css('display', 'block');
    
    if (self.collaborative)
    {
        users_room_preview.css('display', 'block');
    }
    else
    {
        users_room_preview.css('display', 'none');
        application.screen_manager.remove_users( );
        if (application.workspace.isUsersRoomBeingShown())
		{
		  application.workspace.hideRoom('users');
		}
    }
    
    
    
    $.each( self.rooms, function( index, room )
    {
        var room_div = $('#' + room.id );
        
        room_div.css('border', 'solid 5px #000000');
    });
}

Room_Container.prototype.turn_into_collaborative = function( )
{
    var self = this;
    var session_id = application.session.id;
    var user_id = application.user_manager.get_user_id( );
    var room_type = self.name;
    var path = '/turn_rooms?session_id=' + session_id + '&from=personal&to=collaborative';
    path += '&room_type=' + room_type
    
    $.post(path);
    self.collaborative = true;
    
}

Room_Container.prototype.turn_into_personal = function ( )
{
    var self = this;
    var session_id = application.session.id;
    
    
    var path = '/turn_rooms?session_id=' + session_id + '&from=collaborative&to=personal';
    path += '&room_type=' + self.name; 
    
    $.post(path);
    
    self.collaborative = false;
    
    
}
