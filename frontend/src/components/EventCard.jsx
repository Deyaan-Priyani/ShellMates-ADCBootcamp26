// components/EventCard.jsx
// Shows one event as a card.
// Gets the event object as a prop and displays its info.

function EventCard({ event }) {
  if (!event) return null;

  // How many people are attending
  const attendeeCount = event.attendees ? event.attendees.length : 0;

  // Format the date nicely
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="event-card">
      {/* Category badge */}
      <span className="category-badge">{event.category || "General"}</span>

      {/* Event title */}
      <h3>{event.title}</h3>

      {/* Location */}
      <p>📍 {event.location}</p>

      {/* Date */}
      <p>🕐 {formattedDate}</p>

      {/* RSVP count */}
      <p className="rsvp-bar">
        {attendeeCount}
        {event.max_attendees ? ` / ${event.max_attendees}` : ""} attending
      </p>

      {/* Host - just show the part before the @ */}
      <p>
        👤{" "}
        {event.organizer_email
          ? event.organizer_email.split("@")[0]
          : "Unknown"}
      </p>
    </div>
  );
}

export default EventCard;
