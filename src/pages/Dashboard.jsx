import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import md5 from "md5";
import { useNavigate } from 'react-router-dom';


export default function Goals() {
  const { user, loading, refresh } = useAuth();

  useEffect(() => {}, [])

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="card shadow-sm p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-md-auto text-center mb-3 mb-md-0">
            <img
              src={`https://www.gravatar.com/avatar/${md5(user.email?.trim().toLowerCase())}?s=80&d=identicon`}
              alt="User Avatar"
              className="rounded-circle"
              width="80"
              height="80"
            />
          </div>
          <div className="col-md">
            <h5 className="fw-bold mb-1">Welcome, {user.username}</h5>
            <p className="text-muted mb-0">{`${user.bio}` || "No bio provided."}</p>
          </div>
          <div className="col-md-auto text-center mt-3 mt-md-0">
            <div className="mb-2">
              <p className="mb-1 fw-bold text-muted">Current Streak</p>
              <span className="badge bg-success fs-6">{user.streak?.current ?? 0} days</span>
            </div>
            <div>
              <p className="mb-1 fw-bold text-muted">Pro Status</p>
              <span className={`badge fs-6 ${user.pro === 'active' ? "bg-primary" : "bg-secondary"}`}>
                {user.pro === 'active' ? "✅ Active" : "❌ Not active"}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    )

}
