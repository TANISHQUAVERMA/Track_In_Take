from django.db import models
from django.conf import settings


# Create your models here.

class Review(models.Model):
    appointment = models.OneToOneField(
        'appointments.Appointment',
        on_delete=models.CASCADE,
        related_name='review'
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    nutritionist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_reviews'
    )
    rating = models.IntegerField()  # 1-5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.full_name} → {self.nutritionist.full_name} ({self.rating}⭐)"
