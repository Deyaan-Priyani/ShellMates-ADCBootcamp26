//detail page that shows the details of an event after you click on the eventcard
//TODO: set up router? (is that my responsibility or someone else's?)

import { useState, useEffect } from "react"; 
import { useParams } from "react-router-dom";
import api from "/frontend/src/services/api"; //axios instance from env setup
import { useNavigate } from "react-router-dom";

function EventDetails()
{
    //NEEDS: title, description, category badge, location, date/time, max capacity, current RSVP count, host's name w/ rank badge
    //also google map

    const {id} = useParams(); //pulls id from url
    const [event, setEvent] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [isRSVP, setRSVP] = useState(false);

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

        //TODO: use backend to set initial RSVP state 
        //(smth like: setRSVP(currEvent.[[wtv they call has_rsvped]]));
        setLoading(false);
    }

    //for clicking the event:
    function onEventClick(currId) 
    {
        navigate(`/events/${currId}`);
    }

    //call loadEvent whenever id changes
    useEffect(() => {loadEvent();}, [id]);

    //function that returns google map embedded into the event card
    function buildMap(eventLocation)
    {
        //base url of the google map api
        const baseMapURL = "https://maps.googleapis.com/maps/api/staticmap"
        const params = new URLSearchParams //params to feed into google map api to get the event's location
        ({
            center: eventLocation,
            zoom: "15",
            size: "600x300",
            key: import.meta.env.VITE_GOOGLE_MAPS_KEY
            //TODO: FIGURE OUT WHO'S GETTING THE VITE_GOOGLE_MAPS_KEY
        });
        
        //return the url to the specific event location; will be used for an image
        return `${baseUrl}?${params}`;
    }

    //rsvp button
    async function enterRSVP()
    {
        await api.post(`/events/${id}/rsvp`); //post rsvp request to backend
        setRSVP(true);

        //create new obj and passes in
        //TODO: again check if 'rsvp_count' is the right name with backend
        setEvent({ ...event, rsvp_count: event.rsvp_count + 1});

    }

    //cancel rsvp
    async function cancelRSVP()
    {
        await api.delete(`/events/${id}/rsvp`); //delete the rsvp from backend
        setRSVP(false);

                //create new obj and passes in
        //TODO: again check if 'rsvp_count' is the right name with backend
        setEvent({ ...event, rsvp_count: event.rsvp_count - 1});

    }

    //checks if event is full, used for rsvp button
    function checkFull()
    {
        if(event.attendees.length >= event.max_attendees)
        {
            return true;
        }
        else
        {
            return false;
        }
    }



    return (
        <div>
            {/*to handle loading: this goes on the outside of Everything*/}
            
            { //if loading, prints that to screen
                isLoading && (<p>Loading event...</p>)
            }
            {
                !isLoading && event === null && (<p>Couldn't find event</p>)
            }
            { //if not loading & event is real, we handle Everything Else

                //TODO: double check if these are the right fields from the event obj
                //(also what field the badge is, i'm putting tags for now)
                //(leaving out host rank badge for now)
                !isLoading && event !== null && 
                ( 
                <div id="EventDetails"> 
                    
                    <h1 className="EventTitle">{event.title}</h1>
                    <p className="Host">Hosted by {event.organizer_email}</p>
                    <span className="HostBadge"></span> 
                    <p className="Location">Location: {event.location}</p>
                    <span className="DateTime">Time: {event.date}</span>
                    <span className="RSVPCount">{event.attendees.length} Terps are attending</span>
                    <span className="MaxCapacity">Up to {event.max_attendees} allowed</span>
                    <p className="Description">{event.description}</p>
                    <span className="CategoryBadge">{event.tags}</span>
                    
                    {/*passes the event location to get lil image of the map*/}
                    <img src={buildMap(event.location)} alt={`Map of ${event.location}`}/>

                    {/*rsvp button; disabled will gray it out on its own w/out css*/}
                    {!isRSVP && (<button onClick={enterRsvp} disabled={checkFull()}> RSVP </button>)}
                    
                    {/*cancel rsvp button*/}
                    {isRSVP && (<button onClick={cancelRSVP}>Cancel RSVP</button>)}
                    

                </div>


                )
            }
            
        

        </div>
    );
}


export default EventDetails;