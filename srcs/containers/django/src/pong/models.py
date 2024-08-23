from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    online_status = models.BooleanField(default=False) # for online status

    def __str__(self):
        return self.user.username

class Friendship(models.Model):
      user = models.ForeignKey(User, related_name='friendship_creator_set', on_delete=models.CASCADE)
      friend = models.ForeignKey(User, related_name='friend_set', on_delete=models.CASCADE)
      created = models.DateTimeField(auto_now_add=True)
      accepted = models.BooleanField(default=False)

      class Meta:
        unique_together = ('user', 'friend')
        
      def __str__(self):
        return f"{self.user.username} is friends with {self.friend.username}"


class Player(models.Model):
    name = models.CharField(max_length=100, null=True, blank=True)
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, blank=True, related_name='player_profile')
    # is_ai = models.BooleanField(default=False)
# if there is logged in user, make the stats for user otherwise given username
    def __str__(self):
        # if self.is_ai:
        #     return "AI"
        return self.user_profile.user.username if self.user_profile else self.name

class Match(models.Model):
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1_matches')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2_matches')
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    timestamp = models.BigIntegerField()
    mode = models.CharField(max_length=20, choices=[('solo', 'AI'), ('UvU', 'Friend'), ('tournament', 'Local')])

    def __str__(self):
        return f"{self.player1} vs {self.player2} in {self.mode} mode"
    
    def get_winner(self):
        if self.player1_score > self.player2_score:
            return self.player1
        elif self.player2_score > self.player1_score:
            return self.player2
        else:
            return None

    def get_loser(self):
        if self.player1_score < self.player2_score:
            return self.player1
        elif self.player2_score < self.player1_score:
            return self.player2
        else:
            return None
    
class Tournament(models.Model):
    date = models.DateTimeField()
    players = models.ManyToManyField(Player, related_name='tournament_players')
    match = models.ManyToManyField(Match, related_name='tournament_matches')
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)  # Store the hash as a string

    def __str__(self):
        return self.date

class Game(models.Model):
    GAME_TYPE_CHOICES = [
        ('AI', 'Against AI'),
        ('FRIEND', 'Against Friend'),
        ('LOCAL', 'Local Multiplayer'),
        ('TOURNAMENT', 'Tournament')
    ]

    player1 = models.ForeignKey(User, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.CharField(max_length=150, null=True, blank=True)  # This can be a username or 'AI'
    game_type = models.CharField(max_length=20, choices=GAME_TYPE_CHOICES)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    winner = models.CharField(max_length=150, null=True, blank=True)  # Username of the winner
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player1.username} vs {self.player2} - Winner: {self.winner}"

class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    total_games = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - Wins: {self.wins}, Losses: {self.losses}, Total Games: {self.total_games}"
