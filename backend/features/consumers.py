import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
# Set up logging
logger = logging.getLogger(__name__)

class ReminderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info("📡 WebSocket connection initiated.")
        print("📡 WebSocket connection initiated.")
        self.user = self.scope.get("user")
        logger.debug(f"Scope user: {self.user}")
        print(f"Scope user: {self.user}")

        if self.user and self.user.is_authenticated:
            self.group_name = f"user_{self.user.id}"
            print(f"Group name: {self.group_name}")
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            logger.info(f"✅ WebSocket connected for user ID {self.user.id}, group '{self.group_name}'.")
            print(f"✅ WebSocket connected for user ID {self.user.id}, group '{self.group_name}'.")
        else:
            logger.warning("❌ WebSocket connection rejected: User not authenticated.")
            print("❌ WebSocket connection rejected: User not authenticated.")
            await self.close()

    async def disconnect(self, close_code):
        logger.info(f"🔌 WebSocket disconnect called. Code: {close_code}")
        print(f"🔌 WebSocket disconnect called. Code: {close_code}")
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(f"👋 Disconnected from group {self.group_name}")
            print(f"👋 Disconnected from group {self.group_name}")

    async def send_reminder(self, event):
        await self.send(text_data=json.dumps({
            "type":        "reminder",
            "message":     event["message"],
            "reminder_id": event["reminder_id"],
            "title":       event["title"],
        }))

    async def send_suggestion(self, event):
        """
        Handles food suggestion WebSocket push.
        """
        await self.send(text_data=json.dumps({
            "type":           "food_suggestion",
            "message":        event.get("message", ""),
            "top_suggestion": event.get("top_suggestion", ""),
            "reason":         event.get("reason", ""),
            "calories_left":  event.get("calories_left", 0),
        }))

    async def meeting_ended(self, event):
        """Triggered by Zoom webhook when meeting ends."""
        await self.send(text_data=json.dumps({
            "type":             "meeting_ended",
            "appointment_id":   event["appointment_id"],
            "nutritionist_name": event["nutritionist_name"],
        }))


class MessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        if self.user and self.user.is_authenticated:
            self.group_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            logger.info(f"✅ Connected for messages: {self.group_name}")
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(f"👋 Disconnected: {self.group_name}")

    async def receive(self, text_data):
        pass

    async def send_suggestion(self, event):
        pass

    async def meeting_ended(self, event):
        pass

    async def send_message(self, event):
        await self.send(text_data=json.dumps({
            "type":    "message",
            "message": event["message"],
            "sender": {
                "id":    event["sender_id"],
                "name":  event["sender_name"],
                "email": event["sender_email"],
            },
            "receiver": {
                "id":    event["receiver_id"],
                "name":  event["receiver_name"],
                "email": event["receiver_email"],
            },
        }))