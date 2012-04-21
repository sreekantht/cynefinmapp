function Screen_Manager( )
{
}

Screen_Manager.prototype.add_user = function( data )
{
    var div = document.createElement('div');
	div.className = "roommateF";
	div.id = 'user_' + data.user_id;
	
	//ADD OTHER PARTS OF THE DIV
	var icon = document.createElement('div');
	icon.className = 'roommateIconBase roommateIconAdd';
	$(icon).appendTo(div);
	
	var user_name = document.createElement('span');
	user_name.className = 'roommateName';
	
	$(user_name).append(data.user_id);
	$(user_name).appendTo(div);
	
	$(div).appendTo('#divRoommateContainerF');
	
	
	//WHEN CLICKED ON USER CENTER THE MAP ON HIM
	$(div).click(function()
	{
        var self = this;
        var id = $(self).attr('id');
        var string_length = id.length;
        var user = id.substring(5, string_length);
        
        var data = {
            map_center: [application.get_active_room( ).user_markers[user].position.lat(), application.get_active_room( ).user_markers[user].position.lng()],
            map_zoom: application.workspace.map.get_zoom( )
            };
        
        //CENTER THE MAP ON THE USER
        
        application.workspace.map.move_to(data);
        
	});
}

Screen_Manager.prototype.remove_user = function( data )
{
    var user_div = $('#user_' + data.user_id);
    user_div.remove();
}

Screen_Manager.prototype.remove_users = function( data )
{
    var roomates_div = $('.roommateF');
    roomates_div.remove();
}

