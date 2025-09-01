import { sendEmail, generateEmailSubject } from '../emailService';

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

const mockSendGrid = require('@sendgrid/mail');

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable for testing
    process.env.EXPO_PUBLIC_SENDGRID_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_SENDGRID_API_KEY;
  });

  describe('sendEmail', () => {
    it('sends email successfully', async () => {
      mockSendGrid.send.mockResolvedValue([{ statusCode: 202 }]);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
      };

      await expect(sendEmail(emailData)).resolves.toBeUndefined();
      expect(mockSendGrid.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: 'noreply@lateagain.com',
        subject: 'Test Subject',
        text: 'Test message',
      });
    });

    it('uses custom from address when provided', async () => {
      mockSendGrid.send.mockResolvedValue([{ statusCode: 202 }]);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
        from: 'custom@lateagain.com',
      };

      await sendEmail(emailData);
      expect(mockSendGrid.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: 'custom@lateagain.com',
        subject: 'Test Subject',
        text: 'Test message',
      });
    });

    it('retries on failure', async () => {
      mockSendGrid.send
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue([{ statusCode: 202 }]);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
      };

      await expect(sendEmail(emailData)).resolves.toBeUndefined();
      expect(mockSendGrid.send).toHaveBeenCalledTimes(2);
    });

    it('throws error after max retries', async () => {
      const error = new Error('SendGrid error');
      mockSendGrid.send.mockRejectedValue(error);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
      };

      await expect(sendEmail(emailData)).rejects.toThrow('Failed to send email after 3 attempts');
      expect(mockSendGrid.send).toHaveBeenCalledTimes(3);
    });

    it('throws error when API key is missing', async () => {
      delete process.env.EXPO_PUBLIC_SENDGRID_API_KEY;

      expect(() => {
        // Re-import to trigger the error
        require('../emailService');
      }).toThrow('SendGrid API key not found');
    });
  });

  describe('generateEmailSubject', () => {
    it('generates correct subject for Late issue', () => {
      const subject = generateEmailSubject('Late', 101, 'Test Company');
      expect(subject).toBe('Delay Report for Route 101 - Test Company');
    });

    it('generates correct subject for Early issue', () => {
      const subject = generateEmailSubject('Early', 102, 'Another Company');
      expect(subject).toBe('Early Arrival Report for Route 102 - Another Company');
    });

    it('generates correct subject for Cancelled issue', () => {
      const subject = generateEmailSubject('Cancelled', 103, 'Third Company');
      expect(subject).toBe('Cancellation Report for Route 103 - Third Company');
    });

    it('generates correct subject for Other issue', () => {
      const subject = generateEmailSubject('Other', 104, 'Fourth Company');
      expect(subject).toBe('Issue Report for Route 104 - Fourth Company');
    });

    it('handles unknown issue types', () => {
      const subject = generateEmailSubject('Unknown' as any, 105, 'Test Company');
      expect(subject).toBe('Issue Report for Route 105 - Test Company');
    });
  });
});