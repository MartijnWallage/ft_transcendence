from django.db import models

# Create your models here.

class player(models.Model):
	name = models.CharField(max_length=100)

	def __str__(self):
		return self.name

class tournament(models.Model):
	# tournament_index = models.IntegerField()
	date = models.DateTimeField()
	# players = models.ManyToManyField(player)
	winner = models.ForeignKey(player, on_delete=models.CASCADE)
	# hash = models.CharField(max_length=100)

	def __str__(self):
		return self.name

# class match(models.Model):
# 	match_index = models.IntegerField()
# 	player1 = models.ForeignKey(player, on_delete=models.CASCADE)
# 	player2 = models.ForeignKey(player, on_delete=models.CASCADE)
# 	player1_score = models.IntegerField()
# 	player2_score = models.IntegerField()

# 	def __str__(self):
# 		return self.player1 + " vs " + self.player2
