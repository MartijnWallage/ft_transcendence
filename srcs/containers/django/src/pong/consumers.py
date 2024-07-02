# pong/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # Check client's IP address
        # client_ip = self.scope['client'][0]
        
        # if client_ip.startswith('10.15.') and client_ip.endswith('.3'):
        #     await self.send(text_data=json.dumps({
        #         'message': 'Second player connected from IP 10.15.*.3'
        #     }))
        # # Log connection or handle initial connection setup here

    async def disconnect(self, close_code):
        # Handle disconnection
        pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            if action == 'initiate_remote_play':
                # Logic to initiate remote play
                # Example: Notify other players, start game, etc.
                await self.send(text_data=json.dumps({
                    'type': 'status',
                    'message': 'Remote play initiated!'
                }))
            else:
                # Handle other actions or unexpected messages
                pass
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
        except KeyError as e:
            print(f"KeyError: {e}")

        # Handle any other processing here
