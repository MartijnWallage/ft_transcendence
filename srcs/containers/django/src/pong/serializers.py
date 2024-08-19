# myapp/serializers.py

from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile

class RegisterSerializer(serializers.ModelSerializer):
    # required must be True
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm password')
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2', 'avatar']

    def validate(self, data):
        print("Validation data received:", data)
        password1 = data.get('password1')
        password2 = data.get('password2')

        if password1 != password2:
            raise serializers.ValidationError("Passwords do not match.")
        # if len(password1) < 8:
        #     raise serializers.ValidationError("Passwords is too short")
        # if validate_password(password1) != None:
        #     raise serializers.ValidationError("Passwords is not good enough")
        return data

    def create(self, validated_data):
        print("Create method called with:", validated_data)
        avatar = validated_data.pop('avatar', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password1']
        )
        print("User created:", user)
        UserProfile.objects.create(user=user, avatar=avatar)
        # if 'avatar' in validated_data:
        #     UserProfile.objects.create(user=user, avatar=validated_data['avatar'])
        return user


class UpdateUserSerializer(serializers.ModelSerializer):
    # required must be True
    # password = serializers.CharField(write_only=True, required=True)
    avatar = serializers.ImageField(required=False)
    username = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'avatar']
        # read_only_fields = ['username']

    def update(self, instance, validated_data):
        print("Validation data received:", validated_data)

        if 'avatar' in validated_data:
            # instance.avatar = validated_data['avatar']
            profile, created = UserProfile.objects.get_or_create(user=instance)
            profile.avatar = validated_data['avatar']
            profile.save()
        return super().update(instance, validated_data)
        
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password1 = serializers.CharField(required=True, write_only=True)
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        print("Validation data received:", data)
        password1 = data.get('password1')
        password2 = data.get('password2')

        if password1 != password2:
            raise serializers.ValidationError("Passwords do not match.")
        # if len(password1) < 8:
        #     raise serializers.ValidationError("Passwords is too short")
        # if validate_password(password1) != None:
        #     raise serializers.ValidationError("Passwords is not good enough")
        return data

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old Password is incorrect")
        return value
    
    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password1'])
        user.save()

        update_session_auth_hash(self.context['request'], user)
        return user