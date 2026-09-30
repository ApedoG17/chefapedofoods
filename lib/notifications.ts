export async function sendDeliverySMS(phone: string, customerName: string, orderId: string) {
  if (!phone) return false;

  // Format the phone number to ensure it has the 233 country code
  let formattedPhone = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '233' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('233') && formattedPhone.length === 9) {
    formattedPhone = '233' + formattedPhone;
  }

  // The short, punchy message the student will receive
  const shortOrderId = orderId.split('-')[0]?.toUpperCase() || orderId;
  const message = `Hello ${customerName || 'Customer'}, your Chef Apedo Foods order #${shortOrderId} is OUT FOR DELIVERY! Please be ready to meet the dispatch rider shortly.`;

  // If using placeholder key in development or test, mock successful send
  if (!process.env.SMS_API_KEY || process.env.SMS_API_KEY === 'placeholder_sms_key') {
    console.log(`[SMS MOCK] Dispatched to ${formattedPhone}: "${message}"`);
    return true;
  }

  try {
    // Standard Arkesel SMS API (widely used in Ghana)
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': process.env.SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: process.env.SMS_SENDER_ID || 'CHEF APEDO',
        message: message,
        recipients: [formattedPhone],
      }),
    });

    const result = await response.json();
    console.log(`SMS dispatched to ${formattedPhone}:`, result);
    return true;
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
    return false;
  }
}

export async function sendFeedbackSMS(
  phone: string,
  customerName: string,
  orderId: string,
  domainUrl: string
) {
  if (!phone) return false;

  let formattedPhone = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '233' + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith('233') && formattedPhone.length === 9) {
    formattedPhone = '233' + formattedPhone;
  }

  const feedbackUrl = `${domainUrl}/feedback/${orderId}`;
  const message = `Hi ${customerName || 'Customer'}, hope you enjoyed your Chef Apedo meal! Let us know how we did: ${feedbackUrl}`;

  // If using placeholder key in development or test, mock successful send
  if (!process.env.SMS_API_KEY || process.env.SMS_API_KEY === 'placeholder_sms_key') {
    console.log(`[FEEDBACK SMS MOCK] Dispatched to ${formattedPhone}: "${message}"`);
    return true;
  }

  try {
    const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': process.env.SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: process.env.SMS_SENDER_ID || 'CHEF APEDO',
        message: message,
        recipients: [formattedPhone],
      }),
    });

    console.log(`Feedback SMS dispatched to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('Failed to send feedback SMS:', error);
    return false;
  }
}

