import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):

    player_counter = 'A'
    player_data = {}  # Dictionary to track player information
    
    async def connect(self):
        self.room_group_name = 'pong_game'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        player_role = self.player_counter
        self.player_counter = 'B' if self.player_counter == 'A' else 'A'

        player_name = f"Player {player_role}"
        self.player_data[player_name] = {
            'channel_name': self.channel_name,
            'player_role': player_role,
            'ready': False,  # Initially not ready
        }

        await self.send_existing_players()

    async def disconnect(self, close_code):
        player_to_remove = None
        for player, data in self.player_data.items():
            if data['channel_name'] == self.channel_name:
                player_to_remove = player
                break

        if player_to_remove:
            del self.player_data[player_to_remove]

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_disconnected',
                    'player': player_to_remove,
                }
            )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'connected':
            player_name = data.get('player')
            self.player_data[player_name]['player_role'] = self.player_counter

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_connected',
                    'player': player_name,
                    'player_role': self.player_data[player_name]['player_role'],
                }
            )
        
        elif message_type == 'ready':
            player_name = data.get('player')
            self.player_data[player_name]['ready'] = True  # Mark the player as ready

            # Check if all players are ready
            if all(player_info['ready'] for player_info in self.player_data.values()):
                # Broadcast start message if all players are ready
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'start_game',
                    }
                )
            else:
                # Broadcast the ready status to others
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'player_ready',
                        'player': player_name,
                    }
                )
            
        elif message_type == 'game_update':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'state': data.get('state')
                }
            )

    async def send_existing_players(self):
        for player, data in self.player_data.items():
            await self.send(text_data=json.dumps({
                'type': 'player_connected',
                'player': player,
                'player_role': data['player_role'],
                'ready': data['ready'],
            }))

    async def player_connected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_connected',
            'player': event['player'],
            'player_role': event['player_role'],
        }))

    async def player_ready(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_ready',
            'player': event['player']
        }))

    async def start_game(self, event):
        # Send the start message to all players
        await self.send(text_data=json.dumps({
            'type': 'start'
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
