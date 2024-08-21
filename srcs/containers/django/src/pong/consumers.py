import json
from collections import deque
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):

    players = deque()  # Deque to store players' information
    player_role = 'A'
    
    async def connect(self):
        # Assign the room group name to share state between two players
        self.room_group_name = 'pong_game'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

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

            # Alternate player role for the next connection
            self.player_role = 'B' if self.player_role == 'A' else 'A'

            # Broadcast the updated player list to everyone
            await self.broadcast_player_list()

        elif message_type == 'ready':
            # Set player ready status to True
            for player in self.players:
                if player['channel_name'] == self.channel_name:
                    player['ready'] = True
                    break

            # Check if all players are ready
            if all(player['ready'] for player in self.players):
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_start',
                    }
                )

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

    async def player_connected(self, event):
        # Send the connected status to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'player_connected',
            'player': event['player'],
            'player_role': event['player_role']
        }))

    async def player_ready(self, event):
        # Send the ready status to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'player_ready',
            'player': event['player']
        }))

    async def game_state(self, event):
        # Send the game state to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': event['state']
        }))

    async def game_start(self, event):
        # Send the game start signal to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'start',
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

    async def player_info(self, event):
    # Send the player's data to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'player_info',
            'player': event['player'],
            'player_role': event['player_role'],
            'ready': event['ready']
        }))