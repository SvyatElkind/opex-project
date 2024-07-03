from rest_framework import serializers

class ProjectSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=50)
    created_at = serializers.DateTimeField()
    validated = serializers.BooleanField()
