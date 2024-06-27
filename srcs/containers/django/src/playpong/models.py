from django.db import models

class Game(models.Model):
    player1_position = models.IntegerField(default=0)
    player2_position = models.IntegerField(default=0)
    ball_position_x = models.IntegerField(default=0)
    ball_position_y = models.IntegerField(default=0)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)

    # Add any additional fields or methods as needed
    
    def move_player1_paddle(self, new_position):
        self.player1_position = new_position
    
    def move_player2_paddle(self, new_position):
        self.player2_position = new_position

    def update_ball_position(self, new_x, new_y):
        self.ball_position_x = new_x
        self.ball_position_y = new_y

    def update_scores(self, player1_score, player2_score):
        self.player1_score = player1_score
        self.player2_score = player2_score

    # Add any other methods for game logic as required

    def __str__(self):
        return f"Game {self.id}"
