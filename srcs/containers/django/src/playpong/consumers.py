import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    # This method is called when a WebSocket connection is established.
    async def connect(self): 
        self.room_group_name = 'chatroom'

        # consumer (client) is joining the group where messages will be broadcasted.
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        # Accepts the WebSocket connection, allowing communication to proceed.
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )


    # seceive function send message 
    # and chat_message check client who triggered the chat_message event?

    async def receive(self, text_data):
        # Parses the incoming message from JSON format.
        text_data_json = json.loads(text_data)
        # Get the msg from the parsed JSON data
        message = text_data_json['message']

        # Send the received message to all cunsumers (clients) in the room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )
    
    # Why chat_message is Necessary
    # it handles that the message is sent to multiple clients (or users) who are part of that group
    async def chat_message(self, event):
        # Receives an event dictionary containing the message (event['message']).
        message = event['message']

        # Sends the message back to the client who triggered the chat_message event.
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))


        # print('Message:', message)
    

# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from asgiref.sync import async_to_sync

# class PongConsumer(AsyncWebsocketConsumer):
#     connected_players = []

#     async def connect(self):
#         self.room_group_name = 'test'

#         async_to_sync(self.channel_layer.group_add)(
#             self.room_group_name,
#             self.channel_name
#         )

#         await self.accept()
#         self.connected_players.append(self)
#         await self.check_player_connection()
#         self.send(text_data=json.dumps){
#             'type':'connection_established',
#             'message':'you are now connected!'
#         }

#     async def disconnect(self, close_code):
#         self.connected_players.remove(self)
#         await self.check_player_connection()

#     async def receive(self, text_data):
       
#         data = json.loads(text_data)
        
#         if data['action'] == 'initiate_remote_play':
#             await self.initiate_remote_play()

#         elif data['type'] == 'game_state':
#             await self.send_game_state(data['payload'])

#         async_to_sync(self.channel_layer.group_send)(
#             self.room_group_name,
#             {
#                 'type':'chat_message',
#                 'message':message
#             }
#         )

#     async def chat_message(self, event):
#         message = event['message']

#         self.send(text_data=json.dumps){
#             'type':'chat',
#             'message':message
#         }

    # async def notify_player_connected(self):
    #     if len(self.connected_players) > 1:
    #         for player in self.connected_players:
    #             if player != self:
    #                 await player.send(text_data=json.dumps({
    #                     'type': 'player_connected'
    #                 }))

    # async def notify_player_disconnected(self):
    #     if len(self.connected_players) == 1:
    #         for player in self.connected_players:
    #             await player.send(text_data=json.dumps({
    #                 'type': 'player_disconnected'
    #             }))

    # async def initiate_remote_play(self):
    #     await self.send(text_data=json.dumps({
    #         'type': 'status',
    #         'message': 'Remote play initiated!'
    #     }))

    # async def send_game_state(self, payload):
    #     for player in self.connected_players:
    #         await player.send(text_data=json.dumps({
    #             'type': 'game_state',
    #             'payload': payload
    #         }))

    # # Example method for checking player connection status
    # async def check_player_connection(self):
    #     if len(self.connected_players) == 2:
    #         # Start the game or take other actions when two players are connected
    #         await self.send(text_data=json.dumps({
    #             'type': 'players_ready'
    #         }))