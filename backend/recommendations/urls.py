from django.urls import path
from . import views

urlpatterns = [
    path('generate/',        views.generate_recommendation, name='generate-recommendation'),
    path('today/',           views.today_recommendation,    name='today-recommendation'),
    path('refresh-images/',  views.refresh_images,          name='refresh-images'),
    path('calorie-summary/', views.calorie_summary,         name='calorie-summary'),
    path('feedback/',        views.submit_meal_feedback,    name='meal-feedback'),
    path('feedback/today/',  views.get_meal_feedback,       name='meal-feedback-today'),
]
