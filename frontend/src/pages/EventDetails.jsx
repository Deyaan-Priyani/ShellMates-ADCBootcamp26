//detail page that shows the details of an event after you click on the eventcard

import { useState, useEffect } from "react"; 
import { useParams } from "react-router-dom";
import api from "../services/api"; //axios instance from env setup
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import RankBadge from "../components/RankBadge";

function EventDetails()
{
    //NEEDS: title, description, category badge, location, date/time, max capacity, current RSVP count, host's name w/ rank badge
    //also google map

    const {id} = useParams(); //pulls id from url
    const [event, setEvent] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [isRSVP, setRSVP] = useState(false);
    const [rankBadge, setRankBadge] = useState(null);

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

        // switched from get_user() to firebase's currentUser - Ayad
        const currentUser = auth.currentUser

        if (currentUser) {
            // token required for /me route - Ayad
            const token = await currentUser.getIdToken()
            const headers = { Authorization: `Bearer ${token}` }
        //pull out rank badge from user and set it
        //TODO: use user uid or email?

        // switched from users/email to users/me because the @ in the email was breaking the url - Ayad
        const currUser = await api.get(`/users/me`, { headers });
        setRankBadge(currUser.data.rankBadge); 
    

        if(currEvent.data.attendees.includes(currentUser.email))
        {
            setRSVP(true);
        }
        else
        {
            setRSVP(false);
        }
        setLoading(false);
    }
}

    //call loadEvent whenever id changes
    useEffect(() => {loadEvent();}, [id]);

    //function that returns opensteetmaps map embedded into the event card
    /*  OLD VERSION:
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
    */

    //NEW VERSION: interactable map rather than static image
    function buildMap(eventLocation)
    {
        const coordinates = locationCoordinates[eventLocation];
        if (!coordinates) return null;

        const [lat, lon] = coordinates.split(",");
        
        return `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lon)-0.002},${parseFloat(lat)-0.002},${parseFloat(lon)+0.002},${parseFloat(lat)+0.002}&layer=mapnik&marker=${lat},${lon}`;
    }

    //rsvp button
    async function enterRSVP()
    {
        // added auth token - Ayad
        const token = await auth.currentUser.getIdToken()
            await api.post(`/events/${id}/rsvp`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });; //post rsvp request to backend
        setRSVP(true);

        //just adds a placeholder person to increment count instantly; this won't actually
        //affect the backend bc they have the actual list back there
        setEvent({ ...event, attendees: [...event.attendees, "me"]});

    }

    //cancel rsvp
    async function cancelRSVP()
    {
        // also added an auth token here - Ayad
        const token = await auth.currentUser.getIdToken()
            await api.delete(`/events/${id}/rsvp`, {
            headers: { Authorization: `Bearer ${token}` }
            }); //delete the rsvp from backend
        setRSVP(false);

        //remove an entry from list so count goes down by 1 instantly
        setEvent({ ...event, attendees: event.attendees.slice(0, -1)});

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

                !isLoading && event !== null && 
                ( 
                <div id="EventDetails"> 
                
                    <h1 className="EventTitle">{event.title}</h1>
                    <p className="Host">Hosted by {event.organizer_email}</p>
                    <span className="HostBadge"><RankBadge tier={rankBadge} /></span> 
                    <p className="Location">Location: {event.location}</p>
                    <span className="DateTime">Time: {event.date}</span>
                    <span className="RSVPCount">{event.attendees.length} Terps are attending</span>
                    <span className="MaxCapacity">Up to {event.max_attendees} allowed</span>
                    <p className="Description">{event.description}</p>
                    <span className="CategoryBadge">{event.category}</span>
                
                    
                    
                    {/*passes in the interactable map rather than image*/}
                    {buildMap(event.location) && (<iframe src={buildMap(event.location)} width="600" height="300"
                        style={{ border: "none" }} title={`Map of ${event.location}`}/> )}

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