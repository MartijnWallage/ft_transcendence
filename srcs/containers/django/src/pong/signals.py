# signals.py
from django.db.models.signals import post_save
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile, Player

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()

@receiver(post_save, sender=UserProfile)
def create_player(sender, instance, created, **kwargs):
    if created:
        Player.objects.get_or_create(user_profile=instance)

@receiver(user_logged_in)
def handle_user_logged_in(sender, request, user, **kwargs):
    profile = user.userprofile
    profile.online_status = True
    profile.save()

@receiver(user_logged_out)
def handle_user_logged_out(sender, request, user, **kwargs):
    profile = user.userprofile
    profile.online_status = False
    profile.save()