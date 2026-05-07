//detail page that shows the details of an event after you click on the eventcard

import { useState, useEffect } from "react"; 
import { useParams } from "react-router-dom";
import api from "../services/api"; //axios instance from env setup
import { useNavigate } from "react-router-dom";

function EventDetails()
{
    //NEEDS: title, description, category badge, location, date/time, max capacity, current RSVP count, host's name w/ rank badge
    //also google map

    const {id} = useParams(); //pulls id from url
    const [event, setEvent] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [isRSVP, setRSVP] = useState(false);

    //for the map
    const locationCoordinates = 
    {
        "Stamp Student Union": "38.9888,-76.9444",
        "McKeldin Library": "38.9858,-76.9448",
        "Eppley Recreation Center": "38.9923,-76.9430",
        "Cole Field House": "38.9960,-76.9446",
        "Clarice Smith Performing Arts Center": "38.9834,-76.9448",
    }


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

    //call loadEvent whenever id changes
    useEffect(() => {loadEvent();}, [id]);

    //function that returns google map embedded into the event card
    function buildMap(eventLocation)
    {
        //coordinates
        const coordinates = locationCoordinates[eventLocation];
        
        //base url of openstreetmaps 
        const baseMapURL = "https://staticmap.openstreetmap.de/staticmap.php"
        const params = new URLSearchParams //params to feed into openstreetmaps to get the event's location
        ({
            center: coordinates,
            zoom: "15",
            size: "600x300",
            maptype: "mapnik",
        });
        
        //return the url to the specific event location; will be used for an image
        return `${baseMapURL}?${params}`;
    }

    //rsvp button
    async function enterRSVP()
    {
        await api.post(`/events/${id}/rsvp`); //post rsvp request to backend
        setRSVP(true);

        //create new obj and passes in
        setEvent({ ...event, rsvp_count: event.rsvp_count + 1});

    }

    //cancel rsvp
    async function cancelRSVP()
    {
        await api.delete(`/events/${id}/rsvp`); //delete the rsvp from backend
        setRSVP(false);

                //create new obj and passes in
        setEvent({ ...event, rsvp_count: event.rsvp_count - 1});

    }

    //checks if event is full, used for rsvp button
    function checkFull()
    {
        if(event.rsvp_count >= event.max_capacity)
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

                //TODO: which is host_rank??
                !isLoading && event !== null && 
                ( 
                <div id="EventDetails"> 
                    
                    <h1 className="EventTitle">{event.title}</h1>
                    <p className="Host">Hosted by {event.organizer_email}</p>
                    <span className="HostBadge"></span> 
                    <p className="Location">Location: {event.location}</p>
                    <span className="DateTime">Time: {event.date}</span>
                    <span className="RSVPCount">{event.rsvp_count} Terps are attending</span>
                    <span className="MaxCapacity">Up to {event.max_capacity} allowed</span>
                    <p className="Description">{event.description}</p>
                    <span className="CategoryBadge">{event.tags}</span>
                    
                    {/*passes the event location to get lil image of the map*/}
                    <img src={buildMap(event.location)} alt={`Map of ${event.location}`}/>

                    {/*rsvp button; disabled will gray it out on its own w/out css*/}
                    {!isRSVP && (<button onClick={enterRSVP} disabled={checkFull()}> RSVP </button>)}
                    
                    {/*cancel rsvp button*/}
                    {isRSVP && (<button onClick={cancelRSVP}>Cancel RSVP</button>)}
                    

                </div>


                )
            }
            
        

        </div>
    );
}


export default EventDetails;