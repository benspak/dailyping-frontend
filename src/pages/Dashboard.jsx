import React, { useEffect, useState } from "react";
import axios from "axios";
import { registerPush } from "../utils/registerPush";
import { useAuth } from "../context/AuthContext";
import md5 from "md5";
import { FaEdit, FaSave } from "react-icons/fa";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [responses, setResponses] = useState([]);
  const [taskState, setTaskState] = useState({});
  const [editState, setEditState] = useState({});
  const [activeAccordion, setActiveAccordion] = useState(null);
  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://api.dailyping.org/api/responses/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedState = {};
        const editDefaults = {};
        res.data.forEach((r) => {
          updatedState[r._id] = { goalCompleted: r.completed || false };
          r.subTasks?.forEach((t, i) => {
            updatedState[r._id][i] = t.completed;
          });

          editDefaults[r._id] = {
            isEditing: false,
            content: r.content,
            subTasks: r.subTasks?.map((t) => t.text) || [],
          };
        });

        setResponses(res.data);
        setTaskState(updatedState);
        setEditState(editDefaults);

        await registerPush();
      } catch {
        setResponses([]);
      }
    };

    fetchData();
  }, [user]);

  const handleEditToggle = (id) => {
    setEditState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isEditing: !prev[id].isEditing,
      },
    }));
  };

  const handleContentChange = (id, value) => {
    setEditState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        content: value,
      },
    }));
  };

  const handleSubTaskChange = (id, index, value) => {
    const newSubTasks = [...editState[id].subTasks];
    newSubTasks[index] = value;
    setEditState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        subTasks: newSubTasks,
      },
    }));
  };

  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://api.dailyping.org/api/response/${id}`,
        {
          content: editState[id].content,
          subTasks: editState[id].subTasks.map((t) => ({ text: t })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.reload(); // Simple refresh to reflect changes
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  if (loading) return <div className="container py-5 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Your Goals</h2>
      <div className="accordion" id="goalAccordion">
        {responses.map((r, index) => (
          <div className="accordion-item" key={r._id}>
            <h2 className="accordion-header" id={`heading-${r._id}`}>
              <button
                className={`accordion-button ${activeAccordion === index ? "" : "collapsed"}`}
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
              >
                <strong>{r.date}</strong>:{" "}
                {editState[r._id]?.isEditing ? (
                  <input
                    type="text"
                    className="form-control ms-2"
                    value={editState[r._id].content}
                    onChange={(e) => handleContentChange(r._id, e.target.value)}
                  />
                ) : (
                  r.content
                )}
              </button>
            </h2>
            <div
              id={`collapse-${r._id}`}
              className={`accordion-collapse collapse ${activeAccordion === index ? "show" : ""}`}
            >
              <div className="accordion-body">
                {(editState[r._id]?.subTasks || []).map((task, idx) => (
                  <div key={idx} className="mb-2 d-flex align-items-center">
                    {editState[r._id]?.isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        value={task}
                        onChange={(e) => handleSubTaskChange(r._id, idx, e.target.value)}
                      />
                    ) : (
                      <span>{task}</span>
                    )}
                  </div>
                ))}
                <button
                  className="btn btn-sm mt-3 me-2 btn-outline-secondary"
                  onClick={() => handleEditToggle(r._id)}
                >
                  {editState[r._id]?.isEditing ? <FaSave /> : <FaEdit />}{" "}
                  {editState[r._id]?.isEditing ? "Save" : "Edit"}
                </button>
                {editState[r._id]?.isEditing && (
                  <button className="btn btn-sm mt-3 btn-dark" onClick={() => handleSave(r._id)}>
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
