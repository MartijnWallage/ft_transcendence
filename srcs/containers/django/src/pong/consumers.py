import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .ball import Ball  # Ensure the correct path
from .paddle import Paddle  # Ensure the correct path

class PingpongConsumer(AsyncWebsocketConsumer):
    connected_players = {}
    max_players = 16  # Set your maximum number of players here
    ball = None
    paddles = {}
    court_width = 10  # Example width, adjust as needed
    court_depth = 5   # Example depth, adjust as needed

    async def connect(self):
        self.room_group_name = 'pingpong'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        try:
            await self.accept()

            if len(self.__class__.connected_players) < self.__class__.max_players:
                player_number = len(self.__class__.connected_players) + 1
                player_name = f'player{player_number}'
                role = f'player{player_number}'
                self.__class__.connected_players[self.channel_name] = {
                    'name': player_name,
                    'role': role,
                    'isRemote': True
                }

                # Initialize the game objects if this is the first player
                if not self.__class__.ball:
                    self.__class__.ball = Ball()
                    self.__class__.paddles['player1'] = Paddle(self.__class__.court_width, left=True)
                    self.__class__.paddles['player2'] = Paddle(self.__class__.court_width, left=False)

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'player_connected',
                        'players': await self.get_player_status()
                    }
                )
            else:
                await self.close()

        except Exception as e:
            print(f"Error during WebSocket connection setup: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        if self.channel_name in self.__class__.connected_players:
            player_info = self.__class__.connected_players.pop(self.channel_name)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_disconnected',
                    'role': player_info['role'],
                    'players': await self.get_player_status()
                }
            )



    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')

            if message_type == 'load_page':
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'load_page',
                        'player': self.__class__.connected_players[self.channel_name]['name']
                    }
                )

            elif message_type == 'enter_pressed':
                self.__class__.connected_players[self.channel_name]['ready'] = True
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'enter_pressed',
                        'player': self.__class__.connected_players[self.channel_name]['name']
                    }
                )
           
            elif message_type == 'key_update':
                action_data = data
                self.update_game_state(action_data)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_state_update',
                        'game_state': self.get_game_state()
                    }
                )

            elif message_type == 'player_action':
                action_data = data.get('data', {})
                self.update_game_state(action_data)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_state_update',
                        'game_state': self.get_game_state()
                    }
                )
            else:
                await self.send(text_data=json.dumps({
                    'error': f'Unsupported message type: {message_type}'
                }))

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON data received'}))
        except Exception as e:
            await self.send(text_data=json.dumps({'error': f'An unexpected error occurred: {str(e)}'}))
            print(f"Error handling message: {str(e)}")

    async def load_page(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'load_page',
                'player': event['player']
            }))
        except Exception as e:
            print(f"Error sending load_page message: {str(e)}")

    async def enter_pressed(self, event):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'enter_acknowledged',
                'player': event['player']
            }
        )

    async def enter_acknowledged(self, event):
        await self.send(text_data=json.dumps({
            'type': 'enter_acknowledged',
            'player': event['player']
        }))
    
    async def player_connected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_connected', 
            'players': event['players']
        }))

    async def player_disconnected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_disconnected', 
            'role': event['role'], 
            'players': event['players']
        }))

    async def get_player_status(self):
        return [
            {'name': player_info['name'], 
             'role': player_info['role'], 
             'isRemote': player_info['isRemote']}
            for player_info in self.__class__.connected_players.values()
        ]
    
    async def player_action(self, event):
        await self.send(text_data=json.dumps({'type': 'player_action', 'data': event['data']}))

    def update_game_state(self, action_data):
        player = action_data.get('player')
        if player in self.__class__.paddles:
            if action_data['type'] == 'key_update':
                # Update paddle movement based on key input
                direction = action_data.get('key', '')
                if direction == 'a':
                    self.__class__.paddles[player].movePaddle(-1, self.__class__.court_depth)
                elif direction == 'd':
                    self.__class__.paddles[player].movePaddle(1, self.__class__.court_depth)
            elif action_data['type'] == 'touch_update':
                # Handle touch inputs similarly if needed
                pass

        self.__class__.ball.tryPaddleCollision(self.__class__.paddles.get('player1'), self.__class__.paddles.get('player2'))
        self.__class__.ball.tryCourtCollision(self.__class__.court_depth)
        self.__class__.ball.animateBall()

    def get_game_state(self):
        return {
            'ball_position': {
                'x': self.__class__.ball.x,
                'z': self.__class__.ball.z,
            },
            'paddles': {
                'player1': {
                    'x': self.__class__.paddles['player1'].x,
                    'z': self.__class__.paddles['player1'].z,
                },
                'player2': {
                    'x': self.__class__.paddles['player2'].x,
                    'z': self.__class__.paddles['player2'].z,
                }
            }
        }
    
    async def game_state_update(self, event):
        """Handler for game_update events to send updated game state to clients."""
        await self.send(text_data=json.dumps({
            'type': 'game_update',
            'game_state': event['game_state']
        }))
    
