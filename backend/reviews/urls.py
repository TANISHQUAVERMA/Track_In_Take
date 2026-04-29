from django.urls import path
from .views import SubmitReviewView, CheckReviewView

# --- IGNORE ---
urlpatterns = [
    path('submit/', SubmitReviewView.as_view()),
    path('check/<int:appointment_id>/', CheckReviewView.as_view()),
]
