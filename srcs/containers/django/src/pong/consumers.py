import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):
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
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Receive message from WebSocket
        data = json.loads(text_data)
        message_type = data['type']

        if message_type == 'ready':
            # Broadcast the ready status
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_ready',
                    'player': data['player'],
                }
            )
        elif message_type == 'game_update':
            # Broadcast the game state to the group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_state',
                    'state': data['state']
                }
            )

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