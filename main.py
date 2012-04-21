import os.path
import tornado.options
import tornado.web
import tornado.httpserver
import pymongo

from tornadio2 import SocketConnection, TornadioRouter, SocketServer

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
        	(r"/",MainHandler),
        	(r"/mensaje",MessageHandler),
        	]
        connection = pymongo.Connection('localhost', 27017)
        settings = dict(
        	template_path = os.path.join(os.path.dirname(__file__),"templates"),
        	static_path   = os.path.join(os.path.dirname(__file__),"static"),
        	debug=True,
        	)
        
        self.db = connection.cynefin
        tornado.web.Application.__init__(self, handlers, **settings)

class MainHandler(tornado.web.RequestHandler):
    def get(self):
    	self.render('index.html')

class SocketIOHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('socket.io.js')

class DoNothing(tornado.web.RequestHandler):
    def get(self):
        self.write('')
    
    def post(self):
        self.write('')
       

class MessageHandler(SocketConnection):
    participants = set( )
    unique_id = 0
    
    @classmethod
    def get_username(cls):
        cls.unique_id += 1
        return 'User%d' % cls.unique_id
    
    def on_open(self, info):
        print 'Chat', repr(info)
        
        #Give user unique ID
        self.user_name = self.get_username( )
        self.participants.add( self )
       
        self.broadcast( '%s joined chat.' % self.user_name )
    
    def on_message( self, message ):
        self.broadcast( message )
    
    def on_close( self ):
        self.participants.remove( self )
        
        self.broadcast( '%s left the chat.' % self.user_name )
        
    def broadcast( self, msg ):
        for p in self.participants:
            p.send( msg )

class RouterConnection( SocketConnection ):
    __endpoints__ = {'/mensaje': MessageHandler}
    
    def on_open( self, info ):
        print 'Router',  repr( info )

#Create SocketServer
my_router = TornadioRouter( RouterConnection )
        



if __name__ == "__main__":
    #application = Application( )
    #application.listen(9090)
    #tornado.ioloop.IOLoop.instance().start()
    
    application = tornado.web.Application(
    	my_router.apply_routes([
    					   (r"/", MainHandler),
    					   (r"/crear_sesion", DoNothing),
                           (r"/socket.io.js", SocketIOHandler)]),
    	flash_policy_port = 843,
    	flash_policy_file = os.path.join(os.path.dirname(__file__),"flashpolicy.xml"),
    	socket_io_port = 9090,
    	template_path = os.path.join(os.path.dirname(__file__),"templates"),
        static_path   = os.path.join(os.path.dirname(__file__),"static"),

    	)
    import logging
    logging.getLogger( ).setLevel( logging.DEBUG )
    
    #create and start tornadio server
    SocketServer( application )
    	


######################
### DATABASE MODEL ###
######################
#
# application
#	session