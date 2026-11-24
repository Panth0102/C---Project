"""Payment endpoints — /api/v1/payment"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.schemas.payment import (
    PaymentOrderRequest, PaymentOrderResponse,
    PaymentVerifyRequest, PaymentVerifyResponse,
)
from app.services.payment_service import get_payment_service

router = APIRouter(prefix="/payment", tags=["Payment"])


@router.post(
    "/create-order",
    response_model=PaymentOrderResponse,
    summary="Create a Razorpay payment order",
)
def create_payment_order(payload: PaymentOrderRequest) -> PaymentOrderResponse:
    """Create payment order for queue service."""
    payment_service = get_payment_service()

    if not payment_service.enabled:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service not configured."
        )

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

    settings = get_settings()
    return PaymentOrderResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id=settings.razorpay_key_id,
    )


@router.post(
    "/verify",
    response_model=PaymentVerifyResponse,
    summary="Verify Razorpay payment signature",
)
def verify_payment(payload: PaymentVerifyRequest) -> PaymentVerifyResponse:
    """Verify payment signature and mark order as paid."""
    payment_service = get_payment_service()

    if not payment_service.enabled:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service not configured."
        )

    is_valid = payment_service.verify_payment(
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature,
    )

    if not is_valid:
        return PaymentVerifyResponse(
            success=False,
            payment_id=payload.razorpay_payment_id,
            message="Payment signature verification failed.",
        )

    return PaymentVerifyResponse(
        success=True,
        payment_id=payload.razorpay_payment_id,
        message="Payment verified successfully!",
    )
