$(document).ready(function()
{
    var window_width = $(window).width();
    	
	var _preventDefault = function(evt) { evt.preventDefault(); };
    $("#wrapper").bind("dragstart", _preventDefault).bind("selectstart", _preventDefault);
    $('#searchBoxDiv').css('width', '100%');
    
    $('#boton_crear_sesion').click( function()
    {
        var id_sesion = $('#id_sesion').val();
        crear_sesion(id_sesion);
    });
    
     $('.abrir_sesion').click( function()
    {
        var id_sesion = $(this).attr('id');
        //alert(id_sesion);
        abrir_sesion(id_sesion);
    });
    
    if ( localStorage.getItem('user_id') )
    {
        user_id = localStorage.getItem('user_id');
        $('#log').append(user_id);
        $('#log').append(' <a id=log_out href="#"> log out </a>');
        $('#log_out').click( function() 
        {
            user_id = ask_log_in( )
        });
    }
    else
    {
        user_id = ask_log_in( );
    }
	
	
	

});

ask_log_in = function( )
{
    $('#log').empty( );
    var user_id = prompt('Ingresa tu nombre de usuario', 'User');
    localStorage.setItem('user_id', user_id);
    $('#log').append('user id: ');
    $('#log').append(user_id);
    $('#log').append(' <a id=log_out href="#"> log out </a>');
    $('#log_out').click( function() 
        {
            user_id = ask_log_in( );
        });
    
    return user_id;
    
}

$(window).unload( function () { alert("Bye now!"); } );

//function close_app()
//{
//    aler('close app');
//}

getUserId = function()
{
    return clientManager.clientId;
}

get_session_id = function( )
{
    return clientManager.session_id;
}

getActiveRoom = function()
{
    return clientManager.selectedRoom;
}

getClientPosition = function()
{
    return [clientManager.clientPosition.Na, clientManager.clientPosition.Oa];
}

export_image = function(){
    application.workspace.map.gmap.streetView.setVisible(false);
    
    var image_url = application.workspace.last_canvas.toDataURL('image/png');
    
    //window.open(workspace.last_canvas.toDataURL(),"canvasImage","left=0,top=0,width=" + 150 + ",height=" + 100 +",toolbar=0,resizable=0");
    
    //$('#' + workspace.last_canvas.id).css('z-index', '-1');
    application.workspace.map.add_streetview_draw( image_url, application.workspace.last_canvas.id );
    
    //workspace.activate_streetview_edit();
    
    
    //window.open(image_url);
}

createNewRoom = function(type)
{
    data =
    {
        id: Utils.guid(),
        type: type
    }
    
    var staticRoom = new StaticRoom(data);
    return staticRoom;
    
    
}

crear_sesion = function( session_id )
{
    var url = '/crear_sesion';
    url += '?session_id=' + session_id;
    url += '&user_id=' + user_id;
    
    var application_options = 
    {
        user_id: user_id,
        session_id: session_id,
        new_session: true
    };
    
    application = new Application_Manager( application_options );
    
    $.post(url,
    function( )
    {
        application.start( );
    });
    
    $('#sessions').css('display', 'none');
    $('#scenario').css('display', 'block');
    
    
    

	
    
    
}

abrir_sesion = function( session_id )
{    
    var application_options = 
    {
        user_id: user_id,
        session_id: session_id,
        new_session: false
    }
    
    application = new Application_Manager( application_options );
    application.start( );
    
}


