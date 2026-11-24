"""Dummy payment service — simulates Razorpay without any real charges."""

from __future__ import annotations

import logging
from typing import Optional
from uuid import uuid4

logger = logging.getLogger(__name__)


class PaymentService:
    """Simulate payment operations. Always succeeds; no external API calls."""

    def __init__(self) -> None:
        self.enabled = True
        logger.info("[DummyPayment] Payment service initialised (dummy mode — no real charges).")

    def create_order(
        self,
        amount_paise: int,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
        queue_token: str,
    ) -> Optional[dict]:
        """
        Return a simulated payment order.

        Args:
            amount_paise: Amount in paise (1 rupee = 100 paise).
            customer_name: Customer name.
            customer_email: Customer email.
            customer_phone: Customer phone number.
            queue_token: Queue token used as the receipt reference.

        Returns:
            Dict with keys ``id``, ``amount``, ``currency``, ``receipt``.
        """
        order_id = f"DUMMY_ORD_{uuid4().hex[:8].upper()}"
        order = {
            "id": order_id,
            "amount": amount_paise,
            "currency": "INR",
            "receipt": queue_token,
        }
        print(
            f"[DummyPayment] create_order → {order_id} | ₹{amount_paise / 100:.2f} "
            f"| customer={customer_name} | token={queue_token}"
        )
        logger.info(
            "[DummyPayment] Created dummy order %s for %s (token=%s, amount_paise=%d)",
            order_id, customer_name, queue_token, amount_paise,
        )
        return order

    def verify_payment(
        self,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> bool:
        """
        Always returns True — dummy verification.

        Args:
            razorpay_order_id: Order ID (may be a dummy ID).
            razorpay_payment_id: Payment ID (may be a dummy ID).
            razorpay_signature: Signature string (ignored).

        Returns:
            True always.
        """
        print(
            f"[DummyPayment] verify_payment → order={razorpay_order_id} "
            f"payment={razorpay_payment_id} → VERIFIED (dummy)"
        )
        logger.info(
            "[DummyPayment] Verified dummy payment order=%s payment=%s",
            razorpay_order_id, razorpay_payment_id,
        )
        return True

    def get_payment_details(self, payment_id: str) -> Optional[dict]:
        """
        Return simulated payment details.

        Args:
            payment_id: Payment ID to look up.

        Returns:
            Dict with basic payment info.
        """
        details = {
            "id": payment_id,
            "status": "captured",
            "method": "dummy",
            "currency": "INR",
        }
        print(f"[DummyPayment] get_payment_details → {payment_id}")
        logger.info("[DummyPayment] get_payment_details called for %s", payment_id)
        return details


def get_payment_service() -> PaymentService:
    """Return a fresh PaymentService instance."""
    return PaymentService()
