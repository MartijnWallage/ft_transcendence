# myapp/serializers.py

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
