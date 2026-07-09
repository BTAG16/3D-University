# Resend Setup

Resend is used to send the super admin one-time login code via email.

## 1. Create an account

Go to [resend.com](https://resend.com) and sign up. The free tier allows 3,000 emails/month.

## 2. Get your API key

1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click **Create API Key**
3. Give it a name (e.g. `campus-explorer`)
4. Copy the key — you'll need it in two places

## 3. Set the key as a Supabase secret

The API key is used by the Edge Function, not the frontend. Set it as a Supabase secret:

```bash
npx supabase secrets set RESEND_API_KEY=re_your-key-here
```

Do **not** put this key in your `.env` file or commit it anywhere.

## 4. Configure the sender address

By default the function uses Resend's sandbox sender (`onboarding@resend.dev`), which works for testing but has rate limits.

For production, verify your own domain:

1. Go to [resend.com/domains](https://resend.com/domains)
2. Add your domain and follow the DNS verification steps
3. Once verified, set your sender in Supabase:

```bash
npx supabase secrets set RESEND_FROM_EMAIL="Campus Explorer <noreply@your-domain.com>"
```

## 5. Test it

Once deployed, visit `/super-admin/login` and click the button to receive a one-time code. Check your inbox (and spam folder).
