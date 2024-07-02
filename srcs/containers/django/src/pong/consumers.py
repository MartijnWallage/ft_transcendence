

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):
    connected_players = []

    async def connect(self):
        self.connected_players.append(self)
        await self.accept()
        if len(self.connected_players) > 1:
            for player in self.connected_players:
                await player.send(text_data=json.dumps({
                    'type': 'player_connected'
                }))

    async def disconnect(self, close_code):
        self.connected_players.remove(self)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'hello':
            await self.send(text_data=json.dumps({
                'type': 'status',
                'message': 'Remote play initiated!'
            }))
        elif data['type'] == 'game_state':
            for player in self.connected_players:
                if player != self:
                    await player.send(text_data=json.dumps({
                        'type': 'game_state',
                        'payload': data['payload']
                    }))
