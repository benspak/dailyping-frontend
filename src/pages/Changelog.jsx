import React from "react";
import changelogEntries from "../data/changelog.json";

const typeBadge = {
  feature: "primary",
  update: "info",
  bugfix: "danger"
};

export default function Changelog() {
  // Sort by descending date
  const sortedEntries = [...changelogEntries].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">DailyPing Change Log</h2>
      <ul className="list-group">
        {sortedEntries.map((entry, idx) => (
          <li key={idx} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-1">{entry.title}</h5>
              <span className={`badge bg-${typeBadge[entry.type]}`}>{entry.type}</span>
            </div>
            <p className="mb-1 text-muted">{entry.description}</p>
            <small className="text-secondary">{entry.date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
