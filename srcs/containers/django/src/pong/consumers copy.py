from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging

logger = logging.getLogger(__name__)

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
        self.room_group_name = 'game_room'
        self.player_role = None

        # Assign player role
        if PongConsumer.player_A is None:
            PongConsumer.player_A = self.assign_player('A')
        elif PongConsumer.player_B is None:
            PongConsumer.player_B = self.assign_player('B')
        else:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'player_role',
            'player_role': self.player_role,
        }))

    async def disconnect(self, close_code):
        logger.debug("********** Player disconnected **********")
        
        # Handle player disconnection and clean up
        if self.player_role == 'A':
            PongConsumer.player_A = None
        elif self.player_role == 'B':
            PongConsumer.player_B = None

        # Notify other players to forcefully disconnect
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'force_disconnect'}
        )

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    def assign_player(self, role):
        self.player_role = role
        return {
            'channel_name': self.channel_name,
            'player': f'Player {role}',
            'player_role': role,
            'ready': False,
        }

    async def force_disconnect(self, event):
        # Safely close the WebSocket connection
        await self.close()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send_error('Invalid JSON data received')
            return

        message_type = data.get('type')

        if message_type == 'connected':
            self.handle_connected(data)
        elif message_type == 'ready':
            await self.handle_ready()
        elif message_type == 'score_update':
            await self.handle_score_update(data)
        elif message_type == 'game_update':
            await self.handle_game_update(data)

    async def send_error(self, message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message,
        }))

    def handle_connected(self, data):
        if self.player_role == 'A':
            PongConsumer.player_A['player'] = data.get('player')
        elif self.player_role == 'B':
            PongConsumer.player_B['player'] = data.get('player')
        self.broadcast_player_info()

    async def handle_ready(self):
        if self.player_role == 'A':
            PongConsumer.player_A['ready'] = True
        elif self.player_role == 'B':
            PongConsumer.player_B['ready'] = True
        
        if (PongConsumer.player_A and PongConsumer.player_B and 
                PongConsumer.player_A['ready'] and PongConsumer.player_B['ready']):
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'game_start'}
            )

    async def handle_score_update(self, data):
        PongConsumer.game_data['score_A'] = data.get('score_A', PongConsumer.game_data['score_A'])
        PongConsumer.game_data['score_B'] = data.get('score_B', PongConsumer.game_data['score_B'])
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'new_score',
                'score_A': PongConsumer.game_data['score_A'],
                'score_B': PongConsumer.game_data['score_B'],
            }
        )

    async def handle_game_update(self, data):
        # Update game state based on player role and data received
        if self.player_role == 'A':
            PongConsumer.game_data['paddle_A'] = data.get('paddle_A', PongConsumer.game_data['paddle_A'])
        elif self.player_role == 'B':
            PongConsumer.game_data['paddle_B'] = data.get('paddle_B', PongConsumer.game_data['paddle_B'])

        PongConsumer.game_data['ball_x'] = data.get('ball_x', PongConsumer.game_data['ball_x'])
        PongConsumer.game_data['ball_z'] = data.get('ball_z', PongConsumer.game_data['ball_z'])

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_state',
                'paddle_A': PongConsumer.game_data['paddle_A'],
                'paddle_B': PongConsumer.game_data['paddle_B'],
                'ball_x': PongConsumer.game_data['ball_x'],
                'ball_z': PongConsumer.game_data['ball_z'],
            }
        )

    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'paddle_A': event.get('paddle_A'),
            'paddle_B': event.get('paddle_B'),
            'ball_x': event.get('ball_x'),
            'ball_z': event.get('ball_z'),
        }))

    async def game_start(self, event):
        await self.send(text_data=json.dumps({'type': 'game_start'}))

    async def broadcast_player_info(self):
        for player in [PongConsumer.player_A, PongConsumer.player_B]:
            if player:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'player_connected',
                        'player': player['player'],
                        'player_role': player['player_role'],
                        'ready': player['ready'],
                    }
                )

    async def player_connected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_connected',
            'player': event['player'],
            'player_role': event['player_role'],
            'ready': event['ready'],
        }))

    async def new_score(self, event):
        await self.send(text_data=json.dumps({
            'type': 'new_score',
            'score_A': event['score_A'],
            'score_B': event['score_B'],
        }))
