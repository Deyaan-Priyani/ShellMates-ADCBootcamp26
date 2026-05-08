// pages/Landing.jsx
// Home page - shows upcoming events, search bar, and create event popup.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// Campus locations for the autocomplete dropdown
const CAMPUS_LOCATIONS = [
  "Stamp Student Union",
  "McKeldin Library",
  "Eppley Recreation Center",
  "Riggs Alumni Center",
  "Clarice Smith Performing Arts Center",
  "Cole Field House",
  "Byrd Stadium",
  "Iribe Center",
];

// Event categories
const CATEGORIES = [
  "Parties and Pregames",
  "Sports and Tournaments",
  "Study Sessions",
  "Miscellaneous",
];

function Landing() {
  const navigate = useNavigate();
  const { profile } = useAuth() || {};

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Popup open/close state
  const [showPopup, setShowPopup] = useState(false);

  // Form fields for creating an event
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  // Load events when page opens
  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter events by search input
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(search.toLowerCase()),
  );

  const progressPercent = profile?.rankProgress ?? 0;

  // Location autocomplete handler
  function handleLocationChange(e) {
    const typed = e.target.value;
    setLocation(typed);
    if (typed.length > 0) {
      const matches = CAMPUS_LOCATIONS.filter((spot) =>
        spot.toLowerCase().includes(typed.toLowerCase()),
      );
      setLocationSuggestions(matches);
    } else {
      setLocationSuggestions([]);
    }
  }

  function handleLocationSelect(spot) {
    setLocation(spot);
    setLocationSuggestions([]);
  }

  // Reset all form fields
  function resetForm() {
    setTitle("");
    setCategory("");
    setDescription("");
    setLocation("");
    setDate("");
    setTime("");
    setMaxCapacity("");
    setFormError("");
    setLocationSuggestions([]);
  }

  // Open and close popup
  function openPopup() {
    resetForm();
    setShowPopup(true);
  }
  function closePopup() {
    resetForm();
    setShowPopup(false);
  }

  // Validate and submit the form
  async function submitEvent() {
    if (!title.trim()) return setFormError("Please enter a title.");
    if (!category) return setFormError("Please select a category.");
    if (!description.trim()) return setFormError("Please enter a description.");
    if (!location.trim()) return setFormError("Please enter a location.");
    if (!date) return setFormError("Please enter a date.");
    if (!time) return setFormError("Please enter a time.");
    if (!maxCapacity || parseInt(maxCapacity) < 1)
      return setFormError("Please enter a valid max capacity.");

    setFormError("");
    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        date_time: `${date}T${time}`,
        max_capacity: parseInt(maxCapacity),
      };

      const res = await api.post("/events", payload);

      // Add the new event to the top of the list without reloading
      setEvents((prev) => [res.data, ...prev]);

      closePopup();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to create event.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p style={{ padding: "20px" }}>Loading events...</p>;

  return (
    <div className="page">
      {/* Hero section */}
      <div className="hero">
        <h1>Welcome to Shell Mates 🐢</h1>
        <p>Discover events happening around UMD campus</p>
        {/* This button opens the popup */}
        <button onClick={openPopup}>+ Create Event</button>
      </div>

      {/* Rank strip */}
      {profile && (
        <div className="rank-strip">
          <div>
            <p>Your Rank</p>
            <p className="rank-label">{profile.rankBadge || "Bronze"}</p>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p>{progressPercent}%</p>
        </div>
      )}

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Upcoming events */}
      <h2 style={{ marginBottom: "16px" }}>Upcoming Events</h2>

      {filteredEvents.length === 0 ? (
        <div className="no-events">
          <p>No events found. Be the first to host one!</p>
          <button
            className="btn-primary"
            onClick={openPopup}
            style={{ marginTop: "12px" }}
          >
            Create Event
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              onClick={() => navigate(`/events/${event._id}`)}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE EVENT POPUP ── */}
      {showPopup && (
        <>
          {/* Dark overlay behind the popup */}
          <div
            onClick={closePopup}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 100,
            }}
          />

          {/* Popup box */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              borderRadius: "10px",
              padding: "30px",
              width: "90%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              zIndex: 101,
            }}
          >
            {/* Popup header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, color: "#CC0000" }}>Host an Event</h2>
              <button
                onClick={closePopup}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ✕
              </button>
            </div>

            {/* Title */}
            <div className="form-group">
              <label>Event Title</label>
              <input
                type="text"
                placeholder="Give your event a name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="What is happening? Add details people should know."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Location with autocomplete */}
            <div className="form-group" style={{ position: "relative" }}>
              <label>Location</label>
              <input
                type="text"
                placeholder="Search campus locations"
                value={location}
                onChange={handleLocationChange}
              />
              {locationSuggestions.length > 0 && (
                <div className="suggestions">
                  {locationSuggestions.map((spot) => (
                    <div key={spot} onClick={() => handleLocationSelect(spot)}>
                      📍 {spot}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Max capacity */}
            <div className="form-group">
              <label>Max Capacity</label>
              <input
                type="number"
                placeholder="How many people can attend?"
                min="1"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
              />
            </div>

            {/* Error message */}
            {formError && <p className="error-msg">{formError}</p>}

            {/* Buttons */}
            <div className="btn-row">
              <button className="btn-secondary" onClick={closePopup}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={submitEvent}
                disabled={submitting}
              >
                {submitting ? "Posting..." : "Post Event 🎉"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Landing;
