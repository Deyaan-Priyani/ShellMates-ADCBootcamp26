import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../services/firebase";
import EventCard from "../components/EventCard";
import RankBadge from "../components/RankBadge";
import api from "../services/api";

export default function Profile() {
    const { user: firebaseUser, loading: authLoading } = useAuth();

    const [tab, setTab] = useState("created");
    const [created, setCreated] = useState([]);
    const [rsvped, setRsvped] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState(null);

    // All hooks must be above any early returns
    useEffect(() => {
        const fetchData = async () => {
            if (!firebaseUser) return;
            try {
                setLoading(true);
                setError("");

                // fetch user profile and events from backend
                const profileRes = await api.get("/users/me");
                const eventsRes = await api.get("/events")

                setProfile(profileRes.data);
                const allEvents = eventsRes.data;

                setCreated(allEvents.filter(e => e.organizer_email === firebaseUser.email));
                setRsvped(allEvents.filter(e => e.attendees.includes(firebaseUser.email)));

            } catch (err) {
                console.error("Profile fetch failed:", err.response?.data || err.message);
                setError("Error loading profile: " + (err.response?.data?.detail || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [firebaseUser]);

    // Early returns after all hooks
    if (authLoading || loading) return <div>Loading...</div>;
    if (!firebaseUser) return <div>Not logged in</div>;
    if (error) return <div>{error}</div>;
    if (!profile) return <div>No profile found</div>;

    const events = tab === "created" ? created : rsvped;
    const initials = profile.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
    const progressPercent = profile.rankProgress ?? 0;

    return (
        <div className="profile-page">
            {/* Photo/Initials */}
            <div className="photo">
                {firebaseUser.photoURL ? (
                    <img src={firebaseUser.photoURL} alt="profile" />
                ) : (
                    <div>{initials}</div>
                )}
            </div>
            <div>
                <h1>Profile</h1>
                <p>Name: {profile.name}</p>
                <p>Terpmail: {profile.email}</p>
                <RankBadge tier={profile.rankBadge} />
            </div>
            <div className="rank-strip">
                <div>
                    <div style={{ width: `${progressPercent}%` }} />
                </div>
                <p>{profile.rankProgress} / 20 events</p>
            </div>

            <div className="rsvp-created-menu">
                <button onClick={() => setTab("created")}>Events I Created</button>
                <button onClick={() => setTab("rsvped")}>Events I RSVPed To</button>
            </div>

            <div className="events-list">
                {events.length === 0 ? (
                    <div>No events found</div>
                ) : (
                    events.map((event) => (
                        <EventCard key={event._id} event={event} />
                    ))
                )}
            </div>
        </div>
    );
}