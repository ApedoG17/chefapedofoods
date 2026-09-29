# Pre-Launch Security Checklist

- [x] **Purge Legacy Gateways:** Ensure all Paystack keys, routes, and UI references are completely deleted from the repository.
- [ ] **Rotate Placeholder Keys:** Replace `placeholder_client_id` and `placeholder_sms_key` in Vercel with live production credentials.
- [ ] **Verify Supabase RLS:** Confirm that Row Level Security is active on the `orders` table and blocks unauthorized public reads.
- [ ] **Disable KDS Public Access:** Ensure the `/admin` route is wrapped in an authentication check (e.g., Supabase Auth or a hardcoded admin password environment variable) before sharing the live link.
- [ ] **Check Error Handling:** Verify that failed API calls do not return full stack traces or environment variables to the frontend.
