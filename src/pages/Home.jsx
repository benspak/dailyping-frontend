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
          DailyPing asks you one simple question every morning:<br />
          <strong>“What’s your #1 goal today?”</strong><br />
          You reply. You commit. You get it done.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <button className="btn btn-dark btn-lg" onClick={() => navigate('/login')}>Start Free</button>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-5">
        <h2 className="h4 fw-bold mb-3">How It Works</h2>
        <ul className="list-unstyled">
          <li>• <strong>Every morning</strong>, we ping you by email (or text).</li>
          <li>• You answer with your top goal for the day.</li>
          <li>• Your streak grows. Your mind clears. You focus.</li>
        </ul>
        <blockquote className="blockquote mt-3">
          <p className="fst-italic">No dashboards to obsess over. Just momentum.</p>
        </blockquote>
      </section>

      {/* Why It Works */}
      <section className="mb-5">
        <h2 className="h4 fw-bold mb-3">Why It Works</h2>
        <ul className="list-unstyled">
          <li>✅ Clarity over clutter</li>
          <li>🧠 Builds daily intention</li>
          <li>🔁 Turns goals into habits</li>
          <li>💥 Breaks procrastination loops</li>
        </ul>
      </section>

      {/* Built For Humans */}
      <section className="mb-5">
        <h2 className="h4 fw-bold mb-3">Built for humans, not hustle culture</h2>
        <p>DailyPing is for indie makers, creatives, students, and anyone who wants to move forward without burnout.</p>
      </section>

      {/* Pricing */}
      <section className="mb-5">
        <h2 className="h4 fw-bold mb-3">Pricing</h2>

        <div className="row">
          <div className="col-md-6 mb-4">
            <h3 className="h5 fw-semibold">Free Forever</h3>
            <ul className="list-unstyled">
              <li>✔️ 1 daily ping (email, push notification)</li>
              <li>✔️ Private dashboard</li>
              <li>✔️ Streak tracker</li>
              <li>✔️ Custom ping time</li>
              <li>✔️ Choose tone (motivational, gentle, snarky)</li>
              <li>✔️ Weekly summary reports</li>
            </ul>
          </div>
          <div className="col-md-6 mb-4">
            <h3 className="h5 fw-semibold">Pro — $5/mo</h3>
            <ul className="list-unstyled">
              <li>⭐ Coming soon</li>
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
