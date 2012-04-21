import cgi
import os
import datetime
import sys
import random

from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.ext.db import Key
from google.appengine.api import mail
from google.appengine.api import images
from google.appengine.api import channel
from google.appengine.api import urlfetch
#from clases import *
from datetime import *
from clases import *

from django.utils import simplejson


class MainHandler(webapp.RequestHandler):
    def get(self):
        
        #CREATE CHANNEL
        token = channel.create_channel('room')
        sessions = Session.all()
        
        template_values = { 'token': token, 'sessions': sessions }
        template_path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_values))
    
    def post(self):
        archivoImagen = self.request.get('imagen')
        
        respuesta = db.Blob(archivoImagen)
        
        #imagen = Imagen()
        #imagen.archivo = db.Blob(archivoImagen)
        #imagen.put()
        
        #respuesta = 'hola'
        self.response.out.write(respuesta)
        
class Prueba(webapp.RequestHandler):
    def get(self):
        template_values = { }
        path = os.path.join(os.path.dirname(__file__), 'prueba_imagen.html')
        self.response.out.write(template.render(path, template_values))

class MessageHandler(webapp.RequestHandler):
    def get(self):
        #READ MESAGE
        #mensaje = self.request.get('mensaje')
        json = self.request.get('json')
        
        jsonDecoded = simplejson.loads(json)
        
        response = {
            'type': 'mensaje',
            'mensaje': 'hola'
        }
        
        response = simplejson.dumps(response)
        #channel.send_message('room', response)
        
        template_values = {'json': json}
        path = os.path.join(os.path.dirname(__file__), 'pruebaMensaje.html')
        self.response.out.write(template.render(path, template_values))
        
    def post(self):
        #READ MESAGE
        json = self.request.get('json')
        
        #hay que cambiar esto para que envie el mensaje a todos los usuarios
        ### to_do FILTER USERS IN SESSION ###
        users = User.all()
        
        for user in users:
			channel.send_message(user.id, json)
        
        #por aqui en alguna parte tengo que poner las funciones para guardar
        #nuevos rooms, overlays, etc
        
        #DECODE MESSAGE
        message = simplejson.loads(json)
        
        #GET MESSAGE TYPE
        if message['message_type'] == 'add_room':
            session_id = message['session_id']
            session = db.get( Key.from_path( 'Session', session_id ) )
            Room( key_name = message['new_room_id'],
                  id = message['new_room_id'],
                  type = message['room_type'],
                  collaborative = message['room_collaborative'],
                  creator = message['user_id'],
                  session = session,
                  modified = True,
                  #leader
                  date_of_creation = datetime.now()).put()
                  
        else:
            room = False
            try:
                room = db.get(Key.from_path('Room', message['room_id']))
                session = db.get(Key.from_path('Session', message['session_id']))
            except:
                pass
            if not room:
                self.response.out.write('no room')
            
            else:
            
                if message['message_type'] == 'add_marker':
                    Marker( key_name  = message['marker_id'],
                            room      = room,
                            id        = message['marker_id'],#).put()
                            position  = [ float(message['marker_position'][0][0]), float(message['marker_position'][1][0])]).put()
                    room.modified = True
                    room.put( )
                            
                elif message['message_type'] == 'remove_marker':
                    marker = db.get(Key.from_path('Marker', message['marker_id']))
                    marker.delete()
                    room.modified = True
                    room.put( )
                
                elif message['message_type'] == 'remove_room':
                    room.delete()
                
                elif message['message_type'] == 'add_polyline':
                    Polyline( key_name   = message['polyline_id'],
                              room       = room,
                              id         = message['polyline_id'],
                              color      = message['polyline_color'],
                              path       = message['polyline_path'],
                              thickness  = str(message['polyline_weight'])).put()
                    room.modified = True
                    room.put( )
                
                elif message['message_type'] == 'remove_polyline':
                    polyline = db.get(Key.from_path('Polyline', message['polyline_id']))
                    polyline.delete()
                    room.modified = True
                    room.put( )
                
                elif message['message_type'] == 'user_conected':
                    user = db.get(Key.from_path('User', message['user_id']))
                    user.current_room = room
                    user.current_session = session
                    user.user_position = [float(message['user_position'][0]), float(message['user_position'][1])]
                    user.put()
                
                elif message['message_type'] == 'cambiar_escenario':
                    session_id = message['session_id']
                    session = db.get( Key.from_path( 'Session', session_id ) )
                    session.escenario = message['escenario']
                    session.put()
                
           #     elif message['type'] == 'userDisconected':
           #         user = db.get(Key.from_path('User', message['userId']))
           #         user.current_room = Null
           #         user.put()
                   
            
                
        
        
        
class GetChannelToken(webapp.RequestHandler):
    def post(self):
        id = self.request.get('id')
        token = channel.create_channel(id)
        
        user = User(key_name = id)
        user.id = id
        user.user_name = id
        user.token = token
        user.put()
        
        
        response = {
            'id': id,
            'token': token
        }
        
        response = simplejson.dumps(response)
        self.response.out.write(response)

class UserDisconnected(webapp.RequestHandler):
    def post(self):
        id = self.request.get('from')
        
        user = db.get(id)
        
        delete(user)

class Get_Map_URL(webapp.RequestHandler):
    def get(self):
        url_image = 'http://maps.googleapis.com/maps/api/streetview'
        size = self.request.get('size')
        location = self.request.get('location')
        heading  = self.request.get('heading')
        fov  = self.request.get('fov')
        pitch  = self.request.get('pitch')
        
        url_image += '?size=' + size
        url_image += '&location=' + location
        url_image += '&heading=' + heading
        url_image += '&fov=' + fov
        url_image += '&pitch='+ pitch
        url_image += '&sensor=false'

        img = db.Blob(urlfetch.Fetch(url_image).content)
        
        self.response.headers['Content-Type'] = "image/jpg"
        self.response.out.write(img)
        

class GetRooms(webapp.RequestHandler):
    def post(self):
        session_id = self.request.get('session_id')
        user_id = self.request.get('user_id')
        
        session = db.get( Key.from_path( 'Session', session_id ) )
        
        #rooms.order('-date_of_creation')
        
        response = {}
        
        contador = 0
        for room in session.rooms:
            if room.collaborative or room.creator == user_id:
                roomResponse = {
                    'id': room.id,
                    'room_type': room.type,
                    'room_collaborative': room.collaborative
                }
                
                #ADD MARKERS
                roomResponse['markers'] = {}
                
                contador_markers = 0
                for marker in room.markers:
                    roomResponse['markers'][str(contador_markers)] = {
                        'marker_id': marker.id,
                        'marker_position': marker.position
                    }
                    
                    contador_markers += 1
                
                
                
                #ADD POLYLINES
                roomResponse['polylines'] = {}
                
                contador_polylines = 0
                for polyline in room.polylines:
                    roomResponse['polylines'][str(contador_polylines)] = {
                        'polyline_id': polyline.id,
                        'polyline_path': polyline.path,
                        'polyline_color': polyline.color,
                        'polyline_weight': polyline.thickness
                    }
                    
                    contador_polylines += 1
                    
                #ADD USERS
                roomResponse['users'] = {}
                
                contador_users = 0
                for user in room.users:
                    roomResponse['users'][str(contador_users)] = {
                        'user_id': user.id,
                        'user_name': user.user_name,
                        'user_position': user.user_position
                    }
                    
                    contador_users += 1
                
                response[str(contador)] = roomResponse
                contador +=1
        
        response = simplejson.dumps(response)
        self.response.out.write(response)
        
class Turn_Rooms(webapp.RequestHandler):
    def post(self):
        session_id = self.request.get('session_id')
        #user_id = self.request.get('user_id')
        from_c = self.request.get('from')
        to_c = self.request.get('to')
        #json = self.request.get('json')
        room_type = self.request.get('room_type')
        
        
        session = db.get( Key.from_path( 'Session', session_id ) )
        
        #to_do CHANGE FOR session.users #
        users = User.all( )
        
        rooms_to_duplicate = session.rooms
        rooms_to_duplicate.filter('type', room_type)
        
        if from_c == 'collaborative' and to_c == 'personal':
            for room in rooms_to_duplicate:
                room.creator = 'no_body'
                room.modified = True
                room.put( )
                
        
        
        
        contador = 0
        for user in users:
            if from_c == 'collaborative' and to_c == 'personal':
                
                for room in rooms_to_duplicate:
                    if room.type == room_type and room.creator == 'no_body':
                    
                        new_room_key_name = get_new_key_name( )
                        new_room = Room( key_name = new_room_key_name )
                        new_room.id = new_room_key_name
                        new_room.creator = user.id
                        new_room.collaborative = False
                        new_room.session = room.session
                        new_room.type = room.type
                        new_room.modified = False
                        new_room.put( )
                        
                    
                        for polyline in room.polylines:
                            
                            new_polyline_key_name = get_new_key_name( )
                            new_polyline = Polyline( key_name = new_polyline_key_name )
                            new_polyline.id = str(new_polyline.key( ) )
                            new_polyline.color = polyline.color
                            new_polyline.path = polyline.path
                            new_polyline.room = new_room
                            new_polyline.thickness = polyline.thickness
                            new_polyline.put( )
                        
                        for marker in room.markers:
                            new_marker_key_name = get_new_key_name( )
                            new_marker = Marker( key_name = new_marker_key_name )
                            new_marker.id = str( new_marker.key( ) )
                            new_marker.position = marker.position
                            new_marker.room = new_room
                            new_marker.name = marker.name
                            new_marker.put( )
                
            elif from_c == 'personal' and to_c == 'collaborative':
                for room in rooms_to_duplicate:
                    if room.modified:
                        room.collaborative = True
                        room.put( )
                    else:
                        room.delete( )
                        
        #for room in rooms_to_duplicate:
        #    if room.creator == 'no_body':
        #        room.delete( )
                    
        
        for user in users:
            response = {}
            response['rooms'] = {}
            
            for room in session.rooms:
                if (from_c == 'personal' and to_c == 'collaborative' and room.type == room_type ) or ( room.type == room_type and room.creator == user.id ):
                    roomResponse = {
                        'id': room.id,
                        'room_type': room.type,
                        'room_collaborative': room.collaborative
                    }
                    
                    #ADD MARKERS
                    roomResponse['markers'] = {}
                    
                    contador_markers = 0
                    for marker in room.markers:
                        roomResponse['markers'][str(contador_markers)] = {
                            'marker_id': marker.id,
                            'marker_position': marker.position
                        }
                        
                        contador_markers += 1
                    
                    
                    
                    #ADD POLYLINES
                    roomResponse['polylines'] = {}
                    
                    contador_polylines = 0
                    for polyline in room.polylines:
                        roomResponse['polylines'][str(contador_polylines)] = {
                            'polyline_id': polyline.id,
                            'polyline_path': polyline.path,
                            'polyline_color': polyline.color,
                            'polyline_weight': polyline.thickness
                        }
                        
                        contador_polylines += 1
                        
                    #ADD USERS
                    roomResponse['users'] = {}
                    
                    contador_users = 0
                    for room_user in room.users:
                        roomResponse['users'][str(contador_users)] = {
                            'user_id': room_user.id,
                            'user_name': room_user.user_name,
                            'user_position': room_user.user_position
                        }
                        
                        contador_users += 1
                    
                    response['rooms'][str(contador)] = roomResponse
                    contador +=1
                    
                    self.response.out.write(response)
            
            response['message_type'] = 'add_rooms'
            response['room_type'] = room_type
            response = simplejson.dumps(response)
            
            channel.send_message( user.id, response )
        
class ImageUploader(webapp.RequestHandler):
    def get(self):
        template_values = { }
        path = os.path.join(os.path.dirname(__file__), 'subirImagen.html')
        self.response.out.write(template.render(path, template_values))
    
    def post(self):
        archivoImagen = self.request.get('imagen')
        #if isinstance(archivoImagen, unicode):
        #    archivoImagen = archivoImagen.encode('utf-8', 'replace')
        imagen = Imagen()
        imagen.src = db.Blob(archivoImagen)
        imagen.put()
        
        key = imagen.key()
        template_values = {'key': key }
        path = os.path.join(os.path.dirname(__file__), 'respuesta.html')
        self.response.out.write(template.render(path, template_values))

class Image(webapp.RequestHandler):
    def get(self,imgId):
    
        #key = Key.from_path("Imagen", imgId[0:-4])
        imagen = db.get(imgId[0:-4])
        #imagen = db.get(key)
        img = images.Image(imagen.src)
        img.resize( width = 200)
                
        if imagen:
            self.response.headers['Content-Type'] = "image/jpg"
            self.response.out.write(img.execute_transforms(output_encoding=images.JPEG))
            
        else:
            self.response.out.write("No image")

class Create_Session(webapp.RequestHandler):
    def post(self):
        session_id = self.request.get('session_id')
        user_id = self.request.get('user_id')
        
        #user_key = Key.from_path( 'User',  user_id )
        #self.response.out.write(user_key)
        
        session = Session( key_name = session_id )
        session.name = session_id
        session.escenario = 'complex'
        session.leader_id = user_id
        session.put()

class Open_Session(webapp.RequestHandler):
    def post(self):
        session_id = self.request.get('session_id')
        user_id = self.request.get('user_id')
        
        #user_key = Key.from_path( 'User',  user_id )
        #self.response.out.write(user_key)
        
        session = db.get( Key.from_path( 'Session', session_id ) )
        
        response = {}
        if session.leader_id == user_id:
            response['session_leader'] = True
        else:
            response['session_leader'] = False
            
        response['escenario'] = session.escenario
            
        response = simplejson.dumps(response)
        self.response.out.write(response)
        
        
            
class TestHandler(webapp.RequestHandler):
    def get(self):
        #READ MESAGE
        json = self.request.get('json')
        userKey  = self.request.get('userkey')
        numMessages = int(self.request.get('nummessages'))
        #counter = 0
        user = db.get(userKey)
        
        getSizeOf = 'mensaje?userKey=' + userKey + 'numMessages=' + str(numMessages) + '&json=' + json
        
        size = sys.getsizeof(getsizeof)
        
        inicio = datetime.now()
        for i in range(numMessages):
            channel.send_message(user.id,json)
        fin = datetime.now()
        
        time = fin - inicio
        
        #1000 - >0.093817
        
        contador = 0
        #inicio = datetime.now()
        #for i in range(numMessages*100):
        #    ahora = datetime.now()
        #    if ahora - inicio > timedelta(seconds=0.093817) and contador == 0:
        #        contador = i
        #        break
            
        #    channel.send_message(user.id,json)
        
        #time = timedelta(seconds=0.093817)
        
        template_values = {'numMessages': numMessages, 'time': time, 'contador': contador, 'size': size}
        path = os.path.join(os.path.dirname(__file__), 'test.html')
        self.response.out.write(template.render(path, template_values))
        
    def post(self):
        #READ MESAGE
        #READ MESAGE
        json = self.request.get('json')
        nUsers = int(self.request.get('number'))
        #hay que cambiar esto para que envie el mensaje a todos los usuarios
        users = User.all().fetch(nUsers-1)
        
        for user in users:
            channel.send_message(user.id, json)
	    channel.send_message('zzz', json)
		

def get_new_key_name( ):
    azar = ['abcdefghijklmnopqrstuvwxyz', '12345678901234567890123456']
    
    key_name = ''
    for i in range(40):
        key_name += azar[random.randint(0,1)][random.randint(0,25)]
    
    return key_name