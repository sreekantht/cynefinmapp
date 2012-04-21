function Application_Manager( data )
{
	var self = this;
	
	self.conection_manager = new Conection_Manager( );
	self.session = new Session( data.session_id );
	
	self.user_manager = new User_Manager( data.user_id );
	self.geo = new Geo( );
	
	self.workspace = new Workspace( );
	self.workspace.add_listener( );
	
	self.screen_manager = new Screen_Manager( );
	
	
	self.room_containers = 
	{
	    'ideas': new Room_Container( 'ideas', 1, collaborative = false ),
	    'explain': new Room_Container( 'explain', 2, collaborative = true ),
	    'decide': new Room_Container( 'decide', 3, collaborative = true ),
	    'execute': new Room_Container( 'execute', 4,  collaborative = true )
    }
    
    self.active_room;
    self.new_session = data.new_session;
    
    self.clipboard =
	{
	    polylines: {},
	    markers:   {}
	}
}

Application_Manager.prototype.start = function( )
{   
    self = this;
    if (self.new_session)
    {
        self.session.start( );
    }
    else
    {
        self.session.load( self.session.id );
    }
    
    self.conection_manager.start( );
}

Application_Manager.prototype.set_active_first_room = function( )
{
    var self = this;
    self.room_containers.ideas.set_active_first_room( );
}

Application_Manager.prototype.get_active_room = function( )
{
    var self = this;
    return self.active_room;
}

Application_Manager.prototype.copy_overlays = function( )
{
    var self = this;
    
    var room = self.get_active_room( );
    
    delete self.clipboard;
    
    self.clipboard =
	{
	    polylines: {},
	    markers:   {}
	}
    
    if (application.workspace.addOverlay)
    {
        $.each(application.workspace.overlaysEditing, function(key, overlay) {
	        if (overlay._type == 'marker')
	        {
	            self.clipboard.markers[key] = room.markers[key];
	        }
	        else
	        {
	            self.clipboard.polylines[key] = room.polylines[key];
	        }
	          
        });
    }
    else
    {
        self.clipboard.markers = room.markers;
        self.clipboard.polylines = room.polylines;
    }
    
}

Application_Manager.prototype.get_existing_rooms = function( session_id )
{
    //alert(path);
    var self = this;
    
    
    path = '/getrooms?session_id=' + session_id + '&user_id=' + self.user_manager.get_user_id( );
    
    $.post(path, 
    function(data)
    {
        var response = JSON.parse(data);
        var no_personal = true;
        console.dir(response);
        
        
        
        $.each(response, function(index, room)
        {
            
            self.room_containers[room.room_type].rooms[room.id] = self.room_containers[room.room_type].__sacar_create_room_from_db( room );
            if ( room.room_type == 'ideas' )
            {
                no_personal = false;
            }
            
        });
        
        setTimeout( function( )
        {
            if ( self.session.escenario )
            {
                if ( no_personal)
                {
                    self.room_containers.ideas.create_room( );
                }
               self.session.cambiar_escenario( self.session.escenario );               
            }
            
            else
            {
                /*** to_do ACTIVAR ***/
                //self.session.cambiar_escenario( 'complex' );
            }
        }, 2000);
    });
    
}

Application_Manager.prototype.unset_active_room = function( except_type )
{
    var self = this;
    var room_options = $('.room_options');
    
    $.each(self.room_containers, function( room_type_name, room_type ){
        $.each(room_type.rooms, function( room_id, room ){
            
            var room_div = $('#' + room.id);
            var map_div  = $('#' + room.id + '>img');
            
            room_div.css('border', 'solid 5px #cdcdcd');
            map_div.css('opacity', room.NOT_SELECTED); 
            
        });
    });
    
    //PREPARE MESSAGE
    
    if ( application.get_active_room( ) )
    {
        var json = {
            user_id: application.user_manager.get_user_id( ),
            session_id: application.session.get_session_id( ),
            room_id: application.get_active_room( ).id,
            room_collaborative: application.get_active_room( ).collaborative,
            room_type: application.get_active_room( ).type,
            message_type: 'user_disconected'
        }
        
        var json_text = $.toJSON(json);
        
        application.conection_manager.send_message('/mensaje', json_text);
    }
    
    //HIDE THE MAPS OPTIONS MENU
    room_options.css('display', 'none');

    //ver como filtar con jquery
    $('#' + except_type + '_room_options').css('display', 'block');
    
    //SHOW THE MAPS OPTIONS IF THERE ARE NO ROOMS
    self.check_room_options();
}

Application_Manager.prototype.check_room_options = function( )
{
    var self = this;
    
    $.each( self.room_containers, function( key_name, room_type)
    {
        var mini_rooms = $('.mini_room').filter( function( )
        {
            return $(this).attr('type') == key_name;
        });
        
        if ( mini_rooms.length == 0 )
        {
            $('#' + key_name + '_room_options').css('display', 'block'); 
        }
    });
}

