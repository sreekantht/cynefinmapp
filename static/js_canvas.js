function Canvas_M( options )
{
    var self = this;
    
    self.id = 'img_' + options.id;
    
    self.create_html( { id: options.id } );

    
	
	
	
	//--------------//
	
 
// Get a refernce to the canvase.
var canvas = $('#' + self.id);
 
// Get a reference to our form.
var form = $( "form" );
 
// Get a reference to our form commands input; this
// is where we will need to save each command.
var commands = form.find( "input[ name = 'commands' ]" );
 
// Get a reference to the export link.
var exportGraphic = $( "a" );
 
// Get the rendering context for the canvas (curently,
// 2D is the only one available). We will use this
// rendering context to perform the actually drawing.
var pen = canvas[ 0 ].getContext( "2d" );
application.workspace.last_canvas = canvas[0];
application.workspace.canvas[self.id] = canvas[0];
pen.strokeStyle = '#0000FF';
pen.lineWidth = 5;
 
// Create a variable to hold the last point of contact
// for the pen (so that we can draw FROM-TO lines).
var lastPenPoint = null;
 
// This is a flag to determine if we using an iPhone.
// If not, we want to use the mouse commands, not the
// the touch commands.
var isIPhone = (new RegExp( "iPhone", "i" )).test(
navigator.userAgent
);
 
 
// ---------------------------------------------- //
// ---------------------------------------------- //
 
 
// Create a utility function that simply adds the given
// command to the form input.
var addCommand = function( command ){
// Append the command as a list item.
commands.val( commands.val() + ";" + command );
};
 
 
// I take the event X,Y and translate it into a local
// coordinate system for the canvas.
var getCanvasLocalCoordinates = function( pageX, pageY ){
// Get the position of the canvas.
var position = canvas.offset();
 
// Translate the X/Y to the canvas element.
return({
x: (pageX - position.left),
y: (pageY - position.top)
});
};
 
 
// I get appropriate event object based on the client
// environment.
var getTouchEvent = function( event ){
// Check to see if we are in the iPhont. If so,
// grab the native touch event. By its nature,
// the iPhone tracks multiple touch points; but,
// to keep this demo simple, just grab the first
// available touch event.
return(
isIPhone ?
window.event.targetTouches[ 0 ] :
event
);
};
 
 
// I handle the touch start event. With this event,
// we will be starting a new line.
var onTouchStart = function( event ){
// Get the native touch event.
var touch = getTouchEvent( event );
 
// Get the local position of the touch event
// (taking into account scrolling and offset).
var localPosition = getCanvasLocalCoordinates(
touch.pageX,
touch.pageY
);
 
// Store the last pen point based on touch.
lastPenPoint = {
x: localPosition.x,
y: localPosition.y
};
 
// Since we are starting a new line, let's move
// the pen to the new point and beign a path.
pen.beginPath();
pen.moveTo( lastPenPoint.x, lastPenPoint.y );
 
// Add the command to the form for server-side
// image rendering.
addCommand(
"start:" +
(lastPenPoint.x + "," + lastPenPoint.y)
);
 
// Now that we have initiated a line, we need to
// bind the touch/mouse event listeners.
//canvas.bind(
//(isIPhone ? "touchmove" : "mousemove"),
//onTouchMove
//);

canvas.bind("touchmove", onTouchMove);
canvas.bind("mousemove", onTouchMove);
 
// Bind the touch/mouse end events so we know
// when to end the line.
//canvas.bind(
//(isIPhone ? "touchend" : "mouseup"),
//onTouchEnd
//);

canvas.bind("touchend", onTouchEnd);
canvas.bind("mouseup", onTouchEnd);

};
 
 
// I handle the touch move event. With this event, we
// will be drawing a line from the previous point to
// the current point.
var onTouchMove = function( event ){
// Get the native touch event.
var touch = getTouchEvent( event );
 
// Get the local position of the touch event
// (taking into account scrolling and offset).
var localPosition = getCanvasLocalCoordinates(
touch.pageX,
touch.pageY
);
 
// Store the last pen point based on touch.
lastPenPoint = {
x: localPosition.x,
y: localPosition.y
};
 
// Draw a line from the last pen point to the
// current touch point.
pen.lineTo( lastPenPoint.x, lastPenPoint.y );
 
// Render the line.
pen.stroke();
 
// Add the command to the form for server-side
// image rendering.
addCommand(
"lineTo:" +
(lastPenPoint.x + "," + lastPenPoint.y)
);
};
 
 
// I handle the touch end event. Here, we are basically
// just unbinding the move event listeners.
var onTouchEnd = function( event ){
// Unbind event listeners.
//canvas.unbind(
//(isIPhone ? "touchmove" : "mousemove")
//);

canvas.unbind('touchmove')
canvas.unbind('mousemove')
 
// Unbind event listeners.
//canvas.unbind(
//(isIPhone ? "touchend" : "mouseup")
//);
canvas.unbind('touchend');
canvas.unbind('mouseup');
};


 
 
// ---------------------------------------------- //
// ---------------------------------------------- //
 
 
// Bind the export link to simply submit the form.
exportGraphic.click(
function( event ){
// Prevent the default behavior.
event.preventDefault();
 
// Submit the form.
form.submit();
}
);
 
 
// Bind the touch start event to the canvas. With
// this event, we will be starting a new line. The
// touch event is NOT part of the jQuery event object.
// We have to get the Touch even from the native
// window object.
/*
canvas.bind(
(isIPhone ? "touchstart" : "mousedown"),
function( event ){
// Pass this event off to the primary event
// handler.
onTouchStart( event );
 
// Return FALSE to prevent the default behavior
// of the touch event (scroll / gesture) since
// we only want this to perform a drawing
// operation on the canvas.
return( false );
}
);
*/


canvas.bind('touchstart', 
    function( event ){
        onTouchStart( event );
        return( false );
        });
        
canvas.bind('mousedown', 
    function( event ){
        onTouchStart( event );
        return( false );
        });
    //--------------//
    
    
    
    var window_width = $(window).width();
    var window_height = $(window).height();
    var margin_top;
    var margin_left;
    var image_width;
    var image_height;
    if (window_width > window_height)
    {
        margin_top = parseInt((window_height - window_width) / 2.0 );
        margin_left = 0;
        image_width = window_width;
        image_height = window_width;
    }
     else
    {
        margin_top = 0;
        margin_left = parseInt((window_width - window_height) / 2.0)
        image_width = window_height;
        image_height = window_height;
    }
            
    var imagen = new Image();
    imagen.addEventListener('load', function(){
        pen.drawImage(imagen,margin_left,margin_top, image_width, image_height);
        }, false);
            
	imagen.src = options.image_url;
	
	application.workspace.last_canvas_image ={
	    url: options.image_url,
	    margin_left: margin_left,
	    margin_top: margin_top,
	    image_width: image_width,
	    image_height: image_height
	    }

}

Canvas_M.prototype.create_html = function( options )
{
    var self = this;
    var div = document.createElement('canvas');
	var window_height = $(window).height();
	var window_width = $(window).width();
	
	div.className = "img_street_view";
	div.id = 'img_' + options.id;
	div.width = window_width;
	div.height = window_height;
	$(div).appendTo('#workspace');
	$(div).css('z-index', '2');
	
	
	
	
}
