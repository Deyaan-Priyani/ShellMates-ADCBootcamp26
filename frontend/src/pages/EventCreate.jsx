// pages/EventCreate.jsx
// Form to create a new event.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CATEGORIES = [
  "Parties and Pregames",
  "Sports and Tournaments",
  "Study Sessions",
  "Miscellaneous",
];

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

function EventCreate() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [errorText, setErrorText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  // Filter campus locations as user types
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

  // When user picks a location from the dropdown
  function handleLocationSelect(spot) {
    setLocation(spot);
    setLocationSuggestions([]);
  }

  // Check all fields are filled in
  function validateForm() {
    if (!title.trim()) return "Please enter a title.";
    if (!category) return "Please select a category.";
    if (!description.trim()) return "Please enter a description.";
    if (!location.trim()) return "Please enter a location.";
    if (!date) return "Please enter a date.";
    if (!time) return "Please enter a time.";
    if (!maxCapacity || parseInt(maxCapacity) < 1)
      return "Please enter a valid max capacity.";
    return null;
  }

  async function submitEvent() {
    const error = validateForm();
    if (error) {
      setErrorText(error);
      return;
    }

    setErrorText("");
    setSubmitting(true);

    try {
      // date_time combines date + time into one string Python can parse
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        date_time: `${date}T${time}`,
        max_capacity: parseInt(maxCapacity),
      };

      const response = await api.post("/events", payload);

      // Go to the new event's detail page
      navigate(`/events/${response.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to create event.";
      setErrorText(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="create-form">
        <h1>Host an Event</h1>

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
            placeholder="What's happening? Add any details people should know."
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
          {/* Dropdown suggestions */}
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

        {/* Date and Time side by side */}
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
        {errorText && <p className="error-msg">{errorText}</p>}

        {/* Buttons */}
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => navigate("/events")}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={submitEvent}
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Event 🎉"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventCreate;
