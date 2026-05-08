import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { useNavigate } from "react-router-dom";
import '../styles/global.css'

export default function Landing() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // fetch events
  useEffect(() => {
    async function loadData() {
      try {
        const [eventsRes, userRes] = await Promise.all([
          fetch("http://localhost:8000/events"),
          fetch("http://localhost:8000/auth/me"),
          ,
        ]);

        const eventsData = await eventsRes.json();
        const userData = await userRes.json();

        setEvents(eventsData);
        setUser(userData);
      } catch (err) {
        console.error("Full error:", err.response?.data);
        /*setErrorText("Failed to create event. Are you logged in?")*/
        console.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Returns loading screen if loading.
  if (loading) {
    return <p>Loading events...</p>;
  }

  // For safety.
  const progressPercent = user?.rankProgress ?? 0;

  // Filters events based on if they contain the search string.
  const filteredEvents = events.filter((event) =>
    (event.title || "").toLowerCase().includes(search.toLowerCase()),
  );

  // event list
  return (
    <>
      {/* RANK STRIP */}
      {user && (
        <div className="rank-strip">
          {/* Rank text */}
          <div>
            <p>Your Rank</p>
            <p className="text-lg font-bold">{user.rankBadge}</p>
          </div>

          {/* Progress bar. Will implemenet class for this to display properly.*/}
          <div>
            <div style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Percent label */}
          <p>{progressPercent}%</p>
        </div>
      )}
      {/* SEARCH BAR */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* HERO */}
      <section className="hero">
        <h1>Welcome to Shell Mates</h1>
        <p>Discover events around campus and create your own!</p>
        <div className="hero-buttons">
          <button
            className="create-event-button"
            onClick={() => navigate("/events/create")}
          >
            Create Event
          </button>
          <button
            className="create-event-button"
            onClick={() => navigate("/events")}
          >
            Discover events
          </button>
        </div>
      </section>
      {/*image*/}
      <img src="testudopicture.jpg" class="landing-picture"></img>

      {/*image*/}
      <footer>hello</footer>

    </>
  );
}
