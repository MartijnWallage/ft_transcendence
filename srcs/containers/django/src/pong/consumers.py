# pong/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # Check client's IP address
        client_ip = self.scope['client'][0]
        
        if client_ip.startswith('10.15.') and client_ip.endswith('.3'):
            await self.send(text_data=json.dumps({
                'message': 'Second player connected from IP 10.15.*.3'
            }))
        # Log connection or handle initial connection setup here

    async def disconnect(self, close_code):
        # Handle disconnection
        pass

    async def receive(self, text_data):
        # Handle incoming messages
        pass
