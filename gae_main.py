#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from vistas import *
from clases import *


def main():
    application = webapp.WSGIApplication(
                                     [('/',      MainHandler),
                                      ('/image', ImageUploader),
                                      ('/imagenes/(.*)', Image),
                                      ('/mensaje', MessageHandler),
                                      ('/getchanneltoken', GetChannelToken),
                                      ('/getrooms', GetRooms),
                                      ('/_ah/channel/disconnected/', UserDisconnected),
                                      ('/test', TestHandler),
                                      ('/get_map_url', Get_Map_URL),
                                      ('/crear_sesion', Create_Session),
                                      ('/abrir_sesion', Open_Session),
                                      ('/turn_rooms', Turn_Rooms),

                                      ],
                                     debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
