import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";

export default function Landing() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // fetch events
    useEffect(() => {
        async function loadEvents() {
            try {
                const res = await fetch("/events");
                const data = await res.json();
            } catch (err) {
                console.error("Error fetching events:", err);
            } finally {
                setLoading(false);
            }
        }

        loadEvents();
    }, []);

    // returns loading screen if loading
    if (loading) {
        return <p>Loading events...</p>;
    }

    // event list
    return (
        <>
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