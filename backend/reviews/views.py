from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from appointments.models import Appointment
from .models import Review
from .serializers import ReviewSerializer

#review submission view
class SubmitReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        appointment_id = request.data.get('appointment_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not appointment_id or not rating:
            return Response({'error': 'appointment_id and rating required'}, status=400)

        if not (1 <= int(rating) <= 5):
            return Response({'error': 'Rating must be between 1 and 5'}, status=400)

        try:
            appointment = Appointment.objects.get(id=appointment_id, patient=request.user)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=404)

        if Review.objects.filter(appointment=appointment).exists():
            return Response({'error': 'Review already submitted'}, status=400)

        Review.objects.create(
            appointment=appointment,
            patient=request.user,
            nutritionist=appointment.nutritionist,
            rating=int(rating),
            comment=comment
        )
        return Response({'message': 'Review submitted successfully'}, status=201)


class CheckReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, appointment_id):
        exists = Review.objects.filter(
            appointment_id=appointment_id,
            patient=request.user
        ).exists()
        return Response({'reviewed': exists})
