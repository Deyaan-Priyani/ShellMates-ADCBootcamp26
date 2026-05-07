import { useAuth } from "../context/AuthContext";

export default function Proflle() {
    const { user, loading: authLoading } = useAuth();

    if (loading) return <div>Loading profile...</div>;
    if (!user) return <div>Not logged in</div>;

    const [tab, setTab] = useState("created");
    const [created, setCreated] = useState([]);
    const [rsvped, setRsvped] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const hasPhoto = Boolean(user.photoUrl);


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError("");

                const [createdRes, rsvpRes] = await Promise.all([
                    fetch("/events/mine", { credentials: "include" }),
                    fetch("/events/rsvps", { credentials: "include" }),
                ]);

                // If any one of the results returns an error, throw an error. 
                if (!createdRes.ok || !rsvpRes.ok) {
                    throw new Error("Failed to load events");
                }

                const createdData = await createdRes.json();
                const rsvpData = await rsvpRes.json();


                setCreated(createdData);
                setRsvped(rsvpData);
            } catch (err) {
                setError(err.message || "Error loading events");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchEvents();
    }, [user]);

    // Loading 
    if (authLoading || loading) return <div>Loading...</div>;

    // No user exists
    if (!user) return <div>Not logged in</div>;

    // Error thrown 
    if (error) return <div>{error}</div>;

    const events = tab === "created" ? created : rsvped;

    return (
        <div className="profile-page">
            {/* Photo/Initials */}
            <div className="photo">
                {hasPhoto ? (
                    <img src={user.photoUrl}></img>
                ) : (
                    <div>
                        {initials}
                    </div>
                )}
            </div>
            <div>
                <h1>Profile</h1>
                <p>Name: {user.name}</p>
                <p>Terpmail: {user.email}</p>
                <RankBadge tier={user.rankBadge} />
            </div>
            <div className="rank-strip">
                {/* Progress bar. Will implement class for this to display properly.*/}
                <div>
                    <div
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Progress number. TODO: Function which takes rank and returns progress required for next tier. */}
                <p>
                    {user.rankProgress} / X
                </p>
            </div>

            <div className = "rsvp-created-menu">
                <button onClick={() => setTab("created")}>
                    Events I Created
                </button>

                <button onClick={() => setTab("rsvped")}>
                    Events I RSVPed To
                </button>
            </div>

            <div className = "events-list">
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