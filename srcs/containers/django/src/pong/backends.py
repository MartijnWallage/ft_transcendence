from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User

class OAuth2Backend(BaseBackend):
    def authenticate(self, request, username=None, **kwargs):
        try:
            # You are authenticating the user via their username (coming from OAuth2 provider)
            user = User.objects.get(username=username)
            print(f"\n\n\n\n\nUser {user.username} authenticated via OAuth2Backend")
            return user
        except User.DoesNotExist:
            print(f"\n\n\n\nUser {username} does not exist")
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
