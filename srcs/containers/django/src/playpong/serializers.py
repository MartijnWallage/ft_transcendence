# to define how the data should be transformed to 
# and from various formats, such as JSON or XML. 

# It is a crucial component for handling the input and output of API endpoints.

from rest_framework import serializers

class PlayerSerializer(serializers.Serializer):
    y = serializers.IntegerField()
    dy = serializers.IntegerField()
    score = serializers.IntegerField()
