from django.db import models
from django.conf import settings


class DailyRecommendation(models.Model):
    user           = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_recommendations')
    date           = models.DateField()
    calorie_target = models.IntegerField(default=0)
    calories_used  = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    breakfast_plan = models.JSONField(default=list)
    lunch_plan     = models.JSONField(default=list)
    dinner_plan    = models.JSONField(default=list)
    plan_summary   = models.TextField(null=True, blank=True)
    generated_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'date')
        ordering        = ['-date']

    def __str__(self):
        return f"{self.user} — {self.date}"

    @property
    def calories_remaining(self):
        return self.calorie_target - float(self.calories_used)


class MealFeedback(models.Model):
    STATUS_CHOICES = [
        ('eaten',    'Eaten'),
        ('liked',    'Liked'),
        ('disliked', 'Disliked'),
        ('skipped',  'Skipped'),
        ('replaced', 'Replaced'),
    ]
    MEAL_CHOICES = [
        ('Breakfast', 'Breakfast'),
        ('Lunch',     'Lunch'),
        ('Dinner',    'Dinner'),
    ]

    recommendation = models.ForeignKey(DailyRecommendation, on_delete=models.CASCADE, related_name='feedbacks')
    user           = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    meal_type      = models.CharField(max_length=10, choices=MEAL_CHOICES)
    food_name      = models.CharField(max_length=150)
    status         = models.CharField(max_length=10, choices=STATUS_CHOICES)
    replaced_with  = models.CharField(max_length=150, null=True, blank=True)
    note           = models.CharField(max_length=255, null=True, blank=True)
    logged_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('recommendation', 'user', 'meal_type')

    def __str__(self):
        return f"{self.user} — {self.meal_type} — {self.status}"
