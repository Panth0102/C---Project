"""Payment endpoints — /api/v1/payment"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.schemas.payment import (
    PaymentOrderRequest, PaymentOrderResponse,
    PaymentVerifyRequest, PaymentVerifyResponse,
)
from app.services.payment_service import get_payment_service

router = APIRouter(prefix="/payment", tags=["Payment"])


@router.post(
    "/create-order",
    response_model=PaymentOrderResponse,
    summary="Create a (dummy) payment order",
)
def create_payment_order(payload: PaymentOrderRequest) -> PaymentOrderResponse:
    """Create a simulated payment order for a queue service."""
    payment_service = get_payment_service()

    order = payment_service.create_order(
        amount_paise=payload.amount_paise,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        customer_phone=payload.customer_phone,
        queue_token=payload.queue_token,
    )

    if not order:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment order. Please try again."
        )

    return PaymentOrderResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id="DUMMY_KEY",
    )


@router.post(
    "/verify",
    response_model=PaymentVerifyResponse,
    summary="Verify payment signature (always succeeds in dummy mode)",
)
def verify_payment(payload: PaymentVerifyRequest) -> PaymentVerifyResponse:
    """Verify payment — dummy implementation always returns success."""
    payment_service = get_payment_service()

    is_valid = payment_service.verify_payment(
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature,
    )

    return PaymentVerifyResponse(
        success=is_valid,
        payment_id=payload.razorpay_payment_id,
        message="Payment verified successfully!" if is_valid else "Verification failed.",
    )
