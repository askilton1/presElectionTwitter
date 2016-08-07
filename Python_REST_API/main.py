# Copyright 2013 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
Script for PoliTweets REST API

Based on Google App Engine example script
"""

# [START all]

import os

import MySQLdb
import MySQLdb.cursors
import webapp2

import json
import collections

import logging
from google.appengine.api import memcache


CLOUDSQL_PROJECT = #PROJECT
CLOUDSQL_REGION = #REGION
CLOUDSQL_INSTANCE = #INSTANCE

# CONNECTION PARAMS
UNIX_SOCKET = '/cloudsql/{}:{}:{}'.format(CLOUDSQL_PROJECT, 
                                          CLOUDSQL_REGION,
                                          CLOUDSQL_INSTANCE)
USER = #USER
PASSWD = #PASSWORD
DB = #DATABASE

"""
Connect to the MySQL database
"""
def connect_to_db():
    # When running on Google App Engine, use the special unix socket
    # to connect to Cloud SQL.
    if os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/'):
        db = MySQLdb.connect(unix_socket=UNIX_SOCKET, 
                             user=USER,
                             passwd=PASSWD, 
                             db=DB,
                             cursorclass = MySQLdb.cursors.SSCursor)
    # When running locally, you can either connect to a local running
    # MySQL instance, or connect to your Cloud SQL instance over TCP.
    else:
        db = MySQLdb.connect(host='localhost', user='root')

    return db

"""
Prepare the information from MySQL to be returned as JSON
"""
def prep_for_json(entry):
    
    row_dict = collections.OrderedDict()
    row_dict['text'] = str(entry[0])
    row_dict['favoriteCount'] = int(entry[1])
    row_dict['created'] = str(entry[2])
    row_dict['id'] = int(entry[3])
    row_dict['statusSource'] = str(entry[4])
    row_dict['screenName'] = str(entry[5])
    row_dict['retweetCount'] = int(entry[6])
    row_dict['isRetweet'] = int(entry[7])
    row_dict['day'] = str(entry[8])
    row_dict['sandersCampaign'] = int(entry[9])
    row_dict['clintonCampaign'] = int(entry[10])
    row_dict['carsonCampaign'] = int(entry[11])
    row_dict['omalleyCampaign'] = int(entry[12])
    row_dict['grahamCampaign'] = int(entry[13])
    row_dict['bushCampaign'] = int(entry[14])
    row_dict['trumpCampaign'] = int(entry[15])
    row_dict['steinCampaign'] = int(entry[16])
    row_dict['christieCampaign'] = int(entry[17])
    row_dict['kasichCampaign'] = int(entry[18])
    row_dict['dow'] = str(entry[19])
    row_dict['hr'] = int(entry[20])
    row_dict['weekend'] = int(entry[21])
    row_dict['timeOfDay'] = str(entry[22])
    row_dict['debateGOP'] = int(entry[23])
    row_dict['debateDem'] = int(entry[24])
    row_dict['conventionGOP'] = int(entry[25])
    row_dict['conventionDem'] = int(entry[26])
    row_dict['healthcare'] = int(entry[27])
    row_dict['nameCallingDonald'] = int(entry[28])
    row_dict['raceDonald'] = int(entry[29])
    row_dict['bigBusinessAndBanks'] = int(entry[30])
    row_dict['sadDonald'] = int(entry[31])
    row_dict['tweetLength'] = int(entry[32])
    row_dict['hashtag'] = int(entry[33])
    row_dict['rtFavRatio'] = int(entry[34])

    return row_dict


"""
Page to get all tweets in table
"""
class MainPage(webapp2.RequestHandler):
    def get(self):
        self.response.write("Hello, World!")

"""
Page to get tweets from a particular user
"""
class UserPage(webapp2.RequestHandler):
    def get(self, user_name):
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers['Content-Type'] = 'application/json'

        # Get number of records in memcache, if any
        data_max = memcache.get(user_name + "_count")
        
        update_memcache = True
        cache_data = {}

        # Check that memcache is valid
        if data_max is not None:
            cache_keys = [str(x) for x in xrange(data_max + 1)]
            cache_data = memcache.get_multi(keys=cache_keys, key_prefix=user_name + "_")
            update_memcache = len(cache_data.keys()) != (data_max + 1)
            if update_memcache:
                logging.info('Memcache not valid for ' + user_name + ' updating from MySQL')
                logging.info(str((data_max + 1) - len(cache_data.keys())))

        # Get data from MySQL and update memcache
        if update_memcache:

            db = connect_to_db()
            cursor = db.cursor()

            # Default behavior (show all usernames)
            if (user_name == ""):
                cursor.execute("""SELECT DISTINCT screenName FROM compiled""")

                count = 0
                cache_dict = {}
                for r in cursor:
                    output = str(r[0]) + "\n"
                    cache_dict[str(count)] = output
                    self.response.write(output)
                    count += 1

                memcache.set_multi(mapping=cache_dict, time=3600, key_prefix=user_name + "_")
                memcache.set(key=user_name + "_count", value=count, time=3600)

            # Fetch data from MySQL for a specific user
            else:
                cursor.execute("""SELECT * FROM compiled WHERE screenName=%s""", (user_name,))

                start = True
                count = 0
                cache_dict = {}
                for r in cursor:
                    output = ""
                    
                    if start:
                        output += "["
                        self.response.write("[")
                        start = False
                    else:
                        output += ","
                        self.response.write(",")
                    
                    json_dump = json.dumps(prep_for_json(r), indent=None, separators=(',',':'), ensure_ascii=False)
                    output += json_dump
                    self.response.write(json_dump)

                    cache_dict[str(count)] = output
                    count += 1
                
                output = "]"
                self.response.write("]")
                cache_dict[str(count)] = output

                memcache.set_multi(mapping=cache_dict, time=3600, key_prefix=user_name + "_")
                memcache.set(key=user_name + "_count", value=count, time=3600)

            cursor.close()
            db.close()

        # Use data from memcache
        else:
            logging.info("Memcache is valid for " + user_name)
            page_body = ""
            key_list = cache_data.keys()
            key_list.sort(key=int)
            for key in key_list:
                page_body += cache_data[key]
            self.response.write(page_body)


"""
Routing information
"""
app = webapp2.WSGIApplication([
    webapp2.Route(r'/', handler=MainPage, name='main-page'),
    webapp2.Route(r'/user/<user_name:(\w*)>', handler=UserPage, name='user-page')
], debug=True)

# [END all]
