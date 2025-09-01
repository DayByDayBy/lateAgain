// Email service - SECURE IMPLEMENTATION
// Note: Email sending has been moved to backend to prevent API key exposure
// This is a placeholder that should be replaced with a backend API call

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export interface EmailData {
  to: string;
  subject: string;
  text: string;
  from?: string;
}

export async function sendEmail(emailData: EmailData, retryCount = 0): Promise<void> {
  const { to, subject, text, from = 'noreply@lateagain.com' } = emailData;

  // SECURITY FIX: Email sending moved to backend to prevent API key exposure
  // This should be replaced with a call to your backend API endpoint
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://test-backend.com';

  try {
    const response = await fetch(`${backendUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers as needed
      },
      body: JSON.stringify({
        to,
        subject,
        text,
        from,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Email sent successfully to:', to, result);
  } catch (error: any) {
    console.error('Email service error:', error);

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