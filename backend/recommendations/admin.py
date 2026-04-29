from django.contrib import admin
from .models import DailyRecommendation

@admin.register(DailyRecommendation)
class DailyRecommendationAdmin(admin.ModelAdmin):
    list_display  = ['user', 'date', 'calorie_target', 'calories_used', 'generated_at']
    list_filter   = ['date']
    search_fields = ['user__email']
