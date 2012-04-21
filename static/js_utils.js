Utils =
{ s4: function() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  },
  
  getMonth : function( t )
  {
    if (t.getMonth() > 9 )
        return '' + ( t.getMonth( ) + 1 );
    else
        return '0' + ( t.getMonth( ) + 1 );
  },
  
  getDate : function( t )
  {
    if (t.getDate() > 9 )
        return '' + t.getDate( );
    else
        return '0' + t.getDate( );
  },
  
  getHours : function( t )
  {
    if (t.getHours() > 9 )
        return '' + t.getHours( );
    else
        return '0' + t.getHours( );
  },
  
  getMinutes : function( t )
  {
    if (t.getMinutes() > 9 )
        return '' + t.getMinutes( );
    else
        return '0' + t.getMinutes( );
  },
  
  getSeconds : function( t )
  {
    if (t.getSeconds() > 9 )
        return '' + t.getSeconds( );
    else
        return '0' + t.getSeconds( );
  },
  
  getMilliseconds : function( t )
  {
    if (t.getMilliseconds() > 9 )
        return '' + t.getMilliseconds( );
    else
        return '0' + t.getMilliseconds( );
  },
  
  datetime: function( )
  {
    var now = new Date( );
    return now.getFullYear() + '-'+ Utils.getMonth( now ) + '-' + Utils.getDate( now ) + '-' + Utils.getHours( now ) + '-'  + Utils.getMinutes( now ) + '-' + Utils.getSeconds( now ) + '-' + Utils.getMilliseconds( now );
  }
, guid: function() {
   return (Utils.datetime( ) + '-' + Utils.s4());
  }
};
