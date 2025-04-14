import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container py-5">
      {/* Header */}
      <section className="text-center mb-5">
        <h1 className="display-4 fw-bold">Start your day with clarity.</h1>
        <p className="lead mt-3">
          DailyPing is your ADHD-friendly productivity buddy. <br />
          Every day, we ask just one question: <strong>“What’s your #1 goal?”</strong> <br />
          You commit. You get it done. You build momentum.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <button className="btn btn-dark btn-lg" onClick={() => navigate('/login')}>Start Free</button>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-5">
        <h2 className="h4 fw-bold mb-3">How It Works</h2>
        <ul className="list-unstyled">
          <li>• Wake up to a daily email or push ping</li>
          <li>• Set your #1 goal + 3 subtasks</li>
          <li>• Optional: add reminders to stay on track</li>
          <li>• Check off tasks. Celebrate progress.</li>
        </ul>
        <blockquote className="blockquote mt-3">
          <p className="fst-italic">No dashboards to obsess over. Just momentum.</p>
        </blockquote>
      </section>

      {/* Why It Works */}
      <section className="mb-5">
        <h2 className="h4 fw-bold mb-3">Why It Works</h2>
        <ul className="list-unstyled">
          <li>✅ ADHD-friendly design</li>
          <li>🧠 Builds mindful habits</li>
          <li>🛠 Reduces overwhelm with tiny tasks</li>
          <li>🎯 Triggers deep focus</li>
          <li>📈 Helps track consistency</li>
        </ul>
      </section>

      {/* Built For Humans */}
      <section className="mb-5">
        <h2 className="h4 fw-bold mb-3">Built for humans, not hustle culture</h2>
        <p>DailyPing is for indie makers, creatives, students, and anyone who wants to move forward without burnout.</p>
      </section>

      <section className="mb-5">
        <h2 className="h4 fw-bold mb-3">What’s New</h2>
        <ul className="list-unstyled">
          <li>✨ AI-powered subtask suggestions</li>
          <li>📝 Add notes + reminders to goals</li>
          <li>✅ Mark subtasks complete on dashboard</li>
          <li>📅 View upcoming goals in calendar cards</li>
          <li>🔗 Share public links to goals and projects</li>
          <li>📦 Organize your week with Projects + Queue</li>
        </ul>
      </section>

      {/* Pricing */}
      <section className="mb-5">
        <h2 className="h4 fw-bold mb-3">Pricing</h2>

        <div className="row">
          <div className="col-md-6 mb-4">
            <h3 className="h5 fw-semibold">Free Forever</h3>
            <ul className="list-unstyled">
              <li>✔️ Custom ping time (email, push notification)</li>
              <li>✔️ Choose tone (motivational, gentle, snarky)</li>
              <li>✔️ Weekly summary reports</li>
            </ul>
          </div>
          <div className="col-md-6 mb-4">
            <h3 className="h5 fw-semibold">Pro — $12/yr</h3>
            <ul className="list-unstyled">
              <li>⭐ Goal & subtask reminders (email/push)</li>
              <li>⭐ Calendar view</li>
              <li>⭐ Goal sharing & Projects</li>
              <li>⭐ Smart queue for unplanned tasks</li>
              <li>⭐ Unlock AI suggestions</li>
            </ul>
          </div>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-3">
          <button className="btn btn-dark btn-lg" onClick={() => navigate('/login')}>Start Free</button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-5">
        <h2 className="h4 fw-bold mb-4">Join early makers getting s#!t done.</h2>
        <blockquote className="blockquote">
          <p className="mb-1">"DailyPing got me out of bed and back into focus."</p>
          <footer className="blockquote-footer">Lena, solo founder</footer>
        </blockquote>
        <blockquote className="blockquote mt-4">
          <p className="mb-1">"I finally have a system that doesn’t stress me out."</p>
          <footer className="blockquote-footer">James, ADHD coach</footer>
        </blockquote>
        <blockquote className="blockquote mt-4">
          <p className="mb-1">"The AI suggestions help me break down goals when my brain is stuck."</p>
          <footer className="blockquote-footer">Talia, grad student with ADHD</footer>
        </blockquote>
      </section>

      {/* Final CTA */}
      <section className="text-center mb-5">
        <h2 className="h4 fw-bold mb-3">Try it. You’ll love it.</h2>
        <p>No spam. No noise. Just one mindful moment each morning.</p>
        <button className="btn btn-primary btn-lg mt-3" onClick={() => navigate('/login')}>
          Start Now – It’s Free
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center border-top pt-3">
        <p className="text-muted">Built indie-style with ❤️ by <a href="https://benjaminspak.com" target="_blank">Ben Spak</a></p>
      </footer>
    </div>
  );
}
