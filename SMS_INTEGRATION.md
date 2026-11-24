# SMS Integration with Twilio

## Overview

Added SMS notification functionality to automatically send customers updates about their queue position. Customers receive messages when they:
- Join the queue (welcome + position + ETA)
- Get called to the barber chair
- Other queue updates

---

## Setup Instructions

### Step 1: Create Twilio Account (5 minutes)

1. **Sign up:**
   - Go to https://www.twilio.com/try-twilio
   - Create account with email
   - Verify phone number

2. **Get API Credentials:**
   - Go to Console: https://console.twilio.com
   - Find **Account SID** and **Auth Token** (keep secret!)
   - Buy an Indian phone number:
     - Click **Phone Numbers → Buy a Number**
     - Select Country: **India**
     - Buy (costs ~$1 USD/month)
   - Copy the phone number (format: `+91XXXXXXXXXX`)

3. **Save credentials:**
   ```
   TWILIO_ACCOUNT_SID = your_account_sid
   TWILIO_AUTH_TOKEN = your_auth_token
   TWILIO_PHONE_NUMBER = +91XXXXXXXXXX
   ```

### Step 2: Update Environment Variables

#### Local Development

**Edit `backend/.env`:**
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+91XXXXXXXXXX
```

**Leave blank to disable SMS** (useful for testing):
```bash
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

#### Production (Render)

1. Go to **Render Dashboard**
2. Select your backend service
3. Go to **Settings → Environment**
4. Add three new variables:
   - `TWILIO_ACCOUNT_SID` = (your account SID)
   - `TWILIO_AUTH_TOKEN` = (your auth token)
   - `TWILIO_PHONE_NUMBER` = (your phone number)
5. Service automatically redeploys

### Step 3: Install Dependencies

Backend already includes Twilio:
```bash
# Already in requirements.txt
twilio==9.0.4
```

Install locally:
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

---

## How It Works

### SMS Triggers

#### 1. Welcome SMS (On Join)
When a customer joins queue:
```
Hi Arjun! You're in The Sovereign Blade queue. 
Token: 240115-001. Position: #3. Est. wait: 15 min.
```

#### 2. Called SMS (Status = "Called")
When receptionist calls the customer:
```
Hi Arjun! It's your turn! Token: 240115-001. 
Proceed to Rajan. The Sovereign Blade.
```

#### 3. Future: Approaching SMS (Position #2)
Automatic notification when getting close (optional enhancement):
```
Hi Arjun! You're next at The Sovereign Blade. 
Token: 240115-001. Get ready!
```

### Code Flow

```
Customer joins queue
         ↓
POST /api/v1/queue/join
         ↓
queue_service.join_queue()
         ↓
Create queue entry in DB
         ↓
Call sms_service.send_queue_joined_sms()
         ↓
Twilio API sends SMS to customer
         ↓
SMS delivered! ✓
```

---

## Implementation Details

### Backend Services

**`app/services/sms_service.py`** — SMS functionality
```python
class SMSService:
    def send_sms(to_phone, message)              # Raw SMS
    def send_queue_joined_sms(...)               # Welcome
    def send_called_sms(...)                     # Your turn!
    def send_approaching_sms(...)                # Next soon
    def send_wait_update_sms(...)                # ETA update
```

**`app/services/queue_service.py`** — Integration points
- `join_queue()` — Sends welcome SMS after joining
- `transition_status()` — Sends "called" SMS when status changes

**`app/core/config.py`** — Settings
```python
twilio_account_sid: str = ""
twilio_auth_token: str = ""
twilio_phone_number: str = ""
```

### Error Handling

- **SMS is non-blocking** — If Twilio fails, queue entry is still created
- **Graceful degradation** — System works fine without SMS
- **Errors logged** but don't crash the app
- **Empty credentials** = SMS disabled (safe for local development)

---

## Testing

### Local Testing (Without Real SMS)

Leave Twilio credentials empty in `.env`:
```bash
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

Queue operations work normally, SMS just skipped (no errors).

### Local Testing (With Real SMS)

1. Add your Twilio credentials to `.env`
2. Add your personal phone number to test database customer
3. Register a customer in the queue
4. You'll receive actual SMS!

### Production Testing

Use **Twilio Console** to view:
- Message logs: https://console.twilio.com/us1/messaging/services
- Delivery status: Check if SMS sent/delivered/failed
- Phone logs: See all messages sent to any number

---

## Usage Examples

### Manual SMS Send (Backend Code)

```python
from app.services.sms_service import get_sms_service

sms = get_sms_service()
sms.send_sms("+919876543210", "Hello from The Sovereign Blade!")

# Or use pre-built templates:
sms.send_queue_joined_sms("Arjun", "9876543210", "240115-001", 3, 15)
sms.send_called_sms("Arjun", "9876543210", "240115-001", "Rajan")
```

### API Integration

When customer posts to `/api/v1/queue/join`:
1. Queue entry created
2. SMS automatically sent
3. Response includes token for status tracking

---

## Troubleshooting

### SMS Not Sending

1. **Check if enabled:**
   - Verify `TWILIO_ACCOUNT_SID` is set (not empty)
   - Backend logs will say "SMS enabled" or "SMS disabled"

2. **Check Twilio credentials:**
   ```bash
   curl -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
     https://api.twilio.com/2010-04-01/Accounts
   ```

3. **Check phone number format:**
   - Should be `+91XXXXXXXXXX` (India)
   - 10 digits after country code
   - No spaces or dashes

4. **Check Twilio account balance:**
   - SMS costs ~$0.07 USD per message
   - Verify account has balance

5. **Check phone number is verified:**
   - Some countries require verification
   - See Twilio Console → Phone Numbers

6. **Check message length:**
   - Max 160 characters (longer = split into multiple SMS, costs more)
   - Current messages are ~100 chars

### Production Deployment Issues

1. **Render not picking up credentials:**
   - Wait 5 minutes after adding env vars
   - Check "Redeployment" tab to see if deploy succeeded
   - Restart service manually if needed

2. **Still getting errors:**
   - Check Render logs: **Service → Logs**
   - Look for "SMS" error messages
   - Verify credentials match Twilio Console

---

## Monitoring & Analytics

### View Sent Messages

**Twilio Console:**
1. Go to https://console.twilio.com
2. **Messaging → Message insights**
3. See all SMS sent
4. Check delivery status

### Metrics

Track in production:
- SMS sent per day
- Delivery success rate
- Failed messages (why?)
- Cost (messages × $0.07)

---

## Pricing

**Twilio SMS Costs (India):**
- Incoming: FREE
- Outgoing: ~$0.07 USD per SMS
- Phone number: ~$1 USD/month

**Estimate for 100 customers/day:**
- 100 welcome SMS: $7
- 100 "called" SMS: $7
- Monthly: ~$450 + $1 phone number
- **Budget: $500/month for active salon**

**Cost Optimization:**
- Use `condition` before sending SMS
- Only send critical notifications
- Batch similar messages
- Use shorter messages (keep under 160 chars)

---

## Future Enhancements

1. **Scheduled SMS:** Send ETA reminder 5 mins before turn
2. **Two-Way SMS:** Customers text back to cancel
3. **WhatsApp Integration:** Send WhatsApp instead (cheaper, better UX)
4. **SMS Delivery Tracking:** Log success/failure in database
5. **Customer Opt-Out:** Let customers unsubscribe
6. **Multi-Language:** Send SMS in Gujarati/Hindi
7. **Personalization:** Use customer name, barber preference

---

## Security & Privacy

✅ **Phone numbers encrypted** in database  
✅ **Credentials stored in env vars** (never in code)  
✅ **SMS content is public** (don't send passwords)  
✅ **Twilio has data residency** in India regions available  
✅ **Compliant with India TRAI rules** for SMS

**What NOT to do:**
- Don't hardcode credentials
- Don't send OTPs via SMS (use email instead)
- Don't log phone numbers in plain text
- Don't share credentials in GitHub

---

## Support & Links

| Resource | URL |
|----------|-----|
| Twilio Docs | https://www.twilio.com/docs |
| Twilio Console | https://console.twilio.com |
| Twilio Python SDK | https://github.com/twilio/twilio-python |
| Pricing | https://www.twilio.com/sms/pricing |
| Account Status | https://www.twilio.com/account/billing |

---

**SMS Integration Status:** ✅ Production Ready  
**Last Updated:** November 24, 2024
