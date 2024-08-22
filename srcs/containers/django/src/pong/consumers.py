from channels.generic.websocket import AsyncWebsocketConsumer
import json

class PongConsumer(AsyncWebsocketConsumer):
    player_A = None
    player_B = None
    game_data = {
        'paddle_A': 0,
        'paddle_B': 0,
        'ball_x': 0,
        'ball_z': 0,
        'score_A': 0,
        'score_B': 0,
    }

    async def connect(self):
        # Assign player role and save connection information to class-level attributes
        if PongConsumer.player_A is None:
            PongConsumer.player_A = {
                'channel_name': self.channel_name,
                'player': 'Player A',
                'player_role': 'A',
                'ready': False,
            }
            self.player_role = 'A'
        elif PongConsumer.player_B is None:
            PongConsumer.player_B = {
                'channel_name': self.channel_name,
                'player': 'Player B',
                'player_role': 'B',
                'ready': False,
            }
            self.player_role = 'B'
        else:
            # If both player slots are filled, close the connection or handle it accordingly
            await self.close()
            return

        await self.accept()

    async def disconnect(self, close_code):
        # Clear player data on disconnect
        if self.player_role == 'A':
            PongConsumer.player_A = None
        elif self.player_role == 'B':
            PongConsumer.player_B = None

        # Remove player from group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'connected':
            if self.player_role == 'A':
                PongConsumer.player_A['player'] = data.get('player')
            elif self.player_role == 'B':
                PongConsumer.player_B['ready'] = data.get('player')
            await self.broadcast_player_info()

            player_info = {
                'player': data.get('player'),
                'player_role': self.player_role,
                'ready': False,
                'channel_name': self.channel_name
            }
            self.players.append(player_info)

            await self.broadcast_player_list()

        elif message_type == 'game_update':
            # Update paddle positions based on player role
            if self.player_role == 'A' and 'paddle_A' in data:
                PongConsumer.game_data['paddle_A'] = data['paddle_A']
            elif self.player_role == 'B' and 'paddle_B' in data:
                PongConsumer.game_data['paddle_B'] = data['paddle_B']

            # Update ball position if provided
            if 'ball_x' in data and 'ball_z' in data:
                PongConsumer.game_data['ball_x'] = data['ball_x']
                PongConsumer.game_data['ball_z'] = data['ball_z']

            # Broadcast the updated game state to both players
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'state': PongConsumer.game_data
                }
            )

    async def game_state(self, event):
        # Send the updated game state to WebSocket
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

    async def broadcast_player_info(self):
        # Broadcast player information
        if PongConsumer.player_A:
            await self.send_player_info(PongConsumer.player_A)
        if PongConsumer.player_B:
            await self.send_player_info(PongConsumer.player_B)

    async def send_player_info(self, player_info):
        # Send specific player info
        await self.send(text_data=json.dumps({
            'type': 'player_connected',
            'player': player_info['player'],
            'player_role': player_info['player_role'],
            'ready': player_info['ready']
        }))
