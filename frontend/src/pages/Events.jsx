// pages/Events.jsx
// Browse events with category filter tabs.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import api from "../services/api";

// All filter options
const CATEGORIES = [
  "All",
  "Parties and Pregames",
  "Sports and Tournaments",
  "Study Sessions",
  "Miscellaneous",
];

function Events() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("All");
  const [events, setEvents] = useState([]);
  const [courseCode, setCourseCode] = useState("");
  const [isLoading, setLoading] = useState(false);

  // Load events whenever the category or course code changes
  useEffect(() => {
    loadEvents();
  }, [activeCategory, courseCode]);

  async function loadEvents() {
    setLoading(true);

    // Build query params for the backend
    const params = {};
    if (activeCategory !== "All") params.category = activeCategory;
    if (activeCategory === "Study Sessions" && courseCode !== "")
      params.course = courseCode;

    try {
      const res = await api.get("/events", { params });
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to load events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  // When a category tab is clicked
  function handleCategoryClick(item) {
    setActiveCategory(item);
    setCourseCode("");
  }

  // Click an event card to go to its detail page
  function onEventClick(id) {
    navigate(`/events/${id}`);
  }

  return (
    <div className="page">
      {/* Header with title and create button */}
      <div className="events-header">
        <h1>Events</h1>
        <button onClick={() => navigate("/create")}>+ Create Event</button>
      </div>

      {/* Category filter tabs */}
      <div className="filter-bar">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            onClick={() => handleCategoryClick(item)}
            className={activeCategory === item ? "active" : ""}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Course code input - only for Study Sessions */}
      {activeCategory === "Study Sessions" && (
        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Filter by course code (e.g. CMSC132)"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              fontSize: "0.9rem",
              width: "300px",
            }}
          />
        </div>
      )}

      {/* Event grid */}
      {isLoading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <div className="no-events">
          <p>No events found. Try creating one!</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event._id} onClick={() => onEventClick(event._id)}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
