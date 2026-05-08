// pages/Profile.jsx
// Shows the user's profile, rank, and their events.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RankBadge } from "../components/RankBadge";
import EventCard from "../components/EventCard";
import api from "../services/api";

function Profile() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [tab, setTab] = useState("created");
  const [createdEvents, setCreated] = useState([]);
  const [attendingEvents, setAttending] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load the user's created and attending events
  useEffect(() => {
    async function loadEvents() {
      if (!profile) return;
      setLoading(true);
      try {
        const res = await api.get("/events");
        const all = res.data;

        // Filter to events this user created
        const created = all.filter((e) =>
          profile.events_created?.includes(e._id),
        );

        // Filter to events this user RSVPed to
        const attending = all.filter((e) =>
          profile.events_attending?.includes(e._id),
        );

        setCreated(created);
        setAttending(attending);
      } catch (err) {
        console.error("Failed to load profile events:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [profile]);

  // Cancel an RSVP
  async function handleCancelRSVP(eventId) {
    try {
      await api.delete(`/events/${eventId}/rsvp`);
      setAttending((prev) => prev.filter((e) => e._id !== eventId));
      await refreshProfile();
    } catch (err) {
      console.error("Failed to cancel RSVP:", err);
    }
  }

  // Delete an event the user created
  async function handleDeleteEvent(eventId) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api.delete(`/events/${eventId}`);
      setCreated((prev) => prev.filter((e) => e._id !== eventId));
      await refreshProfile();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  }

  if (!profile) return <p style={{ padding: "20px" }}>Loading profile...</p>;

  // Which events to show based on active tab
  const eventsToShow = tab === "created" ? createdEvents : attendingEvents;

  return (
    <div className="page">
      <div className="profile-page">
        {/* User info */}
        <h1>Profile</h1>
        <p>Name: {profile.name || profile.email?.split("@")[0]}</p>
        <p>Terpmail: {profile.email}</p>

        {/* Rank badge */}
        <div style={{ margin: "10px 0" }}>
          <RankBadge tier={profile.rank} />
        </div>

        {/* Rank progress bar */}
        <div className="rank-strip" style={{ marginTop: "16px" }}>
          <p>Progress to next rank</p>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${profile.rankProgress ?? 0}%` }}
            />
          </div>
          <p>{profile.rankProgress ?? 0}%</p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "20px", margin: "16px 0" }}>
          <p>
            Events hosted:{" "}
            <strong>{profile.events_created?.length ?? 0}</strong>
          </p>
          <p>
            Events attending:{" "}
            <strong>{profile.events_attending?.length ?? 0}</strong>
          </p>
        </div>

        {/* Tab buttons */}
        <div className="tab-buttons">
          <button
            className={tab === "created" ? "active" : ""}
            onClick={() => setTab("created")}
          >
            Events I Created ({createdEvents.length})
          </button>
          <button
            className={tab === "attending" ? "active" : ""}
            onClick={() => setTab("attending")}
          >
            Events I RSVPed To ({attendingEvents.length})
          </button>
        </div>

        {/* Event list */}
        {loading ? (
          <p>Loading events...</p>
        ) : eventsToShow.length === 0 ? (
          <div className="no-events">
            <p>No events here yet.</p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {eventsToShow.map((event) => (
              <div key={event._id} style={{ position: "relative" }}>
                {/* Click card to view event */}
                <div onClick={() => navigate(`/events/${event._id}`)}>
                  <EventCard event={event} />
                </div>

                {/* Action button on each card */}
                {tab === "created" ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(event._id);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#CC0000",
                      color: "white",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                    }}
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelRSVP(event._id);
                    }}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#CC0000",
                      color: "white",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                    }}
                  >
                    Cancel RSVP
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
