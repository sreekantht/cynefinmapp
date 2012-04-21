#!/usr/bin/env python
#
#       clases.py
#       
#       Copyright 2009 Julio <Julio@LAPTOP>
#       
#       This program is free software; you can redistribute it and/or modify
#       it under the terms of the GNU General Public License as published by
#       the Free Software Foundation; either version 2 of the License, or
#       (at your option) any later version.
#       
#       This program is distributed in the hope that it will be useful,
#       but WITHOUT ANY WARRANTY; without even the implied warranty of
#       MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#       GNU General Public License for more details.
#       
#       You should have received a copy of the GNU General Public License
#       along with this program; if not, write to the Free Software
#       Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#       MA 02110-1301, USA.

import cgi
import os

#from google.appengine.ext.webapp import template
#from google.appengine.api import users
#from google.appengine.ext import webapp
#from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
#from google.appengine.ext.db import Key
#from reportlab.pdfgen import canvas
#from reportlab.lib.pagesizes import letter
#from reportlab.lib.units import mm, cm
#from reportlab.graphics.barcode import code39 

class Imagen(db.Model):
    """ cod =  """
    src           = db.BlobProperty()

class Session(db.Model):
    name = db.StringProperty( ) 
    leader_key = db.StringProperty()
    leader_id = db.StringProperty()
    escenario = db.StringProperty()

class Room(db.Model):
    """ cod =  """
    id                = db.StringProperty()
    creator           = db.StringProperty()
    type              = db.StringProperty()
    map_position      = db.ListProperty(float)
    map_type_id       = db.StringProperty()
    date_of_creation  = db.DateTimeProperty()
    collaborative     = db.BooleanProperty( )
    modified          = db.BooleanProperty( )
    session           = db.ReferenceProperty(Session,
                                            collection_name = 'rooms')
    
class User(db.Model):
    """ cod =  """
    id        = db.StringProperty()
    user_name  = db.StringProperty()
    token      = db.StringProperty()
    password   = db.StringProperty()
    user_position   = db.ListProperty(float)
    current_room = db.ReferenceProperty(Room,
                                        collection_name = 'users')
    current_session = db.ReferenceProperty(Session,
                                        collection_name = 'users')

class Polyline(db.Model):
    room       = db.ReferenceProperty(Room,
                                      collection_name = 'polylines')
    id         = db.StringProperty()
    color      = db.StringProperty()
    path       = db.StringProperty()
    thickness  = db.StringProperty()

class Marker(db.Model):
    room       = db.ReferenceProperty(Room,
                                      collection_name = 'markers')
    id        = db.StringProperty()
    position  = db.ListProperty(float)

    
    

