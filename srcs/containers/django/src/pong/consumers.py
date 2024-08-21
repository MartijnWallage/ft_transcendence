import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):

    player_counter = 'A'
    player_data = {}  # Dictionary to track player information
    
    async def connect(self):
        self.room_group_name = 'pong_game'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept the WebSocket connection
        await self.accept()

        # Send existing player information to the new player
        await self.send_existing_players()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Remove player from the player data
        player_to_remove = None
        for player, channel in self.player_data.items():
            if channel == self.channel_name:
                player_to_remove = player
                break

        if player_to_remove:
            del self.player_data[player_to_remove]

            # Notify other players about the disconnection
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_disconnected',
                    'player': player_to_remove,
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'connected':
            # Assign player and send player information to the group
            player_role = self.player_counter
            self.player_counter = 'B' if self.player_counter == 'A' else 'A'
            
            player_name = data.get('player')
            self.player_data[player_name] = self.channel_name

            # Broadcast the connected player
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_connected',
                    'player': player_name,
                    'player_role': player_role,
                }
            )
        
        elif message_type == 'ready':
            # Broadcast the ready status
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_ready',
                    'player': data.get('player'),
                }
            )
            
        elif message_type == 'game_update':
            # Broadcast the game state to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'state': data.get('state')
                }
            )

    async def send_existing_players(self):
        for player, channel in self.player_data.items():
            # Send each existing player to the new player
            await self.send(text_data=json.dumps({
                'type': 'player_connected',
                'player': player,
                'player_role': 'A' if self.player_data[player] == 'A' else 'B'
            }))

    async def player_connected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_connected',
            'player': event['player'],
            'player_role': event['player_role']
        }))

    async def player_ready(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_ready',
            'player': event['player']
        }))

    async def player_disconnected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_disconnected',
            'player': event['player']
        }))

    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'state': event['state']
        }))
