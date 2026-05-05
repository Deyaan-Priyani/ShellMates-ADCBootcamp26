import { useAuth } from "../context/AuthContext"
import { RankBadge} from "./RankBadge"

const EventCard = ({ event }) => {
    const { user } = useAuth();

    return (
        <div className="event-card">
            <h1>{event.name}</h1>

            {/*When a function that returns a color given a category is implemented put in place of white*/}
            <span className="category-badge" style={{ color: "white" }}>
                {event.category}
            </span>

            {/*Location + time*/}
            <div className="location-time">
                <p>Location: {event.location} </p>
                <p>Time: {event.time} </p>
            </div>


            {/*RSVP Count / RSVP Capacity*/}
            <div className="rsvp">
                <p>RSVP: {event.rsvpCount}/{event.rsvpCap} </p>
            </div>

            {/*Host info*/}
            <div className="host-info">
                <p>
                    Hosted by: {user.name} <RankBadge tier = {user.rankBadge}/>
                </p>
            </div>

        </div>
    )

}