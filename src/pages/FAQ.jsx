import React from 'react';
import { Accordion, Container } from 'react-bootstrap';

export default function FAQ() {
  return (
    <Container className="my-5">
      <h1 className="mb-4 text-center">DailyPing FAQ</h1>

      <Accordion defaultActiveKey="0" flush>
        {/* GENERAL */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>What is DailyPing?</Accordion.Header>
          <Accordion.Body>
            DailyPing is your ADHD-friendly productivity companion. Every day, it asks you one question:
            <strong> “What’s your #1 goal today?”</strong> You respond with a goal and optional sub-tasks to build momentum.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>How does it work?</Accordion.Header>
          <Accordion.Body>
            <ol>
              <li>Receive a daily email or push ping</li>
              <li>Reply with your #1 goal and up to 3 subtasks</li>
              <li>Optionally add reminders</li>
              <li>Check off completed tasks</li>
              <li>Track your progress and build a streak!</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>

        {/* FEATURES */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Can I track subtasks and mark them complete?</Accordion.Header>
          <Accordion.Body>
            Yes! Each goal can include up to three subtasks. You can mark them complete on your dashboard, and when all are done, we prompt you with a surprise gratitude moment.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="3">
          <Accordion.Header>Can I add notes to my goals?</Accordion.Header>
          <Accordion.Body>
            Yes. Each goal and subtask can include a note to clarify what it means or add useful context.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="4">
          <Accordion.Header>What are Projects?</Accordion.Header>
          <Accordion.Body>
            Projects are groups of related goals. You can organize goals under a project title and description to track longer-term themes or efforts.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="5">
          <Accordion.Header>What is the Queue?</Accordion.Header>
          <Accordion.Body>
            The Queue is your backlog. Add a task or idea to save for later, and convert it into a goal when you're ready to focus on it.
          </Accordion.Body>
        </Accordion.Item>

        {/* REMINDERS */}
        <Accordion.Item eventKey="6">
          <Accordion.Header>How do reminders work?</Accordion.Header>
          <Accordion.Body>
            Pro users can attach multiple reminder times to each goal or subtask. These are sent by email or push notification.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="7">
          <Accordion.Header>Can I test push notifications?</Accordion.Header>
          <Accordion.Body>
            Yes! There’s a “Send me a push” test button in the admin panel to confirm everything is working.
          </Accordion.Body>
        </Accordion.Item>

        {/* SHARING */}
        <Accordion.Item eventKey="8">
          <Accordion.Header>Can I share my goals publicly?</Accordion.Header>
          <Accordion.Body>
            Yes. You can share goals via URLs like <code>dailyping.org/user/yourusername/yyyy-mm-dd</code>. You control what’s public.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="9">
          <Accordion.Header>What’s in my public profile?</Accordion.Header>
          <Accordion.Body>
            Your public profile includes your username, avatar, and any shared goals or projects you've chosen to make public.
          </Accordion.Body>
        </Accordion.Item>

        {/* PRO PLAN */}
        <Accordion.Item eventKey="10">
          <Accordion.Header>What’s included in the Pro plan?</Accordion.Header>
          <Accordion.Body>
            <ul>
              <li>Unlimited reminders per goal/subtask</li>
              <li>Push notifications</li>
              <li>Projects to organize your goals</li>
              <li>Priority support</li>
              <li>Future premium features included</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="11">
          <Accordion.Header>How do I upgrade to Pro?</Accordion.Header>
          <Accordion.Body>
            Go to your account settings or visit <a href="https://dailyping.org/billing">dailyping.org/billing</a> to subscribe.
          </Accordion.Body>
        </Accordion.Item>

        {/* ACCOUNT */}
        <Accordion.Item eventKey="12">
          <Accordion.Header>Can I sign in with Google?</Accordion.Header>
          <Accordion.Body>
            Yes, Google login is supported and makes it easy to get started quickly.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="13">
          <Accordion.Header>What happens if I don’t set a username?</Accordion.Header>
          <Accordion.Body>
            You’ll be prompted to set one after login. Until then, sharing and public profiles will be disabled.
          </Accordion.Body>
        </Accordion.Item>

        {/* SUPPORT */}
        <Accordion.Item eventKey="14">
          <Accordion.Header>I’m not receiving my daily pings. What do I do?</Accordion.Header>
          <Accordion.Body>
            <ol>
              <li>Check your spam folder</li>
              <li>Verify email and push settings in your profile</li>
              <li>Still stuck? Email <strong>support@dailyping.org</strong></li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="15">
          <Accordion.Header>I upgraded to Pro but it still says Free. Why?</Accordion.Header>
          <Accordion.Body>
            Stripe syncs may lag. Log out and back in after a few minutes. If it still doesn’t work, contact us.
          </Accordion.Body>
        </Accordion.Item>

        {/* CONTACT */}
        <Accordion.Item eventKey="16">
          <Accordion.Header>How do I contact support?</Accordion.Header>
          <Accordion.Body>
            Email us at <strong>support@dailyping.org</strong> or join our Discord community for real-time help.
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
