from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
	name = models.CharField(max_length=100)

	def __str__(self):
		return self.name

class Match(models.Model):
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1_matches')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2_matches')
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    timestamp = models.BigIntegerField()
    mode = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.player1} vs {self.player2}"
	
class Tournament(models.Model):
	date = models.DateTimeField()
	players = models.ManyToManyField(Player, related_name='tournament_players')
	match = models.ManyToManyField(Match, related_name='tournament_matches')
	transaction_hash = models.CharField(max_length=66, blank=True, null=True)  # Store the hash as a string

	def __str__(self):
		return self.date

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    # matchvs1 = models.ManyToManyField(Match, related_name='vs1_matches')
    # matchvsAI = models.ManyToManyField(Match, related_name='vsAI_matches')
    # tournament = models.ManyToManyField(Tournament, related_name='tournament_matches')

    def __str__(self):
        return self.user.username