function Workspace()
{
    var self             = this;
    //self.room            = room;
    //self.client          = self.room.client;
    self.mode            = 'panning';
    //self.canvas          = new Canvas(self);
    self.listColor       = false;
    self.listSketch      = false;
    self.map;
    self.drawingSketch  = false;
    //self.showRooms       = false;
    //self.showRoommmate   = false;
    self.gOverlayEditing;
    self.overlaysEditing = {};
    self.canvas = {};
    self.overlayEditing;
    self._showingOverlayOptionsId;
    self.addOverlay = false;
    
    self.is_streetview_list_being_shown = {
        thickness: false,
        color: false,
        tool: true
        };
    
    
    
    
    //STORES IF THE LISTS ARE BEIGN SHOWN
    self._showingSketchColorList         = false;
    self._showingSketchThicknessList     = false;
    self._showingZoomList                = false;
    self._showingGetCurrentPositionList  = false;
    self._showingToolList                = false;
    self._showingMapsRoom                = false;
    self._showingUsersRoom               = false;
    
    //METHODS TO GET STATES
    self.isSketchColorListBeingShown;
    self.isSketchThicknessListBeignShown;
    self.isZoomListBeignShown;
    self.isGetCurrentPositionListBeignShown;
    self.isToolListBeingShown;
    self.isMapsRoomBeingShown;
    self.isUsersRoomBeingShown;
    
    //STORES THE MODE
    self._sketchColor            = 'blue';   // 'blue', 'red', 'green'
    self._sketchColorHTML        = '#0000ff';// '#0000ff', '#ff0000', '#00ff00'
    self._sketchThickness        = 'medium'; // 'thick', 'medium', 'thin'
    self._sketchThicknessNumber  = 5;        // 2, 5, 10
    self._selectedTool           = 'move';   // 'move', 'draw', 'marker'
    
    //STORES THE LISTS AVAILABLE
    self.toolListLeft           = ['tool', 'sketchColor', 'sketchColor']; 
    self.toolListRight          = ['rooms', 'users'];
    
    //MORE METHODS
    self._showToolList;
    self.getSelectedTool;
    self.getSketchColor;
}

/*
Workspace.prototype.start = function()
{
	var self = this;

	self.map = new Map({
		//dom: self.client.getWorkspaceMapDom(),
		dom: document.getElementById("map"),
		jqueryDom: $('#map'),
		controllable: true,
		//position: self.room.currentPosition,
		showCredits: false
	});
	
	self.map.addListener();

//	self.map.onMove(function(position) {
//		self.room.moveTo(position, 
//			{ userMove: self.map.userMove
//		});
//	});

	self.events();
	
//	_.each(self.room.overlays, function(overlay) {
//		self.addOverlay(overlay);
//	});
}
*/

Workspace.prototype.start = function( )
{
	var self = this;
	
	self.overlaysEditing = {};
	
	self.map = new Map({
		dom: document.getElementById("map"),
		jqueryDom: $('#map'),
		controllable: true,
		showCredits: false
	});
	
	self.map.add_listener();
	
	self.changeTool('moveTool');
	self.showList('tool');
	self.hideList('tool');
	self._private_place_polylines_from_room( );
	self._private_place_markers_from_room( );
	
	if (application.active_room.collaborative)
    {
        self._private_place_users_from_room( );
    }
	self._private_set_map_position_from_room( );
	
	//self.add_listener( );
	
	self.hideOverlayOptions();
	
}

Workspace.prototype.add_listener = function( no_edition )
{
	var self = this;
	
	
	//MANAGES TOOL SETTING
	$('#selectedToolPreview').click(function()
	{
	   if (self.isToolListBeingShown())
	   {
	       self.hideList('tool');
	   }
	   else
	   {
	       self.showList('tool');
	   }
	});
	
	/*** EDITION TOOLS **/
	$('#listTool li').click(function(e)
	{
	    if (self.no_edit)
	    {
	        alert('usted no puede editar este mapa');
	    }
        else
        {
		    self.changeTool(e.target.id);
		}
	});
	
	
	//MANAGES COLOR SETTING
    $('#selectedSketchColorPreview').click(function()
	{
	   if (self.isSketchColorListBeingShown())
	   {
	       self.hideList('sketchColor');
	   }
	   else
	   {
	       self.showList('sketchColor');
	   }
	});
	$('#listSketchColor li').click(function(e)
	{
		self.changeSketchColor(e.target.id);
	});
	
	
	//MANAGES THICKNESS SETTING
	$('#selectedSketchThicknessPreview').click(function()
	{
	   if (self.isSketchThicknessListBeingShown())
	   {
	       self.hideList('sketchThickness');
	   }
	   else
	   {
	       self.showList('sketchThickness');
	   }
	});
	
	//MANAGES THE ZOOM SETTING
	$('#zoomPreview').click(function()
	{
	   if (self.isZoomListBeingShown())
	   {
	       self.hideList('zoom');
	   }
	   else
	   {
	       self.showList('zoom');
	   }
	});
	
	//MANAGES GET CURRENT POSITION SETTING
	$('#getCurrentPositionPreview').click(function()
	{
	   if (self.isGetCurrentPositionListBeingShown())
	   {
	       self.hideList('getCurrentPosition');
	   }
	   else
	   {
	       self.showList('getCurrentPosition');
	   }
	});
	
	$('#listSketchThickness li').click(function(e)
	{
		self.changeSketchThickness(e.target.id);
	});
	
	//GET CURRENT POSITION
	$('#getCurrentPosition').click(function(e)
	{
		application.geo.get_user_position( { add_marker: true } );
	});
	
	//MANAGES ZOOM
	$('#zoomIn').click(function(e)
	{
		self.changeZoom('zoomIn');
	});
	$('#zoomOut').click(function(e)
	{
		self.changeZoom('zoomOut');
	});
	
	//MANAGES MAPS EVENTS
	$('#mapsRoomPreview').click(function()
	{
	   if ( self.isMapsRoomBeingShown())
	   {
	       self.hideRoom('maps');
	   }
	   else
	   {
	       self.showRoom('maps');
	   }
	});

	
    //MANAGES USERS EVENTS
    $('#usersRoomPreview').click(function()
	{
		if (self.isUsersRoomBeingShown())
		{
		  self.hideRoom('users');
		}
		else
		{
		  self.showRoom('users');
		}
	});
	
	$('#scenario').change( function( )
	{
	    var new_scenario = $("#scenario option:selected").text( );
	    //alert( new_scenario );
	    
	    if ( application.session.escenario == 'known' )
	    {
	        application.room_containers.decide.turn_into_collaborative( );
	    }
	    application.session.cambiar_escenario( new_scenario );
	    application.session.escenario = new_scenario;
		
	});
	
	
	
	
    $('#deleteOverlay').click(function()
	{
	    if (self.addOverlay)
	    {
	        self.overlaysEditing[self.overlayEditing.id] = self.overlayEditing;
	      //  $().each(self.overlaysEditing, function(index, overlay)
	       // {
	        //    
	        //});
	        
	        _.each(self.overlaysEditing, function(overlay) {
	            overlay.delete();
	           // alert('xapalapaxala');
              });
	    }
	    else
	    {
	        self.overlayEditing.delete();
	    }
	    self.addOverlay = false;
	    self.hideOverlayOptions();
	    self.overlaysEditing = {};
	    $('#infowindowOverlay').css('display','block');
	    $('#deselectAllOverlays').css('display','none');
	    
	});
	 $('#selectOtherOverlay').click(function()
	{
	    self.overlaysEditing[self.overlayEditing.id] = self.overlayEditing;
	    self.addOverlay = true;
	    $('#infowindowOverlay').css('display','none');
	    $('#deselectAllOverlays').css('display','block');
	    self.hideOverlayOptions();
	    
	});
	
	 $('#deselectAllOverlays').click(function()
	{
	    self.addOverlay = false;
	    self.hideOverlayOptions();
	    self.overlaysEditing = {};
	    
	    $('#infowindowOverlay').css('display','block');
	    $('#deselectAllOverlays').css('display','none');
	    //$('#overlayOptions').css('display', 'block');
	    //self.showOverlayOptions();
	    
	});
	 $('#duplicateOverlay').click(function()
	{
	    if (self.addOverlay)
	    {
	        self.overlaysEditing[self.overlayEditing.id] = self.overlayEditing;
	        
	        _.each(self.overlaysEditing, function(overlay) {
	            self.map.copyPolyline(overlay);
	           // alert('xapalapaxala');
              });
	    }
	    else
	    {
	        self.map.copyPolyline(self.overlayEditing);
	    }
	    self.addOverlay = false;
	    self.hideOverlayOptions();
	    self.overlaysEditing = {};
	    $('#infowindowOverlay').css('display','block');
	    $('#deselectAllOverlays').css('display','none');
	    
	});
	//DRAG POLYLINE
	$('#moveOverlay').click(function(event)
	{
	    self.overlayEditing.startDrag(event);
	});
	//END DRAG POLYLINE
	$('#moveUp').mouseover(function(event)
	{
	    self.overlayEditing.move('up');
	});
	$('#moveLeft').mouseover(function(event)
	{
	    self.overlayEditing.move('left');
	});
	$('#moveRight').mouseover(function(event)
	{
	    self.overlayEditing.move('right');
	});
	$('#moveDown').mouseover(function(event)
	{
	    self.overlayEditing.move('down');
	});
	
	$('#infowindowOverlay').click(function(event)
	{
       //IF IT HAS AN INFOWINDOW, JUST OPEN IT
        if ( self.overlayEditing.has_infowindow() )
        {
            self.overlayEditing.infowindow.ginfowindow.open();
        }
        else
        {
            self.overlayEditing.addInfowindow(event);
        }
        
        self.hideOverlayOptions();
	});
	
	$('#map').scroll(function()
	{
	   self.map.userZoomChange = true;
	   self.map.changeUserZoomChange();
	});
	
	//MANAGES THE OPTIONS OF THE STREET VIEW
	$('#select_image').click(function()
	{
	   application.workspace.map.add_streetview_image( );
	   application.workspace.activate_streetview_edit( );
	});
	
	$('#save_canvas').click(function()
	{
	   export_image();
	});
	
	$('#list_streetview_edit li').click(function(e)
	{
        self.change_streetview_tool(e.target.id);
	});
	//CANVAS COLOR
	$('#list_streetview_color li').click(function(e)
	{
        self.change_streetview_sketch_color(e.target.id);
	});
	$('#list_streetview_line_thickness li').click(function(e)
	{
        self.change_streetview_sketch_thickness(e.target.id);
	});
	$('#selected_streetview_sketch_thickness').click(function( )
	{
	    if (!self.is_streetview_list_being_shown['thickness'])
	    {
            self.show_streetview_list('thickness');
        }
        else
        {
            self.hide_streetview_list('thickness');
        }
	});
	$('#selected_streetview_sketch_color').click(function( )
	{
        if (!self.is_streetview_list_being_shown['color'])
	    {
            self.show_streetview_list('color');
        }
        else
        {
            self.hide_streetview_list('color');
        }
	});
	
	$('#selected_streetview_tool').click(function( )
	{
        if (!self.is_streetview_list_being_shown['tool'])
	    {
            self.show_streetview_list('tool');
        }
        else
        {
            self.hide_streetview_list('tool');
        }
	});
}

Workspace.prototype.show_streetview_list = function( list_name )
{
	var self = this;
	
	switch( list_name)
	{
	    case 'thickness':
	        $('#list_streetview_line_thickness').css('display', 'block');
	        
	        self.hide_streetview_list( 'color' );
	        self.hide_streetview_list( 'tool' );
            break
        
        case 'color':
            $('#list_streetview_color').css('display', 'block');
            self.hide_streetview_list( 'thickness' );
            self.hide_streetview_list( 'tool' );
            break;      
        
         case 'tool':
            $('#list_streetview_edit').css('display', 'block');
            self.hide_streetview_list( 'thickness' );
            self.hide_streetview_list( 'color' );
            break;      
	}
	
	self.is_streetview_list_being_shown[list_name] = true;
	
}


Workspace.prototype.hide_streetview_list = function( list_name )
{
	var self = this;
	
	switch( list_name)
	{
	    case 'thickness':
	        $('#list_streetview_line_thickness').css('display', 'none');
            break
        
        case 'color':
            $('#list_streetview_color').css('display', 'none');
            break;
        case 'tool':
            $('#list_streetview_edit').css('display', 'none');
            break;       
	}
	
	self.is_streetview_list_being_shown[list_name] = false;
}

Workspace.prototype.show_streetview_tool_options = function( tool_name )
{
	var self = this;
	
	switch( tool_name)
	{
	    case 'draw':
	        $('#selected_streetview_sketch_color').css('display', 'block');
	        $('#selected_streetview_sketch_thickness').css('display', 'block');
	        
	        $('#selected_streetview_eraser_thickness').css('display', 'none');
	        
	        $('#save_canvas').css('display', 'none');
            break
        
        case 'eraser':
            $('#selected_streetview_sketch_color').css('display', 'none');
	        $('#selected_streetview_sketch_thickness').css('display', 'none');
	        
	        $('#selected_streetview_eraser_thickness').css('display', 'block');
	        
	        $('#save_canvas').css('display', 'none');
            break;
        case 'save_canvas':
            $('#selected_streetview_sketch_color').css('display', 'none');
	        $('#selected_streetview_sketch_thickness').css('display', 'none');
	        
	        $('#selected_streetview_eraser_thickness').css('display', 'none');
	        
	        $('#save_canvas').css('display', 'block');
            break;       
	}
}

Workspace.prototype.change_streetview_sketch_color = function(color_id)
{
	var self = this;
	var context = self.last_canvas.getContext('2d');

	switch(color_id) {
		case 'streetview_line_color_blue':
			context.strokeStyle = '#0000FF';
			    //CHANGE ICON
			break;
		case 'streetview_line_color_red':
			context.strokeStyle = '#FF0000';
			break;
		case 'streetview_line_color_green':
			context.strokeStyle = '#00FF00';
			break;
	
	return false;
	}
}

Workspace.prototype.change_streetview_tool = function( tool_name )
{
	var self = this;
	var context = self.last_canvas.getContext('2d');

	switch(tool_name) {
		case 'draw':
            context.globalCompositeOperation = "destination-over";
            //change_background
            
            var imagen = new Image();
            
            var margin_left = workspace.last_canvas_image['margin_left'];
            var margin_top = workspace.last_canvas_image['margin_top'];
            var image_width = workspace.last_canvas_image['image_width'];
            var image_height = workspace.last_canvas_image['image_height'];
            var image_url = workspace.last_canvas_image['url'];
            
            
            
            imagen.addEventListener('load', function(){
                context.drawImage(imagen,margin_left,margin_top, image_width, image_height);
                context.globalCompositeOperation = "source-over"
            }, false);
            
            imagen.src = image_url;
            
			context.lineWidth = 3;
			context.colorStroke = '#FF0000';
			break;
		case 'eraser':
            context.globalCompositeOperation = "destination-out";
		    context.colorStroke = 'rgba(0,0,0,0)';
			context.lineWidth = 5;
			break;
		case 'save_canvas':
			context.lineWidth = 8;
			break;
	
	return false;
	}
}

Workspace.prototype.change_streetview_sketch_thickness = function(color_id)
{
	var self = this;
	var context = self.last_canvas.getContext('2d');

	switch(color_id) {
		case 'streetview_line_thickness_thin':
			context.lineWidth = 3;
			    //CHANGE ICON
			break;
		case 'streetview_line_thickness_medium':
			context.lineWidth = 5;
			break;
		case 'streetview_line_thickness_thick':
			context.lineWidth = 8;
			break;
	
	return false;
	}
}

Workspace.prototype._switchMode= function(mode)
{
	var self = this;
	self.mode = mode;

	switch(self.mode) {
		case 'move':
			self.map.unlock();
			self.map.remove_listeners();
			break;
		case 'draw':
			self.map.lock();
			self.map.remove_listeners();
			self.map.add_polyline_listener();
			break;
		case 'marker':
			self.map.lock();
			self.map.remove_listeners();
			self.map.addMarkerListener();
			break;
	
	return false;
	}
}

Workspace.prototype.showOverlayOptions= function(position, id)
{
	var self = this;
	//alert(id);
	overlay = application.workspace.map.polylines[id];
	if (!overlay)
	{
	   overlay = self.map.markers[id];
	}
	var overlayOptions = $('#overlayOptions');
	var leftPos = position.x -80;
	var topPos  = position.y - 50;
	
	//alert ('izquierda '+ leftPos + '; top ' + topPos);
	
	overlayOptions.css('left', leftPos + 'px');
	overlayOptions.css('top',  topPos + 'px');
	overlayOptions.css('display', 'block');
	
	if (overlay.gpolyline)
	{
	   overlay.gpolyline.setOptions({strokeOpacity: '0.5'});
	}
	if (overlay.gmarker)
	{
	    overlay.gmarker.setIcon('/img_marker_selected.png');
	}
	if (self.overlayEditing)
	{
	   if (self.overlayEditing.gpolyline && !self.addOverlay && self.overlayEditing.id != overlay.id)
	   {
	       self.overlayEditing.gpolyline.setOptions({strokeOpacity: '1'});
	   }
	   if (self.overlayEditing.gmarker && !self.addOverlay && self.overlayEditing.id != overlay.id)
	    {
	        self.overlayEditing.gmarker.setIcon('/img_marker_default.png');
	    }
	}
	self.overlayEditing = overlay;
	self._showingOverlayOptionsId = id;
	//self.overlayEditing.gpolyline.strokeColor = '#ffffff';
	
}

Workspace.prototype.hideOverlayOptions= function()
{
	var self = this;
	var overlayOptions = $('#overlayOptions');
	
	if (self.overlayEditing)
	{
	   if (self.overlayEditing.gpolyline && !self.addOverlay)
	   {
	       self.overlayEditing.gpolyline.setOptions({strokeOpacity: '1'});
	       
	       
	   }
	   
	   if ( self.overlayEditing.gmarker && !self.addOverlay)
	   {
	        self.overlayEditing.gmarker.setIcon('/img_marker_default.png');
	   }
	   
	}
	
	if ( !self.addOverlay)
	{
	
	_.each(self.overlaysEditing, function(overlay) {
	            if (overlay.gpolyline)
	            {
	                overlay.gpolyline.setOptions({strokeOpacity:'1'});
	            }
	            if (overlay.gmarker)
	            {
	                overlay.gmarker.setIcon('/img_marker_default.png');
	            }
	                
              });
              }
	
	overlayOptions.css('display', 'none');
	self._showingOverlayOptionsId = '';
}



Workspace.prototype.isSketchColorListBeingShown = function()
{
    var self = this;
    
    return self._showingSketchColorList;
}

Workspace.prototype.isSketchThicknessListBeingShown = function()
{
    var self = this;
    
    return self._showingSketchThicknessList;
}

Workspace.prototype.isToolListBeingShown = function()
{
    var self = this;
    
    return self._showingToolList;
}

Workspace.prototype.isZoomListBeingShown = function()
{
    var self = this;
    
    return self._showingZoomList;
}

Workspace.prototype.isGetCurrentPositionListBeingShown = function()
{
    var self = this;
    
    return self._showingGetCurrentPositionList;
}




Workspace.prototype.isMapsRoomBeingShown = function()
{
    var self = this;
    
    return self._showingMapsRoom;
}

Workspace.prototype.isUsersRoomBeingShown = function()
{
    var self = this;
    
    return self._showingUsersRoom;
}

Workspace.prototype.isUsersRoomBeingShown = function()
{
    var self = this;
    
    return self._showingUsersRoom;
}



Workspace.prototype.getSelectedTool= function()
{
    var self = this;
    
    return self._selectedTool;
}

Workspace.prototype.getSketchColor = function()
{
    var self = this;
    
    return self._sketchColor;
}

Workspace.prototype.getSketchThickness = function()
{
    var self = this;
    
    return self._sketchThickness;
}

Workspace.prototype.activate_streetview_select = function()
{
    var self = this;
    
    //HIDE THE NORMAL OPTIONS
    $('#toolbarLeft').css('display','none');
    $('#toolbarRight').css('display','none');
    $('#wrapper').css('top','0px');
    
    $('#list_streetview_edit').css('display', 'none');
    $('#list_streetview_select').css('display', 'block');
    
    //SHOW STREETVIEW OPTIONS
    $('#toolbar_streetview').css('display', 'block');
    $('#select_image').css('display', 'block');
    //$('#list_streetview_select').css('display', 'block');
    $('.preview_menu_streetview').css('display', 'block');
    

    // Display your street view visible UI
    
    $('#selected_streetview_sketch_color').css('display', 'none');
    $('#selected_streetview_sketch_thickness').css('display', 'none');
    
    $('#selected_streetview_eraser_thickness').css('display', 'none');
    
    $('#save_canvas').css('display', 'none');

}

Workspace.prototype.activate_streetview_edit = function()
{
    var self = this;
    
    //HIDE THE NORMAL OPTIONS
    $('#toolbarLeft').css('display','none');
    $('#toolbarRight').css('display','none');
    $('#wrapper').css('top','0px');
    
    //CHANGE TOOL PREVIEW
    //CAMBIAR AL LAPIZ
    
    //SHOW STREETVIEW OPTIONS
    $('#toolbar_streetview').css('display', 'block');
    $('#list_streetview_edit').css('display', 'block');

    $('#selected_streetview_sketch_color').css('display', 'block');
    $('#selected_streetview_sketch_thickness').css('display', 'block');
    $('#save_canvas').css('display', 'block');
    
    $('#select_image').css('display', 'none');
    $('#list_streetview_select').css('display', 'none');
    $('#selected_streetview_tool>img').attr('src', '/img_drawToolOpenPreview.png');



    // Display your street view visible UI
        
}

Workspace.prototype.deactivate_streetview_edit = function()
{
    var self = this;
    
    //alert('mapa normal');
    $('#toolbarLeft').css('display','block');
    $('#toolbarRight').css('display','block');
    $('#wrapper').css('top','26px');
    
     $('#toolbar_streetview').css('display', 'none');

    // Display your original UI
}

Workspace.prototype.showList = function(listId)
{
    var self = this;
    
    switch(listId)
    {
        case 'tool':
            //GET IF THE OTHER LIST ARE BEING SHOWN AND HIDES IT
            if (self.isSketchColorListBeingShown())
            {
                self.hideList('sketchColor');
            }
            
            if (self.isSketchThicknessListBeingShown())
            {
                self.hideList('sketchThickness');
            }
            if (self.isZoomListBeingShown())
            {
                self.hideList('zoom');
            }
            {
                self.hideList('getCurrentPosition');
            }
            self._showToolList();
            break;
        case 'sketchColor':
            //GET IF THE OTHER LIST ARE BEING SHOWN AND HIDES IT
            if (self.isToolListBeingShown())
            {
                self.hideList('tool');
            }
            
            if (self.isSketchThicknessListBeingShown())
            {
                self.hideList('sketchThickness');
            }
            if (self.isZoomListBeingShown())
            {
                self.hideList('zoom');
            }
            {
                self.hideList('getCurrentPosition');
            }
            
            self._showSketchColorList()
            break;
        case 'sketchThickness':
             //GET IF THE OTHER LIST ARE BEING SHOWN AND HIDES IT
            if (self.isToolListBeingShown())
            {
                self.hideList('tool');
            }
            
            if (self.isSketchColorListBeingShown())
            {
                self.hideList('sketchColor');
            }
            if (self.isZoomListBeingShown())
            {
                self.hideList('zoom');
            }
            {
                self.hideList('getCurrentPosition');
            }
            self._showSketchThicknessList()
            break;
        case 'zoom':
             //GET IF THE OTHER LIST ARE BEING SHOWN AND HIDES IT
            if (self.isToolListBeingShown())
            {
                self.hideList('tool');
            }
            
            if (self.isSketchThicknessListBeingShown())
            {
                self.hideList('sketchThickness');
            }
            
            if (self.isSketchColorListBeingShown())
            {
                self.hideList('sketchColor');
            }
            if (self.isGetCurrentPositionListBeingShown())
            {
                self.hideList('getCurrentPosition');
            }
            
            self._showZoomList()
            break;
        case 'getCurrentPosition':
             //GET IF THE OTHER LIST ARE BEING SHOWN AND HIDES IT
            if (self.isToolListBeingShown())
            {
                self.hideList('tool');
            }
            
            if (self.isSketchThicknessListBeingShown())
            {
                self.hideList('sketchThickness');
            }
            
            if (self.isSketchColorListBeingShown())
            {
                self.hideList('sketchColor');
            }
            if (self.isZoomListBeingShown())
            {
                self.hideList('zoom');
            }
            
            self._showGetCurrentPositionList()
            break;
    }
}

Workspace.prototype.hideList = function(listId)
{
    var self = this;
    
    switch(listId)
    {
        case 'tool':
            self._hideToolList();
            break;
        case 'sketchColor':
            self._hideSketchColorList();
            break;
        case 'sketchThickness':
            self._hideSketchThicknessList();
            break;
        case 'zoom':
            self._hideZoomList();
            break;
        case 'getCurrentPosition':
            self._hideGetCurrentPositionList();
            break;
    }
}

Workspace.prototype.showRoom = function(roomId)
{
    var self = this;
    
    switch(roomId)
    {
        case 'maps':
            //GET IF THE OTHER ROOM IS BEIGN SHOWN AND CLOSES IT
            //if (self.isUsersRoomBeingShown())
            //{
            //    self.hideRoom('users');
            //}
            
            self._showMapsRoom();
            break;
        case 'users':
            //GET IF THE OTHER ROOM IS BEIGN SHOWN AND CLOSES IT
            //if (self.isMapsRoomBeingShown())
            //{
            //    self.hideRoom('maps');
            //}
            
            self._showUsersRoom()
            break;
    }
}

Workspace.prototype.hideRoom = function(roomId)
{
    var self = this;
    
    switch(roomId)
    {
        case 'maps':
            self._hideMapsRoom();
            break;
        case 'users':
            self._hideUsersRoom();
            break;
    }
}


Workspace.prototype._showToolList = function()
{
    var self = this;
    
    var listTool     = $('#listTool');
    var toolPreview  = $('#selectedToolPreview>img');
    var selectedTool =  self.getSelectedTool();
    
    
    listTool.css('display', 'block');
    self._showingToolList = true;
    
    //UPDATE PREVIEW ICON
    toolPreview.css('border-left', 'solid 2px #fff');
    self._changeToolPreview(selectedTool + 'Tool');   
}

Workspace.prototype._hideToolList = function()
{
    var self = this;
    
    var listTool     = $('#listTool');
    var toolPreview  = $('#selectedToolPreview>img');
    var selectedTool =  self.getSelectedTool();
    
    listTool.css('display', 'none');
    self._showingToolList = false;
    
    
    //UPDATE PREVIEW ICON
    toolPreview.css('border-left', 'solid 2px #000');
    self._changeToolPreview(selectedTool + 'Tool');
}


Workspace.prototype._showSketchColorList = function()
{
    var self = this;
    
    var listSketchColor     = $('#listSketchColor');
    var sketchColorPreview  = $('#selectedSketchColorPreview>img');
    var sketchColor =  self.getSketchColor();
    
    listSketchColor.css('display', 'block');
    self._showingSketchColorList = true;
    
    //UPDATE PREVIEW ICON
    sketchColorPreview.css('border-left', 'solid 2px #fff');
    self._changeSketchColorPreview(sketchColor);   
}

Workspace.prototype._hideSketchColorList = function()
{
    var self = this;
    
    var listSketchColor     = $('#listSketchColor');
    var sketchColorPreview  = $('#selectedSketchColorPreview>img');
    var sketchColor =  self.getSketchColor();
    
    
    listSketchColor.css('display', 'none');
    self._showingSketchColorList = false;
    
    //UPDATE PREVIEW ICON
    sketchColorPreview.css('border-left', 'solid 2px #000');
    self._changeSketchColorPreview(sketchColor);
}


Workspace.prototype._showSketchThicknessList = function()
{
    var self = this;
    
    var listSketchThickness     = $('#listSketchThickness');
    var sketchThicknessPreview  = $('#selectedSketchThicknessPreview>img');
    var sketchThickness =  self.getSketchThickness();
    
    //CHANGE STATUS
    listSketchThickness.css('display', 'block');
    self._showingSketchThicknessList = true;
    
    //UPDATE PREVIEW ICON
    sketchThicknessPreview.css('border-left', 'solid 2px #fff');
    self._changeSketchThicknessPreview(sketchThickness);   
}

Workspace.prototype._hideSketchThicknessList = function()
{
    var self = this;
    
    var listSketchThickness     = $('#listSketchThickness');
    var sketchThicknessPreview  = $('#selectedSketchThicknessPreview>img');
    var sketchThickness =  self.getSketchThickness();
    
    //CHANGE THE STATUSS
    listSketchThickness.css('display', 'none');
    self._showingSketchThicknessList = false;
    
    //UPDATE PREVIEW ICON
    sketchThicknessPreview.css('border-left', 'solid 2px #000');
    self._changeSketchThicknessPreview(sketchThickness); 
}

Workspace.prototype._showZoomList = function()
{
    var self = this;
    
    var listZoom     = $('#listZoom');
    var zoomPreview  = $('#zoomPreview>img');
    
    //CHANGE STATUS
    listZoom.css('display', 'block');
    self._showingZoomList = true;
    
    //UPDATE PREVIEW ICON
    zoomPreview.css('border-left', 'solid 2px #fff');   
}

Workspace.prototype._hideZoomList = function()
{
    var self = this;
    
    var listZoom     = $('#listZoom');
    var zoomPreview  = $('#zoomPreview>img');
    
    //CHANGE THE STATUSS
    listZoom.css('display', 'none');
    self._showingZoomList = false;
    
    //UPDATE PREVIEW ICON
    zoomPreview.css('border-left', 'solid 2px #000');
}

Workspace.prototype._showGetCurrentPositionList = function()
{
    var self = this;
    
    var listGetCurrentPosition     = $('#listGetCurrentPosition');
    var getCurrentPositionPreview  = $('#getCurrentPositionPreview');
    
    //CHANGE STATUS
    listGetCurrentPosition.css('display', 'block');
    self._showingGetCurrentPositionList = true;
    
    //UPDATE PREVIEW ICON
    getCurrentPositionPreview.css('border-left', 'solid 2px #fff');   
}

Workspace.prototype._hideGetCurrentPositionList = function()
{
    var self = this;
    
    var listGetCurrentPosition     = $('#listGetCurrentPosition');
    var getCurrentPositionPreview  = $('#getCurrentPositionPreview');
    
    //CHANGE THE STATUSS
    listGetCurrentPosition.css('display', 'none');
    self._showingGetCurrentPositionList = false;
    
    //UPDATE PREVIEW ICON
    getCurrentPositionPreview.css('border-left', 'solid 2px #000'); 
}




Workspace.prototype._showMapsRoom = function()
{
    var self = this;
    var mapsRoom         = $('#rooms');
    var mapsRoomPreview  = $('#mapsRoomPreview');
    
    mapsRoom.css('display', 'block');
    self._showingMapsRoom = true;
    
    //UPDATE PREVIEW ICON
    mapsRoomPreview.css('border-right', 'solid 2px #fff');
    self._changeMapsRoomPreview();   
}

Workspace.prototype._hideMapsRoom = function()
{
    var self = this;
    var mapsRoom         = $('#rooms');
    var mapsRoomPreview  = $('#mapsRoomPreview');
    
    mapsRoom.css('display', 'none');
    self._showingMapsRoom = false;
    
    //UPDATE PREVIEW ICON
    mapsRoomPreview.css('border-right', 'solid 2px #000');
    self._changeMapsRoomPreview();
}


Workspace.prototype._showUsersRoom = function()
{
    var self = this;
    var usersRoom  = $('#divRoommateContainerF');
    var usersRoomPreview  = $('#usersRoomPreview');
    
    usersRoom.css('display', 'block');
    self._showingUsersRoom = true;
    
    //UPDATE PREVIEW ICON
    usersRoomPreview.css('border-right', 'solid 2px #fff');
    self._changeUsersRoomPreview();   
}

Workspace.prototype._hideUsersRoom = function()
{
    var self = this;
    var usersRoom  = $('#divRoommateContainerF');
    var usersRoomPreview  = $('#usersRoomPreview');
    
    usersRoom.css('display', 'none');
    self._showingUsersRoom = false;
    
    //UPDATE PREVIEW ICON
    usersRoomPreview.css('border-right', 'solid 2px #000');
    self._changeUsersRoomPreview(); 
}

Workspace.prototype._changeToolPreview = function(tool)
{
    var self = this;
    var toolPreview = $('#selectedToolPreview>img');
    var window_width = $(window).width();
    var wrapper = $('#wrapper');
    
    switch(tool)
    {
        case 'moveTool':
            
            if (self.isToolListBeingShown())
            {
                toolPreview.attr('src', '/img_moveToolClosePreview.png');
            }
            else
            {
                toolPreview.attr('src', '/img_moveToolOpenPreview.png');
            }
            
            //if (window_width <= 320)
            //{
                wrapper.css('top', '26px');
            //}
            
            break;
        case 'drawTool':
        
            if (self.isToolListBeingShown())
            {
                toolPreview.attr('src', '/img_drawToolClosePreview.png');
            }
            else
            {
                toolPreview.attr('src', '/img_drawToolOpenPreview.png');
            }
            
            wrapper.css('top', '0px');
            break;
        case 'markerTool':
            
            if (self.isToolListBeingShown())
            {
                toolPreview.attr('src', '/img_markerToolClosePreview.png');
            }
            else
            {
                toolPreview.attr('src', '/img_markerToolOpenPreview.png');
            }
            wrapper.css('top', '0px');
            break;
    }
}

Workspace.prototype._changeSketchColorPreview = function(tool)
{
    var self = this;
    var sketchColorPreview = $('#selectedSketchColorPreview>img');
    
    switch(tool)
    {
        case 'blue':
            
            if (self.isSketchColorListBeingShown())
            {
                sketchColorPreview.attr('src', '/img_colorBlueClosePreview.png');
            }
            else
            {
                sketchColorPreview.attr('src', '/img_colorBlueOpenPreview.png');
            }
            
            break;
        case 'red':
            
            if (self.isSketchColorListBeingShown())
            {
                sketchColorPreview.attr('src', '/img_colorRedClosePreview.png');
            }
            else
            {
                sketchColorPreview.attr('src', '/img_colorRedOpenPreview.png');
            }
            
            break;
        case 'green':
            
            if (self.isSketchColorListBeingShown())
            {
                sketchColorPreview.attr('src', '/img_colorGreenClosePreview.png');
            }
            else
            {
                sketchColorPreview.attr('src', '/img_colorGreenOpenPreview.png');
            }
            
            break;

    }
}

Workspace.prototype._changeSketchThicknessPreview = function(tool)
{
    var self = this;
    var sketchThicknessPreview = $('#selectedSketchThicknessPreview>img');
    
    switch(tool)
    {
        case 'thin':
            
            if (self.isSketchThicknessListBeingShown())
            {
                sketchThicknessPreview.attr('src', '/img_thicknessThinClosePreview.png');
            }
            else
            {
                sketchThicknessPreview.attr('src', '/img_thicknessThinOpenPreview.png');
            }
            
            break;
        case 'medium':
            
            if (self.isSketchThicknessListBeingShown())
            {
                sketchThicknessPreview.attr('src', '/img_thicknessMediumClosePreview.png');
            }
            else
            {
                sketchThicknessPreview.attr('src', '/img_thicknessMediumOpenPreview.png');
            }
            
            break;
        case 'thick':
            
            if (self.isSketchThicknessListBeingShown())
            {
                sketchThicknessPreview.attr('src', '/img_thicknessThickClosePreview.png');
            }
            else
            {
                sketchThicknessPreview.attr('src', '/img_thicknessThickOpenPreview.png');
            }
            
            break;

    }
}


Workspace.prototype._changeMapsRoomPreview = function()
{
    var self = this;
    var mapsRoomPreview = $('#mapsRoomPreview');
    
    if (self.isMapsRoomBeingShown())
        {
            mapsRoomPreview.attr('src', '/img_mapsClosePreview.png');
        }
        else
        {
            mapsRoomPreview.attr('src', '/img_mapsOpenPreview.png');
        }
}

Workspace.prototype._changeUsersRoomPreview = function()
{
    var self = this;
    var usersRoomPreview = $('#usersRoomPreview');
    
    if (self.isUsersRoomBeingShown())
        {
            usersRoomPreview.attr('src', '/img_usersClosePreview.png');
        }
        else
        {
            usersRoomPreview.attr('src', '/img_usersOpenPreview.png');
        }
}


Workspace.prototype._showToolOptions = function(tool)
{
    var self = this;
    var selectedSketchColorPreview      = $('#selectedSketchColorPreview');
    var selectedSketchThicknessPreview  = $('#selectedSketchThicknessPreview');
    var zoomIn                          = $('#zoomIn');
    var zoomOut                         = $('#zoomOut');
    var getCurrentPosition              = $('#getCurrentPosition');
    
    switch(tool)
    {
        case 'moveTool':
            self._hideToolOptions()
            zoomIn.css('display', 'block');
			zoomOut.css('display', 'block');
			getCurrentPosition.css('display', 'block');
            
            break;
        case 'drawTool':
            self._hideToolOptions();
            selectedSketchColorPreview.css('display', 'block');
            selectedSketchThicknessPreview.css('display', 'block');
            break;
        case 'markerTool':
            self._hideToolOptions()
            break;
    }
}

Workspace.prototype._hideToolOptions = function(tool)
{
    var self = this;
    var selectedSketchColorPreview      = $('#selectedSketchColorPreview');
    var selectedSketchThicknessPreview  = $('#selectedSketchThicknessPreview');
    var zoomIn                          = $('#zoomIn');
    var zoomOut                         = $('#zoomOut');
    var getCurrentPosition              = $('#getCurrentPosition');
    
    selectedSketchColorPreview.css('display', 'none');
    selectedSketchThicknessPreview.css('display', 'none');
    zoomIn.css('display', 'none');
    zoomOut.css('display', 'none');
    getCurrentPosition.css('display', 'none');
}

Workspace.prototype._changeSelectedTool = function(tool)
{
    var self = this;
    
    var moveTool    = $('#moveTool');
    var drawTool    = $('#drawTool');
    var markerTool  = $('#markerTool');
    
    switch(tool)
    {
        case 'moveTool':
            moveTool.attr('src'   , '/img_moveToolSelected.png');
            drawTool.attr('src'   , '/img_drawToolDeselected.png');
            markerTool.attr('src' , '/img_markerToolDeselected.png');
            break;
        case 'drawTool':
            moveTool.attr('src'   , '/img_moveToolDeselected.png');
            drawTool.attr('src'   , '/img_drawToolSelected.png');
            markerTool.attr('src' , '/img_markerToolDeselected.png');
            break;
        case 'markerTool':
            moveTool.attr('src'   , '/img_moveToolDeselected.png');
            drawTool.attr('src'   , '/img_drawToolDeselected.png');
            markerTool.attr('src' , '/img_markerToolSelected.png');
            break;
    }
}

Workspace.prototype._changeSelectedSketchColor = function(color)
{
    var self = this;
    
    var sketchColorBlue   = $('#sketchColorBlue');
    var sketchColorRed    = $('#sketchColorRed');
    var sketchColorGreen  = $('#sketchColorGreen');
    
    switch(color)
    {
        case 'blue':
            sketchColorBlue.attr('src'  , '/img_colorBlueSelected.png');
            sketchColorRed.attr('src'   , '/img_colorRedDeselected.png');
            sketchColorGreen.attr('src' , '/img_colorGreenDeselected.png');
            break;
        case 'red':
            sketchColorBlue.attr('src'  , '/img_colorBlueDeselected.png');
            sketchColorRed.attr('src'   , '/img_colorRedSelected.png');
            sketchColorGreen.attr('src' , '/img_colorGreenDeselected.png');
            break;
        case 'green':
            sketchColorBlue.attr('src'  , '/img_colorBlueDeselected.png');
            sketchColorRed.attr('src'   , '/img_colorRedDeselected.png');
            sketchColorGreen.attr('src' , '/img_colorGreenSelected.png');
            break;
    }
}

Workspace.prototype._changeSelectedSketchThickness = function(thickness)
{
    var self = this;
    
    var sketchThicknessThin    = $('#sketchThicknessThin');
    var sketchThicknessMedium  = $('#sketchThicknessMedium');
    var sketchThicknessThick   = $('#sketchThicknessThick');
    
    switch(thickness)
    {
        case 'thin':
            sketchThicknessThin.attr('src'  , '/img_thicknessThinSelected.png');
            sketchThicknessMedium.attr('src', '/img_thicknessMediumDeselected.png');
            sketchThicknessThick.attr('src' , '/img_thicknessThickDeselected.png');
            break;
        case 'medium':
            sketchThicknessThin.attr('src'  , '/img_thicknessThinDeselected.png');
            sketchThicknessMedium.attr('src', '/img_thicknessMediumSelected.png');
            sketchThicknessThick.attr('src' , '/img_thicknessThickDeselected.png');
            break;
        case 'thick':
            sketchThicknessThin.attr('src'  , '/img_thicknessThinDeselected.png');
            sketchThicknessMedium.attr('src', '/img_thicknessMediumDeselected.png');
            sketchThicknessThick.attr('src' , '/img_thicknessThickSelected.png');
            break;
    }
}

// GIVE AN ORDER TO WHAT IS BELOW



Workspace.prototype.addOverlay = function(overlay)
{
	var self = this;
	overlay.drawAt(self.map,
		{ click: { 	update : function(overlay)
						{
							self.room.updateOverlay(overlay);
						}
				,destroy: function(overlay)
							{
								self.room.destroy(overlay);
							}
				}
		,drag: function()
			{
				self.canvas.drawing = false; // informar al canvas que no dibuje una polilinea
				self.canvas.points = []; //informar al canvas que no tiene una polilinea
				self.canvas.dragMarker = true; //informar al canvas que estoy haciendo un drag de un marker 
			}
		});
}

Workspace.prototype.moveTo = function(pos)
{
	var self = this;
	self.map.moveTo(pos);
}

Workspace.prototype.getCenter = function()
{
	var self = this;
	return self.map.getCenter();
}

Workspace.prototype.stop = function()
{
	//var self = this;
	self.map = null;
	//$('#toggleModeButton').unbind('click');
	//alert('hola');
	//$('#btnDrag').unbind('click');
	//$('#btnDraw').unbind('click');
	//$('#marker').unbind('click');
	//$('#listTool li').unbind('click');
	
	//this.canvas.stop();
	
	this.changeTool('moveTool');
}
/*
Workspace.prototype._switchMode = function(mode)
{
	var self = this;
	self.mode = mode;

	switch(self.mode) {
		case 'move':
			self.map.unlock();
			self.canvas.stop();
			self.canvas.stopLine();
			self.canvas.stopMarker();
			break;
		case 'draw':
			self.map.lock();
			//self.canvas.start();
			self.canvas.startLine()
			self.canvas.stopMarker();
			break;
		case 'marker':
			self.map.lock();
			//self.canvas.start();
			self.canvas.startMarker();
			self.canvas.stopLine();
			break;
	
	return false;
	}
}
*/


Workspace.prototype.saveOverlay = function(overlay)
{
	this.room.saveOverlay(overlay);
}
Workspace.prototype.changeSketchColor = function(color)
{
	var self = this;
	var lineColor = '#000000';
	
	switch(color)
	{
	   case 'sketchColorBlue':
	       lineColor = '#0000ff';
	       self._sketchColor = 'blue';
	       self._changeSketchColorPreview('blue');
	       self._changeSelectedSketchColor('blue');
	       break;
	   case 'sketchColorRed':
	       lineColor = '#ff0000';
	       self._sketchColor = 'red';
	       self._changeSketchColorPreview('red');
	       self._changeSelectedSketchColor('red');
	       break;
	   case 'sketchColorGreen':
	       lineColor = '#00ff00';
	       self._sketchColor = 'green';
	       self._changeSketchColorPreview('green');
	       self._changeSelectedSketchColor('green');
	       break;
	       
	}
	
	self._sketchColorHTML = lineColor;
}
Workspace.prototype.changeSketchThickness =function(thickness)
{
	var self = this;
	var weight = 5;
	
	switch(thickness)
	{
	   case 'sketchThicknessThin':
	       weight = 2;
	       self._sketchThickness = 'thin';
	       self._changeSketchThicknessPreview('thin');
	       self._changeSelectedSketchThickness('thin');
	       break;
	   case 'sketchThicknessMedium':
	       weight = 5;
	       self._sketchThickness = 'medium';
	       self._changeSketchThicknessPreview('medium');
	       self._changeSelectedSketchThickness('medium');
	       break;
	   case 'sketchThicknessThick':
	       weight = 10;
	       self._sketchThickness = 'thick';
	       self._changeSketchThicknessPreview('thick');
	       self._changeSelectedSketchThickness('thick');
	       break;
	}
	
	self._sketchThicknessNumber = weight;
}

Workspace.prototype.changeTool =function(tool)
{
	
	var self = this;
	var window_width = $(window).width();
	
	if(tool == 'moveTool')
	{
	   self._switchMode('move');
	   self._changeToolPreview('moveTool');
	   self._showToolOptions('moveTool');
	   self._changeSelectedTool('moveTool');
	   self._selectedTool = 'move';
	   application.user_manager.send_editing( false );
	   
	   
	   
	}
	else if(tool == 'drawTool')
	{
	   self._switchMode('draw');
	   self._changeToolPreview('drawTool');
	   self._showToolOptions('drawTool');
	   self._changeSelectedTool('drawTool');
	   self._selectedTool = 'draw'
	   application.user_manager.send_editing( true );
	}
	else if (tool == 'markerTool')
	{
	   self._switchMode('marker');
	   self._changeToolPreview('markerTool');
	   self._showToolOptions('markerTool');
	   self._changeSelectedTool('markerTool');
	   self._selectedTool = 'marker'
	   application.user_manager.send_editing( true );
	}

}







Workspace.prototype.getLatLngFromPixel =function(clickPosition)
{
    var self = this;
	
	var scale = Math.pow(2, workspace.map.gmap.getZoom());
    var nw = new google.maps.LatLng(
        workspace.map.gmap.getBounds().getNorthEast().lat(),
        workspace.map.gmap.getBounds().getSouthWest().lng()
    );

    var worldCoordinateNW = workspace.map.gmap.getProjection().fromLatLngToPoint(nw);
    var worldCoordinate = workspace.map.gmap.getProjection().fromLatLngToPoint(clickPosition);
    var position = new google.maps.Point(
        Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale) - 30, 
        Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale) - 10
    );
	
	return position()

}

Workspace.prototype.changeZoom =function(zoomType)
{
    var self = this;
    var map_center    = self.map.get_position( );
    var map_zoom      = self.map.get_zoom( );
    var map_type_id = self.map.get_map_type_id( ); 
    var data;
	
	if (zoomType == 'zoomIn')
	{
	   data = 
	   {
	       map_center: map_center,
	       map_zoom: map_zoom + 1,
	       map_type_id: map_type_id
	   }
	}
	else
	{
	   data = 
	   {
	       map_center: map_center,
	       map_zoom: map_zoom - 1,
	       map_type_id: map_type_id
	   }
	}
	
	self.map.move_to( data );
	self.map.send_move( );

}

/*******************/
/***             ***/
/***   PRIVATE   ***/ 
/***   METHODS   ***/
/***             ***/
/*******************/

Workspace.prototype._private_place_users_from_room = function( )
{
    var self = this;
    var users =  application.active_room.users;
    
    application.active_room.remove_users();
    
    for ( user_id in users)
    {
       var id = user_id;
       var user_position = users[user_id].user_position;
       var coords = new google.maps.LatLng(user_position[0], user_position[1]);
       
       //ADD TO THE HTML
       var user_options =
        {
            user_id: id
        }
       
       application.screen_manager.add_user( user_options );
       
       //ADD TO THE MAP
       var user_marker_options = 
       {
           user_id: id,
           user_position: coords,
           draggable: false,
           user_markers: true
       };
       
       application.workspace.map.place_user_marker( user_marker_options );
    }

}

Workspace.prototype._private_place_markers_from_room = function( )
{
    var self = this;
	var markers =  application.active_room.markers;
	
	for ( markerId in markers)
	{
	   var id = markerId;
	   var position = markers[markerId].position;
	   
	   data = 
	   {
	       marker_id: id,
	       marker_position: position
	   }
	   
	   self.map.place_marker_from_other( data );
	}

}

Workspace.prototype._private_place_polylines_from_room = function( )
{
    var self = this;
	var polylines =  application.active_room.polylines;
	
	for ( polyline_id in polylines)
	{
	   var id = polyline_id;
	   var color = polylines[id].color.substring(2,8);
	   var weight = polylines[id].weight;
	   var path   = polylines[id].path;
	   
	   
	   data = 
	   {
	       polyline_id: id,
	       polyline_color: color,
	       polyline_weight: weight,
	       polyline_path: path
	   }
	   
	   self.map.place_polyline_from_other( data );
	}

}

Workspace.prototype._private_set_map_position_from_room = function( )
{
    var self      = this;
    var room = application.active_room;
	var map_data = {
	   map_center: [room.position.lat, room.position.lng],
	   map_zoom: 16,
	   map_type_id: room.map_type_id
	};
	
	
    self.map.move_to(map_data);
}

