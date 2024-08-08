import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PingpongConsumer(AsyncWebsocketConsumer):
    connected_players = {}
    max_players = 16  # Set your maximum number of players here

    async def connect(self):
        self.room_group_name = 'pingpong'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        if len(self.__class__.connected_players) < self.__class__.max_players:
            role = f'player{len(self.__class__.connected_players) + 1}'
            self.__class__.connected_players[self.channel_name] = role

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
        if self.channel_name in self.__class__.connected_players:
            role = self.__class__.connected_players.pop(self.channel_name)
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

            if message_type == 'register_player':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'players_ready',
                        'players': self.get_player_status()
                    }
                )

            
            elif message_type == 'start_tournament':
                num_connected_players = len(self.__class__.connected_players)
                if num_connected_players < 2:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'More than 2 players are required to start the tournament'
                    }))
                else:
                    await self.send(text_data=json.dumps({
                        'type': 'start_tournament',
                        'players': self.get_player_status()
                    }))
            
            elif message_type == 'get_player_count':
                player_count = len(self.__class__.connected_players)
                await self.send(text_data=json.dumps({
                    'type': 'player_count',
                    'count': player_count,
                }))

            elif message_type == 'player_action':
                action_data = data.get('data', {})
                self.update_game_state(action_data)
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
        await self.send(text_data=json.dumps({'type': 'player_disconnected', 'role': event['role'], 'players': event['players']}))

    async def player_action(self, event):
        await self.send(text_data=json.dumps({'type': 'player_action', 'data': event['data']}))

    def get_player_status(self):
        return [{'role': role, 'status': 'ready'} for role in self.__class__.connected_players.values()]

    def update_game_state(self, action_data):
        pass

    def get_game_state(self):
        return {}
