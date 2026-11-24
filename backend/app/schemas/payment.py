"""Pydantic schemas for payments."""

from __future__ import annotations

from pydantic import BaseModel, Field


class PaymentOrderRequest(BaseModel):
    """Request to create a payment order."""

    amount_paise: int = Field(..., gt=0, description="Amount in paise (100 paise = 1 INR)")
    customer_name: str = Field(..., min_length=1, max_length=255)
    customer_email: str = Field(..., description="Customer email for receipt")
    customer_phone: str = Field(..., min_length=10, max_length=15)
    queue_token: str = Field(..., description="Queue token for reference")


class PaymentOrderResponse(BaseModel):
    """Response with payment order details."""

    order_id: str
    amount: int  # in paise
    currency: str = "INR"
    key_id: str  # Razorpay Key ID for frontend


class PaymentVerifyRequest(BaseModel):
    """Request to verify payment."""

    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentVerifyResponse(BaseModel):
    """Response after payment verification."""

    success: bool
    payment_id: str
    message: str
