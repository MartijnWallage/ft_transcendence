from collections import deque
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class PongConsumer(AsyncWebsocketConsumer):

    players = deque()  # Deque to store players' information
    game_state = {
        'paddle_A': {'x': 0, 'y': 0},
        'paddle_B': {'x': 0, 'y': 0},
        'ball': {'x': 0, 'y': 0}
    }
    
    async def connect(self):
        # Assign the room group name to share state between two players
        self.room_group_name = 'pong_game'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Determine player role based on the number of connected players
        if len(self.players) % 2 == 0:
            self.player_role = 'A'
        else:
            self.player_role = 'B'

        await self.accept()

    async def disconnect(self, close_code):
        # Remove player from the deque and broadcast updated list
        self.players = deque(player for player in self.players if player['channel_name'] != self.channel_name)

        # Broadcast the updated player list to everyone
        await self.broadcast_player_list()

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Receive message from WebSocket
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'connected':
            # Add player to the deque
            player_info = {
                'player': data.get('player'),
                'player_role': self.player_role,
                'ready': False,
                'channel_name': self.channel_name
            }
            self.players.append(player_info)

            # Broadcast the updated player list to everyone
            await self.broadcast_player_list()

        elif message_type == 'ready':
            # Set player ready status to True
            for player in self.players:
                if player['channel_name'] == self.channel_name:
                    player['ready'] = True
                    break

            # Broadcast the updated player list to everyone
            await self.broadcast_player_list()

        elif message_type == 'game_update':
            # Broadcast the game state to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'state': data.get('state')
                }
            )
        
        elif message_type == 'game_update':
            # Update the game state based on the player's role
            if self.player_role == 'A':
                self.game_state['paddle_A'] = data.get('paddle_position', self.game_state['paddle_A'])
            else:
                self.game_state['paddle_B'] = data.get('paddle_position', self.game_state['paddle_B'])

            # Update the ball position (this can be done by any player or a game loop on the server)
            if 'ball_position' in data:
                self.game_state['ball'] = data['ball_position']

            # Broadcast the updated game state to all players
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'state': self.game_state
                }
            )

    async def player_info(self, event):
        # Send the player's data to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'player_connected',
            'player': event['player'],
            'player_role': event['player_role'],
            'ready': event['ready']
        }))

    async def game_state(self, event):
        # Send the game state to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': event['state']
        }))

    async def broadcast_player_list(self):
        # Broadcast each player's data separately to everyone in the group
        for player in self.players:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_info',
                    'player': player['player'],
                    'player_role': player['player_role'],
                    'ready': player['ready']
                }
            )
