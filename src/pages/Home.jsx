import React from 'react';

const Home = () => {
  return (
    <div className="container mt-5 px-3">
      <style>{`
        body {
          font-family: sans-serif;
          margin: 0;
          padding: 0;
          background: #f9f9f9;
          color: #222;
        }
        header, section, footer {
          max-width: 800px;
          margin: auto;
          padding: 2rem;
        }
        h1, h2, h3 {
          color: #111;
        }
        .button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #111;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          margin: 0.5rem 0.25rem;
        }
        ul {
          padding-left: 1.2rem;
        }
        blockquote {
          font-style: italic;
          margin: 1rem 0;
          padding-left: 1rem;
          border-left: 4px solid #ccc;
        }
      `}</style>

      <header>
        <h1>Start your day with clarity.</h1>
        <p>
          DailyPing asks you one simple question every morning:<br />
          <strong>“What’s your #1 goal today?”</strong><br />
          You reply. You commit. You get it done.
        </p>
        <a href="/login" className="button">Start Free</a>
        <a href="/login" className="button">View Demo</a>
      </header>

      <section>
        <h2>How It Works</h2>
        <ul>
          <li><strong>Every morning</strong>, we ping you by email (or text).</li>
          <li>You answer with your top goal for the day.</li>
          <li>Your streak grows. Your mind clears. You focus.</li>
        </ul>
        <blockquote>No dashboards to obsess over. Just momentum.</blockquote>
      </section>

      <section>
        <h2>Why It Works</h2>
        <ul>
          <li>✅ Clarity over clutter</li>
          <li>🧠 Builds daily intention</li>
          <li>🔁 Turns goals into habits</li>
          <li>💥 Breaks procrastination loops</li>
        </ul>
      </section>

      <section>
        <h2>Built for humans, not hustle culture</h2>
        <p>DailyPing is for indie makers, creatives, students, and anyone who wants to move forward without burnout.</p>
      </section>

      <section>
        <h2>Pricing</h2>
        <h3>Free Forever</h3>
        <ul>
          <li>✔️ 1 daily ping (email)</li>
          <li>✔️ Private dashboard</li>
          <li>✔️ Streak tracker</li>
        </ul>

        <h3>Pro — $5/mo</h3>
        <ul>
          <li>⭐ Custom ping time</li>
          <li>⭐ Choose tone (motivational, gentle, snarky)</li>
          <li>⭐ Weekly summary reports</li>
          <li>⭐ SMS or Telegram delivery</li>
          <li>⭐ Notion + Calendar integration (coming soon)</li>
        </ul>
        <a href="/login" className="button">Start Free</a>
        <a href="/login" className="button">Go Pro</a>
      </section>

      <section>
        <h2>Join early makers getting s#!t done.</h2>
        <blockquote>
          "DailyPing got me out of bed and back into focus."<br />
          — <em>Lena, solo founder</em>
        </blockquote>
        <blockquote>
          "I finally have a system that doesn’t stress me out."<br />
          — <em>James, ADHD coach</em>
        </blockquote>
      </section>

      <section>
        <h2>Try it. You’ll love it.</h2>
        <p>No spam. No noise. Just one mindful moment each morning.</p>
        <a href="/login" className="button">Start Now – It’s Free</a>
      </section>

      <footer>
        <p>Built indie-style with ❤️ by Ben Spak</p>
      </footer>
    </div>
  );
};

export default Home;
