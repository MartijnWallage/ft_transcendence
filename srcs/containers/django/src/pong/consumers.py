import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PingpongConsumer(AsyncWebsocketConsumer):
    connected_players = 0

    async def connect(self):
        self.room_group_name = 'pingpong'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        self.__class__.connected_players += 1
        self.is_first_player = self.__class__.connected_players == 1
        self.is_second_player = not self.is_first_player
        
        if self.__class__.connected_players <= 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'players_ready',
                    'role': 'first' if self.is_first_player else 'second'
                }
            )
        else:
            # If there are more than 2 players, close the connection
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        self.__class__.connected_players -= 1
        # if self.is_first_player or self.is_second_player:
        #     await self.channel_layer.group_send(
        #         self.room_group_name,
        #         {
        #             'type': 'player_disconnected',
        #             'role': 'first' if self.is_first_player else 'second'
        #         }
        #     )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')
            payload = data.get('data', {})

            if message_type == 'player_ready':
                role = 'first' if self.is_first_player else 'second'
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'players_ready',
                        'role': role
                    }
                )

            
            elif message_type == 'player_action':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'player_action',
                        'data': payload
                    }
                )
            
            # # Add handling for 'player_ready' message type
            # elif message_type == 'player_ready':
            #     # Update the state or do something when a player is ready
            #     role = 'first' if self.is_first_player else 'second'
            #     await self.channel_layer.group_send(
            #         self.room_group_name,
            #         {
            #             'type': 'players_ready',
            #             'role': role
            #         }
            #     )

            else:
                await self.send(text_data=json.dumps({
                    'error': f'Unsupported message type: {message_type}'
                }))
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON data received'
            }))

    async def players_ready(self, event):
        role = event.get('role', '')
        if role in ['first', 'second']:
            await self.send(text_data=json.dumps({
                'type': 'players_ready',
                'role': role
            }))
        else:
            print("Unknown or missing 'role' in event data:", event)

    async def player_action(self, event):
        data = event['data']
        await self.send(text_data=json.dumps({
            'type': 'player_action',
            'data': data
        }))


# class ChatConsumer(AsyncWebsocketConsumer):
#     # This method is called when a WebSocket connection is established.
#     async def connect(self): 
#         self.room_group_name = 'chatroom'

#         # consumer (client) is joining the group where messages will be broadcasted.
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
#         # Accepts the WebSocket connection, allowing communication to proceed.
#         await self.accept()

#     async def disconnect(self, close_code):
#         # Leave room group
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )


#     # seceive function send message 
#     # and chat_message check client who triggered the chat_message event?

#     async def receive(self, text_data):
#         try:
#             # Parses the incoming message from JSON format.
#             text_data_json = json.loads(text_data)
#             # Get the message from the parsed JSON data
#             message = text_data_json['message']

#             # Send the received message to all consumers (clients) in the room group
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'chat_message',
#                     'message': message
#                 }
#             )
#         except KeyError:
#             # Handle the case where 'message' key is missing
#             await self.send(text_data=json.dumps({
#                 'error': 'No message key in WebSocket data'
#             }))
#         except json.JSONDecodeError:
#             # Handle invalid JSON
#             await self.send(text_data=json.dumps({
#                 'error': 'Invalid JSON data received'
#             }))
    
#     # Why chat_message is Necessary
#     # it handles that the message is sent to multiple clients (or users) who are part of that group
#     async def chat_message(self, event):
#         # Receives an event dictionary containing the message (event['message']).
#         message = event['message']

#         # Sends the message back to the client who triggered the chat_message event.
#         await self.send(text_data=json.dumps({
#             'type': 'chat_message',
#             'message': message
#         }))

