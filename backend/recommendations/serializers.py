from rest_framework import serializers
from .models import DailyRecommendation, MealFeedback


class DailyRecommendationSerializer(serializers.ModelSerializer):
    calories_remaining = serializers.ReadOnlyField()

    class Meta:
        model  = DailyRecommendation
        fields = '__all__'
        read_only_fields = ['user', 'generated_at']


class MealFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MealFeedback
        fields = '__all__'
        read_only_fields = ['user', 'logged_at']
