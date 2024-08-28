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
    name = models.CharField(max_length=100)
    user_profile = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', null=True, blank=True)

    def __str__(self):
        return self.user_profile.username if self.user_profile else self.name
        # return self.user_profile.user.username if self.user_profile else self.name
    

class Match(models.Model):
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1_matches')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2_matches')
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    timestamp = models.BigIntegerField()
    mode = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.player1} vs {self.player2}"
    
    def get_winner(self):
        if self.player1_score > self.player2_score:
            return self.player1
        else:
            return self.player2

    def get_loser(self):
        if self.player1_score < self.player2_score:
            return self.player1
        else:
            return self.player2
    
class Tournament(models.Model):
    date = models.BigIntegerField()
    players = models.ManyToManyField(Player, related_name='tournament_players')
    match = models.ManyToManyField(Match, related_name='tournament_matches')
    transaction_hash = models.CharField(max_length=66, blank=True, null=True)  # Store the hash as a string
    
    def __str__(self):
        return f"Tournament ID: {self.id}"
    
class ExtendedUser(User):  # Inherit from User
    class Meta:
        proxy = True  # This tells Django not to create a new table for this model

    @property
    def avatar(self):
        return self.user_profile.avatar if hasattr(self, 'user_profile') else None

    # Add more properties as needed, to expose other fields from UserProfile

