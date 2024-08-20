import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PingpongConsumer(AsyncWebsocketConsumer):
    connected_players = {}
    max_players = 16  # Set your maximum number of players here

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
            # Handle and log connection errors
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
                # Notify other player to load the page
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'load_page',
                        'player': self.__class__.connected_players[self.channel_name]['name']
                    }
                )

            elif message_type == 'enter_pressed':
                # Update player readiness state
                self.__class__.connected_players[self.channel_name]['ready'] = True
                
                # Broadcast readiness to all players
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'enter_pressed',
                        'player': self.__class__.connected_players[self.channel_name]['name']
                    }
                )

            # if message_type == 'register_player':
            #     player_name = data.get('name', '')
            #     if player_name and not self.is_player_name_taken(player_name):
            #         # Assign the player name to the connecting player
            #         self.__class__.connected_players[self.channel_name] = {
            #             'name': player_name,
            #             'role': 'player',  # Default role; you may want to assign based on game rules
            #             'isRemote': True
            #         }
            #         await self.channel_layer.group_send(
            #             self.room_group_name,
            #             {
            #                 'type': 'player_connected',
            #                 'players': await self.get_player_status()
            #             }
            #         )
            #         await self.send(text_data=json.dumps({'type': 'registration_success', 'name': player_name}))
            #     else:
            #         await self.send(text_data=json.dumps({
            #             'type': 'error',
            #             'message': 'Player name is already taken or invalid'
            #         }))

            # if message_type == 'start_tournament':
            #     player_info = self.__class__.connected_players.get(self.channel_name)
            #     if player_info and player_info['role'] == 'player1':
            #         num_connected_players = len(self.__class__.connected_players)
            #         if num_connected_players < 2:
            #             await self.send(text_data=json.dumps({
            #                 'type': 'error',
            #                 'message': 'More than 2 players are required to start the tournament'
            #             }))
            #         else:
            #             # Broadcast to all players
            #             await self.channel_layer.group_send(
            #                 self.room_group_name,
            #                 {
            #                     'type': 'start_tournament',
            #                     'players': await self.get_player_status()
            #                 }
            #             )
            #     else:
            #         await self.send(text_data=json.dumps({
            #             'type': 'error',
            #             'message': 'Only player1 can start the tournament'
            #         }))

            # elif message_type == 'get_player_count':
            #     player_count = len(self.__class__.connected_players)
            #     await self.send(text_data=json.dumps({
            #         'type': 'player_count',
            #         'count': player_count,
            #     }))

            elif message_type == 'player_action':
                action_data = data.get('data', {})
                self.update_game_state(action_data)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_update',
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
            # Optionally, log the error to server logs
            print(f"Error handling message: {str(e)}")

    async def load_page(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'load_page',
                'player': event['player']
            }))
        except Exception as e:
            # Log the error or handle it as needed
            print(f"Error sending load_page message: {str(e)}")

    async def enter_pressed(self, event):
        # Broadcast the 'enter_pressed' event to all players
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'enter_acknowledged',
                'player': event['player']
            }
        )

    async def enter_acknowledged(self, event):
        # Handle the 'enter_acknowledged' message
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
        print("Current player status:", [
            {'name': player_info['name'], 
             'role': player_info['role'], 
             'isRemote': player_info['isRemote']}
            for player_info in self.__class__.connected_players.values()
        ])
        return [
            {'name': player_info['name'], 
             'role': player_info['role'], 
             'isRemote': player_info['isRemote']}
            for player_info in self.__class__.connected_players.values()
        ]
    

    async def player_action(self, event):
        await self.send(text_data=json.dumps({'type': 'player_action', 'data': event['data']}))

    def update_game_state(self, action_data):
        pass

    def get_game_state(self):
        return {}

