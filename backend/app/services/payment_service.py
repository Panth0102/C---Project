"""Payment processing service using Razorpay."""

from __future__ import annotations

import hashlib
import hmac
from typing import Optional


class PaymentService:
    """Handle Razorpay payment operations."""

    def __init__(self):
        """Initialize Razorpay client (lazy-loaded)."""
        from app.core.config import get_settings
        
        settings = get_settings()
        self.key_id = settings.razorpay_key_id
        self.key_secret = settings.razorpay_key_secret
        self.client = None
        self.enabled = False
        
        if self.key_id and self.key_secret:
            try:
                import razorpay
                self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
                self.enabled = True
            except Exception as e:
                print(f"Razorpay initialization error: {e}")
                self.enabled = False

    def create_order(
        self,
        amount_paise: int,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
        queue_token: str,
    ) -> Optional[dict]:
        """
        Create Razorpay order for payment.

        Args:
            amount_paise: Amount in paise (1 rupee = 100 paise)
            customer_name: Customer name
            customer_email: Customer email
            customer_phone: Customer phone (10 digits)
            queue_token: Queue token for reference

        Returns:
            Order details with order_id, or None if disabled/error
        """
        if not self.enabled or not self.client:
            return None

        try:
            # Normalize phone number
            phone = customer_phone.strip()
            if not phone.startswith("+"):
                phone = f"+91{phone}"

            order_data = {
                "amount": amount_paise,  # in paise
                "currency": "INR",
                "receipt": queue_token,  # Queue token as receipt
                "customer_notify": 1,
                "notes": {
                    "customer_name": customer_name,
                    "queue_token": queue_token,
                },
            }

            order = self.client.order.create(data=order_data)
            return order
        except Exception as e:
            print(f"Razorpay Order Error: {str(e)}")
            return None

    def verify_payment(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> bool:
        """
        Verify payment signature from Razorpay.

        Args:
            razorpay_order_id: Order ID from Razorpay
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_signature: Signature from client

        Returns:
            True if signature is valid, False otherwise
        """
        if not self.enabled:
            return False

        try:
            # Verify signature
            message = f"{razorpay_order_id}|{razorpay_payment_id}".encode()
            generated_signature = hmac.new(
                self.key_secret.encode(),
                message,
                hashlib.sha256
            ).hexdigest()

            return generated_signature == razorpay_signature
        except Exception as e:
            print(f"Razorpay Signature Verification Error: {str(e)}")
            return False

    def get_payment_details(self, payment_id: str) -> Optional[dict]:
        """Get payment details from Razorpay."""
        if not self.enabled or not self.client:
            return None

        try:
            payment = self.client.payment.fetch(payment_id)
            return payment
        except Exception as e:
            print(f"Razorpay Fetch Error: {str(e)}")
            return None


def get_payment_service() -> PaymentService:
    """Get or create payment service instance."""
    return PaymentService()
