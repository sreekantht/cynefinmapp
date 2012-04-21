function User_Manager( user_id )
{
	var self = this;
	self.user_id = user_id;
	self.session_leader = false;
}

User_Manager.prototype.send_editing = function( editing )
{
    var self = this;
	
	var json = 
	{
	    user_id: application.user_manager.get_user_id( ),
	    room_id: application.get_active_room( ).id,
	    room_type: application.get_active_room( ).type,
        room_collaborative: application.get_active_room( ).collaborative,
	    message_type: 'user_editing'
	}
	
	if (editing)
	{
	   json['value'] = true;
	}
	else
	{
	    json['value'] = false;
	}
	
	var json_text = $.toJSON(json);
	
	application.conection_manager.send_message( '/mensaje', json_text );

}

User_Manager.prototype.set_editing = function( data )
{
    var self = this;
    var divUserEditing = $( '#awarenessEditando' );
    var user_div = $( '#user_' + data.userId + '>.roommateIconBase' );
    
    if (data.value)
    {
        user_div.removeClass( 'roommateIconAdd' );
        user_div.addClass( 'roommate_editing' );
    }
    else
    {
        user_div.removeClass( 'roommate_editing' );
        user_div.addClass( 'roommateIconAdd' );
    }
}

User_Manager.prototype.get_user_id = function( )
{
    var self = this;
    return self.user_id;
}

User_Manager.prototype.set_user_id = function( user_id )
{
    var self = this;
    self.user_id = user_id;
    return true;
}

User_Manager.prototype.set_session_leader = function( session_leader )
{
    var self = this;
    if ( session_leader )
    {
        self.session_leader = true;
    }
    else
    {
        self.session_leader = false;
    }
}

User_Manager.prototype.get_session_leader = function( )
{
    var self = this;
    return self.session_leader;
}

User_Manager.prototype.is_using_chat = function( )
{
    var users = application.get_active_room( ).user_markers;
    var using_chat = false;
    
    $.each(users, function(index, user){
        if (user.chat_infowindow)
        {
            if (user.chat_infowindow.opened)
            {
                using_chat = true;
            }
        }
    });
    
    return using_chat;
    
}