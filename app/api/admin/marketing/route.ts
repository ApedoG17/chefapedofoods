import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch all customer phone numbers from the customers table
    const { data: customers, error } = await supabase
      .from('customers')
      .select('phone');

    if (error) {
      console.error('Supabase Customers Query Error:', error);
      throw error;
    }

    // Extract unique, valid phone numbers and format to Ghana international format (233XXXXXXXXX)
    const uniquePhones = Array.from(
      new Set(
        (customers || [])
          .map((c: any) => {
            let phone = (c.phone || '').replace(/[\s\-()]/g, '');
            if (phone.startsWith('+')) phone = phone.substring(1);
            if (phone.startsWith('0')) phone = '233' + phone.substring(1);
            return phone;
          })
          .filter((phone: string) => phone && phone.length >= 10)
      )
    );

    if (uniquePhones.length === 0) {
      return NextResponse.json({ error: 'No customer phone numbers found.' }, { status: 400 });
    }

    const apiKey = process.env.SMS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SMS_API_KEY environment variable is not configured.' }, { status: 500 });
    }

    const senderId = process.env.SMS_SENDER_ID || 'CHEF APEDO';

    // Fire concurrent requests to the Agoo single-send endpoint
    const sendPromises = uniquePhones.map(async (phone) => {
      try {
        const res = await fetch('https://api.agoosms.com/v1/sms/send', {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: phone,
            message: message.trim(),
            senderId: senderId,
          }),
        });
        return res.ok;
      } catch (err) {
        console.error(`Failed to send SMS to ${phone}:`, err);
        return false;
      }
    });

    const results = await Promise.all(sendPromises);
    const successfulSends = results.filter(Boolean).length;

    if (successfulSends === 0) {
      throw new Error('Agoo API rejected all requests. Check your Sender ID approval or API Key balance.');
    }

    return NextResponse.json({
      success: true,
      count: successfulSends,
      totalAttempted: uniquePhones.length,
    });
  } catch (error: any) {
    console.error('Marketing SMS Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send broadcast.' },
      { status: 500 }
    );
  }
}
