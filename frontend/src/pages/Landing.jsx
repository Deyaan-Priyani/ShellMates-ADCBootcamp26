import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";

export default function Landing() {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // fetch events
    useEffect(() => {
        async function loadData() {
            try {
                const [eventsRes, userRes] = await Promise.all([
                    fetch("/events"),
                    fetch("/auth/me"),
                ]);

                const eventsData = await eventsRes.json();
                const userData = await userRes.json();

                setEvents(eventsData);
                setUser(userData);

            } catch (err) {
                console.error("Error fetching events:", err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    // returns loading screen if loading
    if (loading) {
        return <p>Loading events...</p>;
    }

    const progressPercent = user?.rankProgress ?? 0;

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
            {/* HERO */}
            <section className="hero">
                <h1>
                    Welcome to Shell Mates
                </h1>
                <p>
                    Discover events around campus
                </p>
                <button className="create-event-button">
                    Create Event
                </button>
            </section>
            {/* EVENT LIST */}
            <div className="event-list">
                <h2>Upcoming Events:</h2>
                <div>
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </div>
        </>
    );
}