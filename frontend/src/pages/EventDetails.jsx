// pages/EventDetails.jsx
// Shows full details of one event with a working RSVP button.

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const LOCATION_COORDINATES = {
  "Stamp Student Union": "38.9888,-76.9444",
  "McKeldin Library": "38.9858,-76.9448",
  "Eppley Recreation Center": "38.9923,-76.9430",
  "Cole Field House": "38.9960,-76.9446",
  "Clarice Smith Performing Arts Center": "38.9834,-76.9448",
};

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth() || {};

  const [event, setEvent] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isRSVP, setRSVP] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState("");

  // Load event when page opens
  useEffect(() => {
    loadEvent();
  }, [id]);

  async function loadEvent() {
    setLoading(true);
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);

      // Check if current user already RSVPed
      if (firebaseUser?.email) {
        setRSVP(res.data.attendees?.includes(firebaseUser.email) ?? false);
      }
    } catch {
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }

  // Build static map image from OpenStreetMap
  function buildMap(eventLocation) {
    const coordinates = LOCATION_COORDINATES[eventLocation];
    if (!coordinates) return null;
    const params = new URLSearchParams({
      center: coordinates,
      zoom: "16",
      size: "600x220",
      maptype: "mapnik",
    });
    return `https://staticmap.openstreetmap.de/staticmap.php?${params}`;
  }

  // Handle RSVP and cancel RSVP
  async function handleRSVP() {
    setRsvpLoading(true);
    setRsvpMessage("");
    try {
      if (isRSVP) {
        // Cancel RSVP
        await api.delete(`/events/${id}/rsvp`);
        setRSVP(false);
        setEvent((prev) => ({
          ...prev,
          attendees: prev.attendees.filter((e) => e !== firebaseUser.email),
        }));
        setRsvpMessage("RSVP cancelled.");
      } else {
        // Add RSVP
        await api.post(`/events/${id}/rsvp`);
        setRSVP(true);
        setEvent((prev) => ({
          ...prev,
          attendees: [...(prev.attendees || []), firebaseUser.email],
        }));
        setRsvpMessage("You are going! See you there 🎉");
      }
    } catch (err) {
      setRsvpMessage(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setRsvpLoading(false);
    }
  }

  // Check if event is at max capacity
  function isFull() {
    if (!event.max_attendees) return false;
    return event.attendees.length >= event.max_attendees;
  }

  // Format date nicely
  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (isLoading) return <p style={{ padding: "20px" }}>Loading event...</p>;

  if (!event)
    return (
      <div className="page">
        <p>Event not found.</p>
        <button className="btn-secondary" onClick={() => navigate("/events")}>
          Back to Events
        </button>
      </div>
    );

  const mapUrl = buildMap(event.location);
  const hostName = event.organizer_email?.split("@")[0] || "Unknown";
  const attendeeCount = event.attendees?.length ?? 0;

  return (
    <div className="page">
      {/* Back button */}
      <button
        className="btn-secondary"
        onClick={() => navigate("/events")}
        style={{ marginBottom: "16px" }}
      >
        ← Back to Events
      </button>

      <div className="event-detail">
        {/* Category badge */}
        <span className="category-badge">{event.category}</span>

        {/* Title */}
        <h1>{event.title}</h1>

        {/* Host */}
        <p>
          👤 Hosted by <strong>{hostName}</strong>
        </p>

        {/* Location */}
        <p>📍 {event.location}</p>

        {/* Date */}
        <p>🕐 {formatDate(event.date)}</p>

        {/* Attendee count */}
        <p>
          👥 {attendeeCount}
          {event.max_attendees ? ` / ${event.max_attendees}` : ""} attending
          {isFull() && (
            <span style={{ color: "#CC0000", marginLeft: "8px" }}>(Full)</span>
          )}
        </p>

        {/* Description */}
        <p style={{ marginTop: "14px", lineHeight: "1.7" }}>
          {event.description}
        </p>

        {/* Map */}
        {mapUrl && <img src={mapUrl} alt={`Map of ${event.location}`} />}

        {/* RSVP button */}
        <div style={{ marginTop: "20px" }}>
          {!isRSVP ? (
            <button
              className="rsvp-btn"
              onClick={handleRSVP}
              disabled={isFull() || rsvpLoading}
            >
              {rsvpLoading
                ? "Processing..."
                : isFull()
                  ? "Event Full"
                  : "RSVP to this Event"}
            </button>
          ) : (
            <button
              className="cancel-btn"
              onClick={handleRSVP}
              disabled={rsvpLoading}
            >
              {rsvpLoading ? "Processing..." : "Cancel RSVP"}
            </button>
          )}

          {/* Confirmation or error message after clicking RSVP */}
          {rsvpMessage && (
            <p
              style={{
                marginTop: "10px",
                color: isRSVP ? "green" : "#CC0000",
                fontWeight: "bold",
              }}
            >
              {rsvpMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
