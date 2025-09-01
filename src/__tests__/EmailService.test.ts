import { sendEmail, generateEmailSubject } from '../emailService';

// Mock fetch for backend API calls
global.fetch = jest.fn();

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable for testing
    process.env.EXPO_PUBLIC_BACKEND_URL = 'https://test-backend.com';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_BACKEND_URL;
  });

  describe('sendEmail', () => {
    it('sends email successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
      };

      await expect(sendEmail(emailData)).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith('https://test-backend.com/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"to":"test@example.com"'),
      });
      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body).toEqual({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
        from: 'noreply@lateagain.com',
      });
    });

    it('uses custom from address when provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
        from: 'custom@lateagain.com',
      };

      await sendEmail(emailData);
      expect(global.fetch).toHaveBeenCalledWith('https://test-backend.com/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"to":"test@example.com"'),
      });
      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body).toEqual({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
        from: 'custom@lateagain.com',
      });
    });

    it('retries on failure', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue({ success: true }),
        });

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
      };

      await expect(sendEmail(emailData)).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('throws error after max retries', async () => {
      const error = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(error);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
      };

      await expect(sendEmail(emailData)).rejects.toThrow('Failed to send email after 3 attempts');
      expect(global.fetch).toHaveBeenCalledTimes(4);
    }, 10000); // 10 second timeout for retry test

    it('throws error when backend URL is missing', async () => {
      delete process.env.EXPO_PUBLIC_BACKEND_URL;

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test message',
      };

      await expect(sendEmail(emailData)).rejects.toThrow('Failed to send email after 3 attempts');
    }, 10000); // 10 second timeout
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