function Session( session_id )
{
	var self = this;
	self.id = session_id;
	self.escenario = 'complex';
}

Session.prototype.start = function( )
{
    var self = this;
    
    $.each( application.room_containers, function( index, room_container )
    {
        room_container.create_room( );
    });
    
    application.set_active_first_room( );
    
    self.cambiar_escenario( self.escenario );
    $('#scenario > select').val( self.escenario );
    
    application.user_manager.set_session_leader( true );
    
    setTimeout( function( )
    {
        application.geo.get_initial_position( { add_marker: false } );
    }, 1000 );
}

Session.prototype.load = function( )
{
    var self = this;
    
    var url = '/abrir_sesion';
    url += '?session_id=' + self.id
    url += '&user_id=' + application.user_manager.get_user_id( );
    $.post( url,
            function( data )
            {
                var response = JSON.parse( data );
                self.escenario = response.escenario;
                self.cambiar_escenario( self.escenario );
                $('#scenario > select').val( self.escenario );
                
                if ( response.session_leader )
                {
                    application.user_manager.set_session_leader( true );
                    
                    /*** to_do FUNCIONALIZARLO ***/
                    $('#scenario').css('display', 'block');
                }
                else
                {
                    application.user_manager.set_session_leader( false );
                }
                
            }
    );
    
    $('#sessions').css('display', 'none');
    
    application.get_existing_rooms( self.id );
    
    setTimeout( function( )
    {
        application.geo.get_initial_position( { add_marker: false }  );
    }, 1000 );
    
    
}

Session.prototype.get_session_id = function( )
{
    var self = this;
    return self.id;
}

Session.prototype.cambiar_escenario = function( escenario )
{
    var self = this;
    
    switch( escenario )
    {
        case 'known':
            application.room_containers.ideas.restringir_acceso( );
            application.room_containers.explain.restringir_acceso( );
            application.room_containers.decide.conceder_acceso( );
            application.room_containers.execute.conceder_acceso( );
            
            if ( application.user_manager.get_session_leader( ) )
            {
                application.room_containers.decide.turn_into_personal( );
            }
                
            
            if ( application.get_active_room( ) )
            {
                if ( application.get_active_room( ).type != 'decide' && application.get_active_room( ).type != 'execute' )
                {
                    application.room_containers.decide.set_active_first_room( );
                }
            }
            else
            {
                application.room_containers.decide.set_active_first_room( );
            }
            
            break
        case 'knownable':
            application.room_containers.ideas.restringir_acceso( );
            application.room_containers.explain.restringir_acceso( );
            application.room_containers.decide.conceder_acceso( );
            application.room_containers.execute.conceder_acceso( );
            
            //application.room_containers.decide.turn_into_collaborative( );
            
            if ( application.get_active_room( ) )
            {
                if ( application.get_active_room( ).type != 'decide' && application.get_active_room( ).type != 'execute' )
                {
                    application.room_containers.decide.set_active_first_room( );
                }
            }
            else
            {
                application.room_containers.decide.set_active_first_room( );
            }
            break
        case 'complex':
            application.room_containers.ideas.conceder_acceso( );
            application.room_containers.explain.conceder_acceso( );
            application.room_containers.decide.conceder_acceso( );
            application.room_containers.execute.restringir_acceso( );
            if ( application.get_active_room( ) )
            {
                if ( application.get_active_room( ).type == 'execute' )
                {
                    application.room_containers.ideas.set_active_first_room( );
                }
            }
            else
            {
                application.room_containers.ideas.set_active_first_room( );
                
                /*
                setTimeout( function( )
                {
                    application.geo.get_initial_position( );
                }, 500);
                */
            }
            break
        case 'chaos':
            application.room_containers.ideas.restringir_acceso( );
            application.room_containers.explain.restringir_acceso( );
            application.room_containers.decide.restringir_acceso( );
            application.room_containers.execute.conceder_acceso( );
            
            if ( application.get_active_room( ) )
            {
                if ( application.get_active_room( ).type != 'execute')
                {
                    application.room_containers.execute.set_active_first_room( );
                }
            }
            else
            {
                application.room_containers.execute.set_active_first_room( );
            }
            break
    }
    
    if ( application.user_manager.get_session_leader( ) )
    {
        var json = 
        {
            user_id: application.user_manager.get_user_id( ),
            room_id: application.get_active_room( ).id,
            room_type: application.get_active_room( ).type,
            room_collaborative: application.get_active_room( ).collaborative,
            message_type: 'cambiar_escenario',
            escenario: escenario,
            session_id: self.id
        }
        
        var json_text = $.toJSON(json);
	    application.conection_manager.send_message('/mensaje', json_text);
    }
    
}