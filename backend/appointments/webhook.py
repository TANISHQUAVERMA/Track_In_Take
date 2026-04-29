import hashlib
import hmac
import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from appointments.models import Appointment

WEBHOOK_SECRET = os.getenv("ZOOM_WEBHOOK_SECRET", "")


@csrf_exempt
def zoom_webhook(request):
    print(f"🔍 Zoom webhook hit: method={request.method}")
    if request.method == "GET":
        return JsonResponse({"status": "ok"})
    body = request.body
    print(f"🔍 Body: {body[:200]}")
    data = json.loads(body)
    event = data.get("event")

    # Zoom URL validation challenge
    if event == "endpoint.url_validation":
        token = data["payload"]["plainToken"]
        hashed = hmac.new(WEBHOOK_SECRET.encode(), token.encode(), hashlib.sha256).hexdigest()
        print(f"✅ Zoom validation: token={token}, hashed={hashed}")
        return JsonResponse({"plainToken": token, "encryptedToken": hashed})

    if event == "meeting.ended":
        meeting_id = str(data["payload"]["object"]["id"])
        print(f"🔍 Meeting ended: id={meeting_id}")

        appointment = Appointment.objects.filter(
            meeting_link__contains=meeting_id,
            status="CONFIRMED"
        ).first()

        print(f"🔍 Appointment found: {appointment}")

        if appointment:
            appointment.status = "COMPLETED"
            appointment.save(update_fields=["status"])

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{appointment.patient_id}",
                {
                    "type": "meeting_ended",
                    "appointment_id": appointment.id,
                    "nutritionist_name": appointment.nutritionist.full_name,
                }
            )

    return JsonResponse({"status": "ok"})
