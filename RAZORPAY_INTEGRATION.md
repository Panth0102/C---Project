# Razorpay Payment Integration

## Overview

Added **Razorpay payment integration** to allow customers to make advance payments for queue reservations. Customers can:
- Pay for selected services upfront
- Reduce no-shows with payment commitment
- Get instant confirmation via SMS
- Resume queue with payment verified

---

## Setup Instructions

### Step 1: Create Razorpay Account (5 minutes)

1. **Sign up:**
   - Go to https://dashboard.razorpay.com/
   - Create account with email
   - Verify phone number and email

2. **Get API Keys:**
   - Go to **Settings → API Keys** (live mode)
   - Copy **Key ID** (looks like: `rzp_live_xxxxxxxx`)
   - Copy **Key Secret** (keep this secret!)

3. **Enable Payments:**
   - Go to **Settings → Business**
   - Add business details
   - Enable **Payments → UPI, Cards, Wallets, Netbanking** (choose what you support)

4. **Test Mode (Optional):**
   - Use test keys for development
   - See test card numbers in Razorpay docs

### Step 2: Update Environment Variables

#### Local Development

**Edit `backend/.env`:**
```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
```

**Leave blank to disable payments:**
```bash
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

#### Production (Render)

1. Go to **Render Dashboard**
2. Select backend service
3. Go to **Settings → Environment**
4. Add two new variables:
   - `RAZORPAY_KEY_ID` = (your live key ID)
   - `RAZORPAY_KEY_SECRET` = (your live secret)
5. Service auto-redeploys

### Step 3: Backend Endpoints Ready

No additional setup needed! Endpoints are live:
- `POST /api/v1/payment/create-order` — Create payment order
- `POST /api/v1/payment/verify` — Verify payment signature

---

## How It Works

### Payment Flow

```
Customer selects services + clicks "Pay Now"
              ↓
POST /api/v1/payment/create-order
              ↓
Backend creates Razorpay order
              ↓
Return: order_id, amount, key_id
              ↓
Frontend: Show Razorpay checkout
              ↓
Customer enters card/UPI details
              ↓
Razorpay processes payment
              ↓
Payment success callback
              ↓
Frontend: POST /api/v1/payment/verify
              ↓
Backend verifies signature
              ↓
Customer joins queue (payment verified)
              ↓
SMS sent with token
```

### API Endpoints

#### 1. Create Order

**Request:**
```bash
POST /api/v1/payment/create-order
Content-Type: application/json

{
  "amount_paise": 50000,              // 500 INR (100 paise = 1 INR)
  "customer_name": "Arjun Sharma",
  "customer_email": "arjun@example.com",
  "customer_phone": "9876543210",
  "queue_token": "240115-001"
}
```

**Response:**
```json
{
  "order_id": "order_7Oy8kD4r5Ej9bZ",
  "amount": 50000,
  "currency": "INR",
  "key_id": "rzp_live_xxxxxxxx"
}
```

#### 2. Verify Payment

**Request:**
```bash
POST /api/v1/payment/verify
Content-Type: application/json

{
  "razorpay_order_id": "order_7Oy8kD4r5Ej9bZ",
  "razorpay_payment_id": "pay_7Oy8kD4r5Ej9bZ",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": "pay_7Oy8kD4r5Ej9bZ",
  "message": "Payment verified successfully!"
}
```

---

## Implementation Details

### Backend Services

**`app/services/payment_service.py`** — Payment handling
```python
class PaymentService:
    def create_order(...)              # Create Razorpay order
    def verify_payment(...)            # Verify signature
    def get_payment_details(...)       # Fetch payment info
```

**`app/api/v1/endpoints/payment.py`** — API routes
- `POST /api/v1/payment/create-order`
- `POST /api/v1/payment/verify`

**`app/schemas/payment.py`** — Request/response models
- `PaymentOrderRequest`
- `PaymentOrderResponse`
- `PaymentVerifyRequest`
- `PaymentVerifyResponse`

### Error Handling

- **Payment disabled:** Returns 503 if credentials missing
- **Order creation fails:** Returns 500 with descriptive error
- **Signature mismatch:** Returns success=false (fraud attempt)
- **Non-blocking:** System works without payments enabled

---

## Testing

### Local Testing (Without Real Payments)

Leave credentials empty in `.env`:
```bash
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Endpoints return 503 "Payment service not configured" (expected).

### Local Testing (With Test Payments)

1. Create Razorpay account
2. Use **Test Mode** keys:
   - Key ID: `rzp_test_xxxxxxxx`
   - Key Secret: (from test keys section)
3. Add to `.env`
4. Use test card numbers:
   - **Success:** `4111 1111 1111 1111` (Visa)
   - **Decline:** `4000 0000 0000 0002` (Visa)
   - Use any future expiry + any CVV

### Production Testing

Use **Live Mode** keys and real payment methods.

**Test scenarios:**
- Complete payment → Verify signature
- Failed payment → Check error handling
- Webhook delivery → Monitor Razorpay logs

---

## Frontend Integration (Coming Soon)

Frontend will need:

1. **Razorpay Checkout SDK**
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

2. **Payment Form Component**
   - Display order details
   - Show Razorpay checkout button
   - Handle success/failure

3. **Integration with Queue Join**
   - Option: "Pay Now" vs. "Join Without Payment"
   - On payment success → auto-join queue
   - On failure → retry option

---

## Monitoring

### Razorpay Dashboard

1. Go to **Payments** section
2. View all transactions:
   - Order ID
   - Amount
   - Status (authorized, failed, refunded)
   - Time
   - Logs

### Track in Logs

**Razorpay Console:**
- Real-time payment updates
- Webhook delivery status
- Refund tracking

**Render Logs:**
- Payment verification results
- API errors (if any)

---

## Pricing

**Razorpay Fees (India):**
- **Debit Card:** 0.5% + ₹0 (up to max)
- **Credit Card:** 2% + ₹0
- **UPI:** 0% (free)
- **Net Banking:** 0% (free) or 0.5%
- **Wallets:** Varies by wallet

**Example:**
- Customer pays ₹500 via debit card
- Razorpay fee: ₹2.50 (0.5% of 500)
- You receive: ₹497.50
- Monthly cost for 100 payments: ~₹100-500 depending on mix

**Cost Optimization:**
- Encourage UPI (0% fee)
- Offer cash option for walk-ins
- Negotiate rates at scale

---

## Security

✅ **HTTPS enforced** — All payments encrypted  
✅ **PCI DSS compliant** — Razorpay handles card storage  
✅ **Signature verification** — Prevents tampering  
✅ **Credentials in env vars** — Never in code  
✅ **No card data stored** — Razorpay tokenization  

**What NOT to do:**
- Don't store card numbers
- Don't hardcode API keys
- Don't log full payment IDs
- Don't share credentials in GitHub

---

## Future Enhancements

1. **Subscription Payments** — Monthly membership
2. **Automated Refunds** — On cancellation
3. **Payment Analytics** — Revenue tracking
4. **Webhooks** — Real-time payment updates
5. **Multiple Payment Methods** — ApplePay, GooglePay
6. **Invoice Generation** — PDF receipts
7. **Tax Compliance** — GST calculation
8. **Partial Refunds** — For service modifications

---

## Troubleshooting

### Payment Creation Fails

1. **Check credentials:**
   - Verify key ID and secret in Render dashboard
   - Wait 5 minutes after adding env vars
   - Check service redeployed successfully

2. **Check Razorpay account:**
   - Confirm account is active
   - Check balance (minimum required)
   - Verify payment gateway enabled

3. **Check request data:**
   - Amount > 0
   - Phone valid 10 digits
   - Email is valid format

### Signature Verification Fails

1. **Check order ID/payment ID:**
   - Copied correctly from Razorpay response
   - Not edited or truncated

2. **Check signature:**
   - From Razorpay checkout response
   - Not altered

3. **Check key secret:**
   - Exact match in env var
   - No extra spaces/newlines

### Payment Not Appearing

1. **Check Razorpay logs:**
   - https://dashboard.razorpay.com/payments
   - Confirm order created

2. **Check webhooks:**
   - Razorpay console → Settings → Webhooks
   - Verify delivery status

---

## Support & Links

| Resource | URL |
|----------|-----|
| Razorpay Dashboard | https://dashboard.razorpay.com |
| API Documentation | https://razorpay.com/docs |
| Test Card Numbers | https://razorpay.com/docs/cards/test-card-numbers |
| Pricing | https://razorpay.com/pricing |
| Support | support@razorpay.com |

---

**Razorpay Integration Status:** ✅ Production Ready (Backend)  
**Frontend Integration:** Pending  
**Last Updated:** November 24, 2024
