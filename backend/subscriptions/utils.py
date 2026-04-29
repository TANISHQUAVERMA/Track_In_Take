# subscriptions/utils.py

from django.utils.timezone import now
from rest_framework.exceptions import PermissionDenied

def get_active_subscription(user):
    return (
        user.subscriptions
        .filter(
            is_active=True,
            end_date__gte=now().date(),
            plan__is_active=True
        )
        .select_related("plan")
        .first()
    )


def require_plan_feature(user, feature_flag):
    # TODO: re-enable plan checks before production
    return True
