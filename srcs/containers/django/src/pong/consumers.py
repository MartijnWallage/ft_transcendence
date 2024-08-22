from collections import deque
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class PongConsumer(AsyncWebsocketConsumer):
    # Shared across all instances if needed; otherwise, move to instance variables
    players = deque()
    game_data = {
        'paddle_A': 0,
        'paddle_B': 0,
        'ball_x': 0,
        'ball_z': 0,
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
        # await self.broadcast_player_list()

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
            # Update the game state
            if 'paddle_A' in data:
                self.game_data['paddle_A'] = data['paddle_A']
            if 'paddle_B' in data:
                self.game_data['paddle_B'] = data['paddle_B']
            
            # Update ball position
            if 'ball_x' in data:
                self.game_data['ball_x'] = data['ball_x']
            if 'ball_z' in data:
                self.game_data['ball_z'] = data['ball_z']

            # Broadcast the updated game state to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'state': self.game_data
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
        state = event.get('state', {})
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': {
                'paddle_A': state.get('paddle_A', None),
                'paddle_B': state.get('paddle_B', None),
                'ball_x': state.get('ball_x', None),
                'ball_z': state.get('ball_z', None),
            }
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
