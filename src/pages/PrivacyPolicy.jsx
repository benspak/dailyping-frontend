import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="container py-5">
      <h1 className="mb-4">Privacy Policy for DailyPing</h1>
      <p><strong>Effective Date:</strong> April 12, 2025</p>

      <h4>1. Information We Collect</h4>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, and password when you sign up.</li>
        <li><strong>Activity Data:</strong> Goal submissions, login streaks, task completions, and interaction logs.</li>
        <li><strong>Device Data:</strong> IP address, browser type, operating system—for security and analytics purposes.</li>
      </ul>

      <h4>2. How We Use Your Information</h4>
      <ul>
        <li>To deliver and maintain DailyPing’s features.</li>
        <li>To track goal and login streaks, reminders, and productivity trends.</li>
        <li>To personalize your dashboard and notifications.</li>
        <li>To improve our performance, reliability, and UX through analytics.</li>
      </ul>

      <h4>3. Sharing Your Information</h4>
      <ul>
        <li>We <strong>do not sell</strong> your data.</li>
        <li>We only share data with trusted vendors (e.g., email providers, analytics platforms) under strict confidentiality agreements.</li>
        <li>We may disclose information if legally required or to protect our service and users.</li>
      </ul>

      <h4>4. Data Retention</h4>
      <p>We retain your information as long as your account is active. You can request data deletion anytime by emailing <a href="mailto:support@dailyping.org">support@dailyping.org</a>.</p>

      <h4>5. Security</h4>
      <p>We use HTTPS, encrypted storage, and industry-standard best practices. However, no internet transmission is 100% secure—please use a strong password and be cautious online.</p>

      <h4>6. Your Rights</h4>
      <ul>
        <li>Access, correct, or delete your personal data.</li>
        <li>Opt out of promotional emails.</li>
        <li>If you're in the EU or California, additional legal rights may apply.</li>
      </ul>

      <h4>7. Children’s Privacy</h4>
      <p>DailyPing is not intended for children under 13. We do not knowingly collect data from children.</p>

      <h4>8. Changes to This Policy</h4>
      <p>We may occasionally update this policy. You’ll be notified of significant changes via email or in-app notice.</p>

    </div>
  );
}
