function StaticRoom(data)
{
    var self = this;
    self.id = data.id;
    self.type = data.type;
    
    self.users = {}
    
	self.SELECTED ="1";
	self.NOT_SELECTED = "0.15";
	self.polylines = {};
	self.markers = {};
	self.userMarkers = {};
	self.room = 'room';
	self.position = 
	{
	   lat: -33.442274640638544,
	   lng: -70.63674688339233,
	   zoom: 16
	}
	
	self.dom = self.createDiv(self.id, self.type);
	
	self.mapSrc = 'http://maps.google.com/maps/api/staticmap?center=-33.44227,-70.63674&zoom=13&size=150x100&sensor=false&markers=color:red|size:tiny|'
	
	self.mapTypeId = 'roadmap';
	
	self.start();
	
	$(self.dom).prependTo('#' + self.type);
	
	self.addListener()
}

StaticRoom.prototype.start = function() {
	var self = this;
	
	// Display Map
	var mapImage = document.createElement('img');
	mapImage.className = "miniMap";
	mapImage.room = self;
	mapImage.style.opacity = this.NOT_SELECTED;
	mapImage.src = self.mapSrc;
	
	$(mapImage).appendTo(self.dom);
		
	//self.updateMap();
}



StaticRoom.prototype.placeMarker = function(data)
{
    //alert('placing marker on static');
    var self = this;
    
    self.markers[data.markerId] = 
    {
          position: [data.position[0], data.position[1]]
    }
    
    self.updateMapUrl();
    self.updateMap()
}

StaticRoom.prototype.placePolyline = function(data)
{
    //alert('placing marker on static');
    var self = this;
    
    self.polylines[data.polylineId] = 
    {
        weight: data.weight,
        color: '0x' + data.color +'ff',
        path: data.path
    }
    
    self.updateMapUrl();
    self.updateMap()
}

StaticRoom.prototype.updateMap = function()
{
    var self = this;
    
    divImage = $('#' + self.id + '>img');
    divImage.attr('src', self.mapSrc);
}

StaticRoom.prototype.updateMapUrl = function()
{
    var self = this;
    
    var src = 'http://maps.google.com/maps/api/staticmap?';
    
    src += 'center=' + self.position.lat + ',' + self.position.lng;
    
    //CHANGE SO IT CAN BE READ FROM STATIC ROOM
    src += '&maptype=' + self.mapTypeId;
    
    src += '&zoom=13&size=150x100&sensor=false&markers=color:red|size:tiny|';
    
    
    
    for (markerId in self.markers)
    {
        src += self.markers[markerId].position[0] + ',' + self.markers[markerId].position[1] + '|';
    }
    
    $.each(self.polylines, function(index, polyline){
        src += '&path=color:' + polyline.color + '|weight:' + (polyline.weight -2) + '|enc:' + polyline.path;
    });
    
    self.mapSrc = src;
}

StaticRoom.prototype.removeMarker = function(data)
{
    var self = this;
    
    delete self.markers[data.markerId];
    self.updateMapUrl();
    self.updateMap();
}

StaticRoom.prototype.removePolyline = function(data)
{
    var self = this;
    
    delete self.polylines[data.polylineId];
    self.updateMapUrl();
    self.updateMap();
}

StaticRoom.prototype.moveTo = function(data)
{
    var self = this;
    
    self.position.lat = data.center[0];
    self.position.lng = data.center[1];
    self.mapTypeId = data.mapTypeId;
    
    self.updateMapUrl();
    self.updateMap();
}

StaticRoom.prototype.addListener = function()
{
    var self = this;
    
    room = $('#' + self.id);
    
        room.click(function()
        {
            clientManager.setActiveRoom(self.id);
        });

}

StaticRoom.prototype.addUser = function(data)
{
    var self = this;
    
    self.users[data.userId]= {
        user_name: data.user_name,
        user_position: data.user_position
        } 
}

StaticRoom.prototype.removeUser = function(data)
{
    var self = this;
    
    delete self.users[data.userId];

}