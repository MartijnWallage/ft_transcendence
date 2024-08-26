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

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        await self.safe_send({
            'type': 'player_role',
            'player_role': self.player_role,
        })

    async def disconnect(self, close_code):
        logger.debug("********** Player disconnected **********")
        
        if PongConsumer.player_A and PongConsumer.player_A['channel_name'] == self.channel_name:
            PongConsumer.player_A = None
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'force_disconnect', 'player_role': 'A'}
            )

        if PongConsumer.player_B and PongConsumer.player_B['channel_name'] == self.channel_name:
            PongConsumer.player_B = None
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'force_disconnect', 'player_role': 'B'}
            )

        # Leave the room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def force_disconnect(self, event):
        # Forcefully close the WebSocket connection
        await self.safe_send({
            'type': 'connection_lost',
        })
        await self.close()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.safe_send({
                'type': 'error',
                'message': 'Invalid JSON data received'
            })
            return

        message_type = data.get('type')

        if message_type == 'connected':
            if self.player_role == 'A':
                PongConsumer.player_A['player'] = data.get('player')
            elif self.player_role == 'B':
                PongConsumer.player_B['player'] = data.get('player')
            await self.broadcast_player_info()

        elif message_type == 'ready':
            if self.player_role == 'A':
                PongConsumer.player_A['ready'] = True
            elif self.player_role == 'B':
                PongConsumer.player_B['ready'] = True
            if PongConsumer.player_A and PongConsumer.player_B and PongConsumer.player_A['ready'] and PongConsumer.player_B['ready']:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {'type': 'game_start'}
                )

        elif message_type == 'score_update':
            if 'score_A' in data:
                PongConsumer.game_data['score_A'] = data['score_A']
            if 'score_B' in data:
                PongConsumer.game_data['score_B'] = data['score_B']
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'new_score',
                    'score_A': PongConsumer.game_data['score_A'],
                    'score_B': PongConsumer.game_data['score_B'],
                }
            )

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
                    'paddle_A': PongConsumer.game_data['paddle_A'],
                    'paddle_B': PongConsumer.game_data['paddle_B'],
                    'ball_x': PongConsumer.game_data['ball_x'],
                    'ball_z': PongConsumer.game_data['ball_z'],
                }
            )

    async def game_state(self, event):
        # Send the updated game state to WebSocket directly
        await self.safe_send({
            'type': 'game_state',
            'paddle_A': event.get('paddle_A', None),
            'paddle_B': event.get('paddle_B', None),
            'ball_x': event.get('ball_x', None),
            'ball_z': event.get('ball_z', None),
        })

    async def game_start(self, event):
        await self.safe_send({
            'type': 'game_start',
        })

    async def broadcast_player_info(self):
        # Broadcast player information to all clients in the group
        if PongConsumer.player_A:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_connected',
                    'player': PongConsumer.player_A['player'],
                    'player_role': PongConsumer.player_A['player_role'],
                    'ready': PongConsumer.player_A['ready']
                }
            )
        
        if PongConsumer.player_B:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_connected',
                    'player': PongConsumer.player_B['player'],
                    'player_role': PongConsumer.player_B['player_role'],
                    'ready': PongConsumer.player_B['ready']
                }
            )

    async def player_connected(self, event):
        # Send player info to WebSocket
        await self.safe_send({
            'type': 'player_connected',
            'player': event['player'],
            'player_role': event['player_role'],
            'ready': event['ready']
        })

    async def new_score(self, event):
        # Send updated scores to WebSocket
        await self.safe_send({
            'type': 'new_score',
            'score_A': event['score_A'],
            'score_B': event['score_B'],
        })

    async def safe_send(self, message):
        # Attempt to send a message and handle disconnections
        try:
            await self.send(text_data=json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
            if self.scope['type'] == 'websocket' and self.channel_name not in self.channel_layer.channels:
                logger.warning("Attempted to send a message to a disconnected client.")
