import { buildMimeMessage } from '../payslip-ui/functions/lib/gmail.js';
import assert from 'assert';

console.log("Starting test for buildMimeMessage...");

// Test Case 1: Simple email body
const email1 = buildMimeMessage({
  from: "sender@example.com",
  to: "receiver@example.com",
  subject: "Test 1",
  text: "Hello, World!\nThis is a test email."
});

console.log("Email 1 Content:\n" + email1);

// Verifications
assert.ok(email1.includes('Content-Type: text/html; charset="UTF-8"'));
assert.ok(email1.includes('Hello, World!<br>This is a test email.'));
assert.ok(email1.includes('<span style="color: blue; font-style: italic;">This is an automatically generated email. Please do not reply to this mail id.<br>Office, Kerala School of Mathematics</span>'));

// Test Case 2: Email body with special characters and URLs
const email2 = buildMimeMessage({
  from: "sender@example.com",
  to: "receiver@example.com",
  subject: "Test 2",
  text: "Reset your password here: https://example.com/reset?token=123&user=john\nEnjoy & be safe <tag>."
});

console.log("Email 2 Content:\n" + email2);
assert.ok(email2.includes('<a href="https://example.com/reset?token=123&amp;user=john">https://example.com/reset?token=123&amp;user=john</a>'));
assert.ok(email2.includes('Enjoy &amp; be safe &lt;tag&gt;.'));

console.log("All tests passed successfully!");
