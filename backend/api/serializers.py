from rest_framework import serializers
from .models import DiabeticProfile  # Create this model or use your existing one

class DiabeticProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiabeticProfile
        fields = '__all__'