import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PingpongConsumer(AsyncWebsocketConsumer):
    connected_players = 0
    player_roles = {}

    async def connect(self):
        self.room_group_name = 'pingpong'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        if self.__class__.connected_players < 16:
            self.__class__.connected_players += 1
            role = f'player{self.__class__.connected_players}'
            self.__class__.player_roles[self.channel_name] = role

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'players_ready',
                    'players': self.get_player_status()
                }
            )
        else:
            await self.close() 

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        self.__class__.connected_players -= 1
        if self.channel_name in self.__class__.player_roles:
            role = self.__class__.player_roles.pop(self.channel_name)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_disconnected',
                    'role': role,
                    'players': self.get_player_status()
                }
            )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')

            if message_type == 'initiate_remote_play':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'players_ready',
                        'players': self.get_player_status()
                    }
                )
            elif message_type == 'player_action':
                # Process the player's action
                action_data = data.get('data', {})
                self.update_game_state(action_data)  # Update the game state

                # Broadcast the updated game state to all clients
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_update',
                        'game_state': self.get_game_state()
                    }
                )
            else:
                await self.send(text_data=json.dumps({
                    'error': f'Unsupported message type: {message_type}'
                }))

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON data received'}))

    async def players_ready(self, event):
        await self.send(text_data=json.dumps({'type': 'players_ready', 'players': event['players']}))

    async def player_disconnected(self, event):
        await self.send(text_data=json.dumps({'type': 'player_disconnected', 'players': event['players']}))

    async def player_action(self, event):
        await self.send(text_data=json.dumps({'type': 'player_action', 'data': event['data']}))

    def get_player_status(self):
        return [{'role': role, 'status': 'ready'} for role in self.__class__.player_roles.values()]

    def update_game_state(self, action_data):
        # Implement your game state update logic here
        pass

    def get_game_state(self):
        # Implement your logic to retrieve the current game state here
        return {}


# import json
# from channels.generic.websocket import AsyncWebsocketConsumer

# class PingpongConsumer(AsyncWebsocketConsumer):
#     connected_players = 0
#     player_roles = {}

#     async def connect(self):
#         self.room_group_name = 'pingpong'
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
#         await self.accept()

#         if self.__class__.connected_players < 2:
#             self.__class__.connected_players += 1
#             role = 'first' if self.__class__.connected_players == 1 else 'second'
#             self.__class__.player_roles[self.channel_name] = role

#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'players_ready',
#                     'players': self.get_player_status()
#                 }
#             )
#         else:
#             await self.close()  # No more than two players allowed

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )
#         self.__class__.connected_players -= 1
#         if self.channel_name in self.__class__.player_roles:
#             role = self.__class__.player_roles.pop(self.channel_name)
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'player_disconnected',
#                     'role': role,
#                     'players': self.get_player_status()
#                 }
#             )

#     async def receive(self, text_data):
#         try:
#             data = json.loads(text_data)
#             message_type = data.get('type', '')

#             if message_type == 'initiate_remote_play':
#                 await self.channel_layer.group_send(
#                     self.room_group_name,
#                     {
#                         'type': 'players_ready',
#                         'players': self.get_player_status()
#                     }
#                 )
#             elif message_type == 'player_action':
#                 # Process the player's action
#                 action_data = data.get('data', {})
#                 self.update_game_state(action_data)  # Update the game state

#                 # Broadcast the updated game state to all clients
#                 await self.channel_layer.group_send(
#                     self.room_group_name,
#                     {
#                         'type': 'game_update',
#                         'game_state': self.get_game_state()
#                     }
#                 )
#             else:
#                 await self.send(text_data=json.dumps({
#                     'error': f'Unsupported message type: {message_type}'
#                 }))

#         except json.JSONDecodeError:
#             await self.send(text_data=json.dumps({'error': 'Invalid JSON data received'}))


#     async def players_ready(self, event):
#         await self.send(text_data=json.dumps({'type': 'players_ready', 'players': event['players']}))

#     async def player_disconnected(self, event):
#         await self.send(text_data=json.dumps({'type': 'player_disconnected', 'players': event['players']}))

#     async def player_action(self, event):
#         await self.send(text_data=json.dumps({'type': 'player_action', 'data': event['data']}))

#     def get_player_status(self):
#         return [{'role': role, 'status': 'ready'} for role in self.__class__.player_roles.values()]



