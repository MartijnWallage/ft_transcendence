class PongConsumer(AsyncWebsocketConsumer):
    # Shared across all instances
    players = deque()
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

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Determine player role based on the number of connected players
        if len(self.players) % 2 == 0:
            self.player_role = 'A'
        else:
            self.player_role = 'B'

        await self.accept()

    async def disconnect(self, close_code):
        # Properly remove the player from the deque
        self.players = deque(player for player in self.players if player['channel_name'] != self.channel_name)
        
        # Broadcast the updated player list
        await self.broadcast_player_list()

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'connected':
            player_info = {
                'player': data.get('player'),
                'player_role': self.player_role,
                'ready': False,
                'channel_name': self.channel_name
            }
            self.players.append(player_info)

            await self.broadcast_player_list()

        elif message_type == 'ready':
            for player in self.players:
                if player['channel_name'] == self.channel_name:
                    player['ready'] = True
                    break
            await self.broadcast_player_list()

        elif message_type == 'game_update':
            if 'paddle_A' in data:
                self.game_data['paddle_A'] = data['paddle_A']
            if 'paddle_B' in data:
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

    async def player_info(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_connected',
            'player': event['player'],
            'player_role': event['player_role'],
            'ready': event['ready']
        }))

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

    async def broadcast_player_list(self):
        for player in self.players:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_info',
                    'player': player['player'],
                    'player_role': player['player_role'],
                    'ready': player['ready']
                }
            )
