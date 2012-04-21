function Chat_InfoWindow(data)
{
	var self = this;
	if (data.marker)
	{
	   self.marker  = data.marker;
	   self.gmarker = data.gmarker;
	}
	else if (data.polyline)
	{
	   self.polyline = data.polyline;
	}
	
	self.map    = data.map;
	self.formText;
	self.formImage;
	self.content;
	self.opened = false;
	
	self.createForm();
	
	
	
	
	
	self.ginfowindow = new InfoBubble({  
		shadowStyle: 0, 
		padding: 0, 
		backgroundColor: '#fff', 
		borderRadius: 0, 
		arrowSize: 20, 
		borderWidth: 2, 
		borderColor: '#000', 
		disableAutoPan: false, 
		hideCloseButton: false, 
		arrowPosition: 50, 
		backgroundClassName: 'phoney', 
		arrowStyle: 0,
		minWidth: 200,
		minHeight: 200
		//position: data.position
	}); 
	
	self.ginfowindow.addTab('<img src="/images/icons/infowindowText.png" align="left" /><br />', self.formText.get()[0]);
	//self.ginfowindow.addTab('<img src="images/infowindowImage.png" align="left" /><br />', self.formImage.get()[0]);
	//self.ginfowindow.addTab('<img src="images/infowindowSketch.png" align="left" /><br />', '<h1>DIBUJAR ALGO</h1>');
	
	if (self.gmarker)
	{
	   self.ginfowindow.open(self.map,self.gmarker);
	   self.opened = true;
	}
	else if (self.polyline)
	{
	   
	   //position = new google.maps.LatLng(self.polyline.getPath().getAt(0).lat(), self.polyline.getPath().getAt(0).lng());
	   //alert(point);
	   //self.ginfowindow.setPosition(position);
	   self.ginfowindow.setPosition(data.position)
	   self.ginfowindow.open(self.map);
	}
	self.addEvents();
	//self.addImageUpload();
	
	
	
}


Chat_InfoWindow.prototype.createForm = function(marker)
{
	contentInfowindowText = ['<div>',
	                         //'<h4>Inserte un texto:</h4>',
	                         '<div id="old_messages"> </div>',
							 '<textarea name="message" rows="1" cols="20">',
							 '</textarea>',
							 '<input type="button" value="Enviar" name="enviar" />',
							 '</div>'].join('');
							 
							 
	contentInfowindowImage = ['<div id="imageContainer">',
							  '<h4>Inserte una imagen:</h4>',
							  '<form id="searchForm" enctype="multipart/form-data" action="image" method="POST">',
   							  '<input type="file" name="imagen" />',
   							  '<input type="submit" value="Subir" name="subir" />',
  							  '</form>'].join('');
  							  
  	contentInfowindowCanvas = ['<div id="canvasContainer">',
							  '<h4>Dibuje:</h4>',
							  '<canvas>',
   							  '</canvas>'].join('');
  							  
  							  
    if (this.content)
    {
        this.formText = $(this.content);
    }
    else
    {
	    this.formText = $(contentInfowindowText);
	}
	this.formImage = $(contentInfowindowImage);
	
	//this.imageUploadBtn    = jQuery(this.formImage.find('input[name="subir"]'));
	this.chat_send_button  = jQuery(this.formText.find('input[name="enviar"]'));
	this.textarea          = jQuery(this.formText.find('textarea[name="message"]'));
	this.old_messages      = jQuery(this.formText.find('div[id="old_messages"]'));
	
	
	
	
	//para evitar hacer click atras del infoWindow
	this.formText.click(function(event)
	{
		event.stopPropagation();
	});
	
	this.formImage.click(function(event)
	{
		event.stopPropagation();
	});
}

Chat_InfoWindow.prototype.submitImage = function()
{
	var self = this;
	
	url = 'image';
	imagen = self.getImage();
	
	//alert(imagen);
	
    // bind 'myForm' and provide a simple callback function 
    $('#mensaje_de_chat').ajaxForm(function() { 
    	alert('algo paso con el mensaje'); 
        //$('#imageContainer').replaceWith(data);
    });
}

Chat_InfoWindow.prototype.submit_message = function()
{
	var self = this;
	var mensaje = self.get_message();
	var user_id = application.user_manager.get_user_id( );
	
	
	var json = {
	       user_id: application.user_manager.get_user_id( ),
	       room_id: application.get_active_room( ).id,
	       room_type: application.get_active_room( ).type,
	       room_collaborative: application.get_active_room( ).collaborative,
	       message_to: self.marker.user_id,
	       message_type: 'message',
	       message: mensaje
	   }
	   
	var jsonText = $.toJSON(json);
    
    application.conection_manager.send_message('/mensaje', jsonText);
    
    
	//CHANGE THE CONTENT OF THE DIV
	self.add_message_log(mensaje, user_id);
}

Chat_InfoWindow.prototype.get_message = function()
{
	var self = this;
	
	return self.textarea.val();
}

Chat_InfoWindow.prototype.add_message_log = function(mensaje, user_id)
{
	var self = this;
	
	self.old_messages.append(user_id + ' dice: ' + mensaje +'<br />');
	self.textarea.val('');
}

Chat_InfoWindow.prototype.addEvents = function()
{	
    var self = this;
    var infowindow = this;
	self.chat_send_button.bind('click',function(event)
	{
		//alert('enviar mensaje');
	    self.submit_message();
		//self.removeEvents();
	});
	
	self.textarea.keydown(function (e)
	{
        var keyCode = e.keyCode || e.which,
        enter = 13;
        
        if (keyCode == enter)
        {
            self.submit_message();
        }
    });
    
    var listener2 = google.maps.event.addListener(self.ginfowindow, 'closeclick', function(event)
	{
	   infowindow.save_content();
	   infowindow.opened = false;
  	});
}    

Chat_InfoWindow.prototype.save_content = function()
{	
    var self = this;
    var content = self.ginfowindow.getContent().innerHTML;
    self.content = content;
}   