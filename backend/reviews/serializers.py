from rest_framework import serializers
from .models import Review

# Serializer for Review model
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'appointment', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']
