function InfoWindow(data)
{
	self = this;
	if (data.marker)
	{
	   self.marker = data.marker;
	}
	else if (data.polyline)
	{
	   self.polyline = data.polyline;
	}
	
	self.map    = data.map;
	self.formText;
	self.formImage;
	
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
		minHeight: 20
		//position: data.position
	}); 
	
	self.ginfowindow.addTab('<img src="images/infowindowText.png" align="left" /><br />', self.formText.get()[1]);
	self.ginfowindow.addTab('<img src="images/infowindowImage.png" align="left" /><br />', self.formImage.get()[0]);
	self.ginfowindow.addTab('<img src="images/infowindowSketch.png" align="left" /><br />', '<h1>DIBUJAR ALGO</h1>');
	
	if (self.marker)
	{
	   self.ginfowindow.open(self.map,self.marker);
	}
	else if (self.polyline)
	{
	   
	   //position = new google.maps.LatLng(self.polyline.getPath().getAt(0).lat(), self.polyline.getPath().getAt(0).lng());
	   //alert(point);
	   //self.ginfowindow.setPosition(position);
	   self.ginfowindow.setPosition(data.position)
	   self.ginfowindow.open(self.map);
	}
	//self.addEvents();
	self.addImageUpload();
	
	
	
}


InfoWindow.prototype.createForm = function(marker)
{
	contentInfowindowText = ['<h4>Inserte un texto:</h4>',
							 '<form>',
							 '<textarea rows="10" cols="30">',
							 '</textarea>',
							 '</form>'].join('');
							 
							 
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
  							  
  							  
	this.formText = $(contentInfowindowText);
	this.formImage = $(contentInfowindowImage);
	
	//this.imageUploadBtn = jQuery(this.formImage.find('input[name="subir"]'));
	this.imageFile      = jQuery(this.formImage.find('input[name="image"]'));
	this.formulario     = jQuery(this.formImage.find('form[id="searchForm"]'));
	
	
	
	
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

InfoWindow.prototype.submitImage = function()
{
	self = this;
	
	url = 'image';
	imagen = self.getImage();
	
	//alert(imagen);
	
    // bind 'myForm' and provide a simple callback function 
    $('#searchForm').ajaxForm(function() { 
    	//alert(data); 
        $('#imageContainer').replaceWith(data);
    });
}

InfoWindow.prototype.addImageUpload = function()
{
	//self = this;
	
	//alert(imagen);
	
    // bind 'myForm' and provide a simple callback function 
    self.formulario.ajaxForm(function(data) { 
    	//alert(data); 
        self.formImage.replaceWith(data);
    });
    
    //alert('submit added');
}

InfoWindow.prototype.getImage = function()
{
	self = this;
	
	return self.imageFile.val();
}

InfoWindow.prototype.addEvents = function()
{	
    var self = this;
    
	self.imageUploadBtn.bind('click',function(event)
	{
		//alert('subir imagen');
	    self.submitImage();
		//self.removeEvents();
	});
	
}    
