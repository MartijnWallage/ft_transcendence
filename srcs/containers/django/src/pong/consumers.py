from channels.generic.websocket import AsyncWebsocketConsumer
import json

class PongConsumer(AsyncWebsocketConsumer):
    # Shared across all instances
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
        self.room_group_name = 'pong_game'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        if not self.player_A:
            self.player_role = 'A'
            self.player_A = self.channel_name
            await self.accept()
            await self.send(text_data=json.dumps({
                'type': 'connection_accepted',
                'player_role': 'A',
            }))
        elif not self.player_B:
            self.player_role = 'B'
            self.player_B = self.channel_name
            await self.accept()
            await self.send(text_data=json.dumps({
                'type': 'connection_accepted',
                'player_role': 'B',
            }))
        else:
            # If both player slots are taken, reject the connection
            await self.close()

    async def disconnect(self, close_code):
        if self.channel_name == self.player_A:
            self.player_A = None
        elif self.channel_name == self.player_B:
            self.player_B = None

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'game_update':
            if self.player_role == 'A' and 'paddle_A' in data:
                self.game_data['paddle_A'] = data['paddle_A']
            elif self.player_role == 'B' and 'paddle_B' in data:
                self.game_data['paddle_B'] = data['paddle_B']

            if 'ball_x' in data:
                self.game_data['ball_x'] = data['ball_x']
            if 'ball_z' in data:
                self.game_data['ball_z'] = data['ball_z']

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'state': self.game_data
                }
            )

    async def game_state(self, event):
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
