//detail page that shows the details of an event after you click on the eventcard
//TODO: set up router? (is that my responsibility or someone else's?)

import { useState, useEffect } from "react"; 
import { useParams } from "react-router-dom";
import api from "/frontend/src/services/api"; //axios instance from env setup
import EventCard from "/frontend/src/components/EventCard.jsx";
import { useNavigate } from "react-router-dom";

function EventDetails()
{
    //NEEDS: title, description, category badge, location, date/time, max capacity, current RSVP count, host's name w/ rank badge
    //also google map

    const {id} = useParams(); //pulls id from url
    const [event, setEvent] = useState(null);
    const [isLoading, setLoading] = useState(false);

    //lets us change the url when going to the details section
    const navigate = useNavigate()

    //for loading events:
    async function loadEvent()
    {
        setLoading(true);

        //fetch event matching the selected event's id from backend
        const currEvent = await api.get(`/events/${id}`);

        //set it
        setEvent(currEvent.data);

        setLoading(false);
    }

    //for clicking the event:
    function onEventClick(currId) 
    {
        navigate(`/events/${currId}`);
    }

    //call loadEvent whenever id changes
    useEffect(() => {loadEvent();}, [id]);



    return (
        <div>
            <div id = "Title">
                <h1 className="EventTitle">title</h1>
            </div>
            
            <div id = "EventInfo">
                <p className="Host"></p>
                <p className="CategoryBadge"></p>
                <p className="Location"></p>
                <p className="DateTime"></p>
                <p className="MaxCapacity"></p>
                <p className="RSVPCount"></p>
            </div>

            <div id = "EventDescription">
                <p className="Description"></p>
            </div>

            <div id = "Map">

            </div>

        </div>
    );
}


export default EventDetails;