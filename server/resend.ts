// Resend Email Integration
// Using Replit's Resend connection for transactional emails

import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'noreply@triadblue.com'
  };
}

// Send a password reset email
export async function sendPasswordResetEmail(
  toEmail: string, 
  resetToken: string, 
  platform: 'linkblue' | 'consoleblue',
  userName?: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const baseUrl = 'https://triadblue.com';
    const resetUrl = `${baseUrl}/${platform}/reset-password?token=${resetToken}`;
    const platformName = platform === 'linkblue' ? 'LINKBlue Dashboard' : 'ConsoleBlue Panel';
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Password Reset Request - ${platformName}`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">TriadBlue</h1>
            <p style="color: #666; font-size: 14px; margin-top: 4px;">${platformName}</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 32px; margin-bottom: 24px;">
            <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 16px 0;">Password Reset Request</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              ${userName ? `Hi ${userName},<br><br>` : ''}We received a request to reset your password for your ${platformName} account. Click the button below to create a new password.
            </p>
            
            <a href="${resetUrl}" style="display: inline-block; background: #0066ff; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px;">
              Reset Password
            </a>
            
            <p style="color: #888; font-size: 13px; margin-top: 24px; margin-bottom: 0;">
              This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; color: #888; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} TriadBlue. All rights reserved.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend email error:', error);
      return false;
    }

    console.log('Password reset email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}
