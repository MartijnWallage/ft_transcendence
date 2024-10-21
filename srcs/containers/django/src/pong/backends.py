# from django.contrib.auth.backends import BaseBackend
# from django.contrib.auth.models import User

# class OAuth2Backend(BaseBackend):
#     def authenticate(self, request, username=None, password=None, **kwargs):
#     # Only proceed if the request is from OAuth2
#         if 'oauth2' in kwargs:  # or any other check to identify OAuth2 requests
#             try:
#                 user = User.objects.get(username=username)
#                 print(f"\n\n\n\n\nUser {user.username} authenticated via OAuth2Backend")
#                 return user
#             except User.DoesNotExist:
#                 print(f"\n\n\n\nUser {username} does not exist")
#                 return None
#         return None  # If not an OAuth2 request, return None

#     def get_user(self, user_id):
#         try:
#             return User.objects.get(pk=user_id)
#         except User.DoesNotExist:
#             return None


from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User

class OAuth2Backend(BaseBackend):
    def authenticate(self, request, username=None, oauth_login=False, **kwargs):
        if not oauth_login:  # Only authenticate if it's an OAuth login
            return None
        
        try:
            user = User.objects.get(username=username)
            print(f"User {user.username} authenticated via OAuth2Backend")
            return user
        except User.DoesNotExist:
            print(f"User {username} does not exist")
            return None


    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
