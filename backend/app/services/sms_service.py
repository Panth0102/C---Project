"""SMS notification service using Twilio."""

from typing import Optional

from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

from app.core.config import get_settings


class SMSService:
    """Send SMS notifications to customers."""

    def __init__(self):
        """Initialize Twilio client."""
        settings = get_settings()
        if not settings.twilio_account_sid or not settings.twilio_auth_token:
            self.client = None
            self.enabled = False
        else:
            self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
            self.twilio_phone = settings.twilio_phone_number
            self.enabled = True

    def send_sms(self, to_phone: str, message: str) -> Optional[str]:
        """
        Send SMS to customer.

        Args:
            to_phone: Customer phone number (10 digits or +91XXXXXXXXXX)
            message: Message text (max 160 chars recommended)

        Returns:
            Message SID if successful, None if disabled or error
        """
        if not self.enabled:
            return None

        try:
            # Normalize phone number
            phone = to_phone.strip()
            if not phone.startswith("+"):
                phone = f"+91{phone}"

            msg = self.client.messages.create(
                body=message,
                from_=self.twilio_phone,
                to=phone,
            )
            return msg.sid
        except TwilioRestException as e:
            # Log error but don't crash — SMS is non-critical
            print(f"SMS Error: {e.msg}")
            return None
        except Exception as e:
            # Catch all errors and don't crash
            print(f"SMS Exception: {str(e)}")
            return None

    def send_queue_joined_sms(self, customer_name: str, phone: str, token: str, position: int, wait_minutes: int) -> Optional[str]:
        """Send welcome SMS when customer joins queue."""
        message = f"Hi {customer_name}! You're in The Sovereign Blade queue. Token: {token}. Position: #{position}. Est. wait: {wait_minutes} min."
        return self.send_sms(phone, message)

    def send_approaching_sms(self, customer_name: str, phone: str, token: str) -> Optional[str]:
        """Send SMS when customer is next or second in line."""
        message = f"Hi {customer_name}! You're next at The Sovereign Blade. Token: {token}. Get ready!"
        return self.send_sms(phone, message)

    def send_called_sms(self, customer_name: str, phone: str, token: str, barber_name: str) -> Optional[str]:
        """Send SMS when customer is called to barber chair."""
        message = f"Hi {customer_name}! It's your turn! Token: {token}. Proceed to {barber_name}. The Sovereign Blade."
        return self.send_sms(phone, message)

    def send_wait_update_sms(self, customer_name: str, phone: str, position: int, wait_minutes: int) -> Optional[str]:
        """Send periodic SMS with updated wait time."""
        message = f"Hi {customer_name}! You're at position #{position}. Est. wait: {wait_minutes} min. The Sovereign Blade."
        return self.send_sms(phone, message)


# Singleton instance (lazy-loaded)
_sms_service: Optional[SMSService] = None

def get_sms_service() -> SMSService:
    """Get or create SMS service instance."""
    global _sms_service
    if _sms_service is None:
        _sms_service = SMSService()
    return _sms_service

# For backward compatibility
sms_service = get_sms_service()

