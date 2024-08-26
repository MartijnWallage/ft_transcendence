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
		await self.send(text_data=json.dumps({
			'type': 'player_role',
			'player_role': self.player_role,
		}))

	async def disconnect(self, close_code):
		# Clear player data
		PongConsumer.player_A = None
		PongConsumer.player_B = None
		logger.debug("********** Player disconnected **********") 
		# Leave the room group
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'force_disconnect'
			}
   		 )

		await self.close()

	async def force_disconnect(self, event):

		await self.send(text_data=json.dumps({
			'type': 'connection_over',
		}))

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
		except json.JSONDecodeError:
			await self.send(text_data=json.dumps({
				'type': 'error',
				'message': 'Invalid JSON data received'
			}))
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
					{
						'type': 'game_start'
					}
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
		await self.send(text_data=json.dumps({
			'type': 'game_state',
			'paddle_A': event.get('paddle_A', None),
			'paddle_B': event.get('paddle_B', None),
			'ball_x': event.get('ball_x', None),
			'ball_z': event.get('ball_z', None),
		}))

	async def game_start(self, event):
		await self.send(text_data=json.dumps({
			'type': 'game_start',
		}))

	async def connection_over(self, event):
		await self.send(text_data=json.dumps({
			'type': 'connection_over',
		}))

	async def broadcast_player_info(self):
		# Broadcast player information to all clients in the group
		player_info_A = PongConsumer.player_A
		player_info_B = PongConsumer.player_B
		
		if player_info_A:
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'player_connected',
					'player': player_info_A['player'],
					'player_role': player_info_A['player_role'],
					'ready': player_info_A['ready']
				}
			)
		
		if player_info_B:
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'player_connected',
					'player': player_info_B['player'],
					'player_role': player_info_B['player_role'],
					'ready': player_info_B['ready']
				}
			)

	async def player_connected(self, event):
		# Send player info to WebSocket
		await self.send(text_data=json.dumps({
			'type': 'player_connected',
			'player': event['player'],
			'player_role': event['player_role'],
			'ready': event['ready']
		}))

	async def new_score(self, event):
		# Send updated scores to WebSocket
		await self.send(text_data=json.dumps({
			'type': 'new_score',
			'score_A': event['score_A'],
			'score_B': event['score_B'],
		}))