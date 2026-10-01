// Replace the URL and headers if Agoo's documentation specifies a different format
const AGOO_API_URL = 'https://api.agoosms.com/v1/sms/send';

export async function sendDeliverySMS(phone: string, customerName: string, orderId: string) {
  let formattedPhone = phone.replace(/\s+/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = '233' + formattedPhone.substring(1);

  const shortOrderId = orderId.split('-')[0]?.toUpperCase() || orderId.toUpperCase();
  const message = `Hi ${customerName}, your Chef Apedo order #${shortOrderId} is out for delivery! Our rider will call you shortly.`;

  try {
    const response = await fetch(AGOO_API_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.SMS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: message,
        senderId: process.env.SMS_SENDER_ID || 'CHEF APEDO',
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send Agoo delivery SMS:', error);
    return false;
  }
}

export async function sendFeedbackSMS(phone: string, customerName: string, orderId: string, domainUrl: string) {
  let formattedPhone = phone.replace(/\s+/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = '233' + formattedPhone.substring(1);

  const feedbackUrl = `${domainUrl}/feedback/${orderId}`;
  const message = `Hi ${customerName}, hope you enjoyed your Chef Apedo meal! Let us know how we did: ${feedbackUrl}`;

  try {
    const response = await fetch(AGOO_API_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.SMS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: message,
        senderId: process.env.SMS_SENDER_ID || 'CHEF APEDO',
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send Agoo feedback SMS:', error);
    return false;
  }
}

