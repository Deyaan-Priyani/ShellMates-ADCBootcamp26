import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { useNavigate } from "react-router-dom";

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
                    fetch("/auth/me"),
                ]);

                const eventsData = await eventsRes.json();
                const userData = await userRes.json();

                setEvents(eventsData);
                setUser(userData);

            } catch (err) {
                console.error("Full error:", err.response?.data)
                setErrorText("Failed to create event. Are you logged in?")
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
        event.name.toLowerCase().includes(search.toLowerCase())
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
                        <div
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    {/* Percent label */}
                    <p>
                        {progressPercent}%
                    </p>
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
                <h1>
                    Welcome to Shell Mates
                </h1>
                <p>
                    Discover events around campus
                </p>
                <button className="create-event-button" onClick={() => navigate("/events/create")}>
                    Create Event
                </button>
            </section>
            {/* EVENT LIST */}
            <div className="event-list">
                <h2>Upcoming Events:</h2>
                <div>
                    {filteredEvents.map((event) => (
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            </div>
        </>
    );
}