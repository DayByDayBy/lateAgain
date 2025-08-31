import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.EXPO_PUBLIC_SENDGRID_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

if (!SENDGRID_API_KEY) {
  throw new Error('SendGrid API key not found. Please set EXPO_PUBLIC_SENDGRID_API_KEY in your .env file.');
}

sgMail.setApiKey(SENDGRID_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  text: string;
  from?: string;
}

export async function sendEmail(emailData: EmailData, retryCount = 0): Promise<void> {
  const { to, subject, text, from = 'noreply@lateagain.com' } = emailData;

  const msg = {
    to,
    from,
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully to:', to);
  } catch (error: any) {
    console.error('SendGrid error:', error);

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying email send (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return sendEmail(emailData, retryCount + 1);
    }

    // If all retries failed, throw the error
    throw new Error(`Failed to send email after ${MAX_RETRIES} attempts: ${error.message}`);
  }
}

export function generateEmailSubject(issueType: string, routeNumber: number, companyName: string): string {
  const issueMap: Record<string, string> = {
    Late: 'Delay Report',
    Early: 'Early Arrival Report',
    Cancelled: 'Cancellation Report',
    Other: 'Issue Report',
  };

  const issueText = issueMap[issueType] || 'Issue Report';
  return `${issueText} for Route ${routeNumber} - ${companyName}`;
}