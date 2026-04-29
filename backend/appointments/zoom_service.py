import os
import requests
from base64 import b64encode


def get_zoom_token():
    client_id     = os.getenv("ZOOM_CLIENT_ID")
    client_secret = os.getenv("ZOOM_CLIENT_SECRET")
    account_id    = os.getenv("ZOOM_ACCOUNT_ID")

    print(f"🔍 Zoom creds — client_id: {client_id}, account_id: {account_id}")

    auth = b64encode(f"{client_id}:{client_secret}".encode()).decode()
    res  = requests.post(
        f"https://zoom.us/oauth/token?grant_type=account_credentials&account_id={account_id}",
        headers={"Authorization": f"Basic {auth}"}
    )
    print(f"🔍 Zoom token response: {res.status_code} — {res.text}")
    res.raise_for_status()
    return res.json().get("access_token")


def create_zoom_meeting(topic: str, start_time_str: str, duration: int = 60, host_email: str = None) -> dict:
    """
    start_time_str: "2026-03-20T10:00:00"
    host_email: nutritionist's zoom email (optional)
    Returns Zoom response with join_url, start_url, password, id
    """
    token = get_zoom_token()
    user_id = host_email if host_email else "me"
    res = requests.post(
        f"https://api.zoom.us/v2/users/{user_id}/meetings",
        json={
            "topic":      topic,
            "type":       2,
            "start_time": start_time_str,
            "duration":   duration,
            "timezone":   "Asia/Kolkata",
            "settings": {
                "host_video":        True,
                "participant_video": True,
                "waiting_room":      False,
                "join_before_host":  True,
                "mute_upon_entry":   True,
            },
        },
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type":  "application/json",
        },
    )
    print(f"🔍 Zoom meeting response: {res.status_code} — {res.text}")
    res.raise_for_status()
    data = res.json()
    print(f"✅ join_url: {data.get('join_url')}")
    print(f"✅ start_url: {data.get('start_url', '')[:80]}...")
    print(f"✅ host_email: {data.get('host_email')}")
    return data
