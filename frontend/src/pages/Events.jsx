import { useState, useEffect } from "react";
import api from "/frontend/src/services/api"; //axios instance from env setup
import EventCard from "/frontend/src/components/EventCard.jsx";
import { useNavigate } from "react-router-dom";

//constant of event categories; one will be active at a time
const eventCategories = 
[   "All",
    "Parties and Pregames",
    "Sports and Tournaments",
    "Study Sessions",
    "Miscellaneous"
]


function Events()
{

    //decides what the active category is
    const [activeCategory, setActiveCategory] = useState("All"); //used for setting active category when clicked
    //(all is used by default, bc when we start up there's no filter selected yet)

    //list of all events (starts empty)
    const [events, setEvents] = useState([]); //used for setting events we see on screen

    //for study sessions specifically--when we study we can say what courses we're doing
    const [courseCode, setCourseCode] = useState("");

    //for loading screen
    const [isLoading, setLoading] = useState(false);


    //function that handles clicking and setting the active tab
    //TODO: necessary?
    function activeCategory(item)
    {
        setActiveCategory(item);
    }

    //function that checks in the button if it's active or not
    function isActive(item)
    {
        if(activeCategory === item) //checks if current item (button) is active; if it is, it gets the classname active,
        //if not, it doesn't get the extra class
        {
            return "active";
        }
        else
        {
            return "";

        }
    }

    /////LOADING EVENTS:

    
    //loads the events we see when we choose which events to select/filter by
    //(needs to be async as we need to wait for api calls !!!)
    async function loadEvents()
    {
        setLoading(true);

        const filtersAdded = {};  //we define empty obj for events loaded bc this essentially
        //represents the filters we're adding; we start with no filters by default

        if(activeCategory !== "All") //(adds category filter)
        {
            //if all the categories aren't active, we only show the categories in the selected category
            filtersAdded.category = activeCategory;   
        }

        if(activeCategory === "Study Sessions" && courseCode != "")
        {
            //if we're filtering by study sessions, we can add a course filter
            //so only that specific course will show up in the results
            filtersAdded.course = courseCode;

        }

        //contact API to get all the events that match these filters, returned into list
        const eventsLoaded = await api.get("/events", {filtersAdded});

        //using events hook, pass in the events loaded that we jsut got from API and 
        //pass in, loading the events onto the screen
        setEvents(eventsLoaded);
        setLoading(false);
    }

    //^now we call the loadEvents function up there using useEffect, so this triggers whenever we change activeCategory
    useEffect(() => {loadEvents();}, [activeCategory, courseCode]);
    //(when activeCategory changes, call loadEvents, activeCategory & courseCode are dependencies)


    ///////////COURSE FILTERS:

    //used for course code entry, checks if there should be input area for course code
    function ifCourseCode()
    {
        if(activeCategory === "Study Sessions")
        {
            //show input if study sessions is checked
            return true;
        }
        else
        {
            return false;
        }
    }

    //goes with prev function, takes in the empty event & sets the courseCode to 
    //the value entererd by the user
    function setCourseFilter(event)
    {
        setCourseCode(event.target.value);
    }

    //for loading screen: check if there are any events
    function checkIfNoEvents()
    {
        if(events.length === 0)
        {
            return true; //return true when there are NO events
        }
        else
        {
            return false;
        }
    }


    return (
        //all the tabs inside the filter bar
        <div>

            <div className="EventsHeader">
                <h1>Events</h1>
                <button onClick={() => navigate("/create")}>Create Event</button>
            </div>


            <div id = "FilterBar">
                <button key="All"  onClick={() => setActiveCategory("All")} 
                    className={isActive("All")}>All</button> 
                
                <button key="PartiesAndPregames"  onClick={() => setActiveCategory("Parties and Pregames")} 
                    className={isActive("Parties and Pregames")}>PartiesAndPregames</button>

                <button key="SportsAndTournaments"  onClick={() => setActiveCategory("Sports and Tournaments")} 
                    className={isActive("Sports and Tournaments")}>SportsAndTournaments</button> 

                <button key="StudySessions"  onClick={() => setActiveCategory("Study Sessions")} 
                    className={isActive("Study Sessions")}>Study Sessions</button>
                
                <button key="Miscellaneous"  onClick={() => setActiveCategory("Miscellaneous")} 
                    className={isActive("Miscellaneous")}>Miscellaneous</button>  
            </div>

            {/*the '&&' is like an if-else. handles course codes */}
            {shouldShowCourseInput() &&
                ( <input type="text" placeholder = "Filter by COURSE CODE (e.g CMSC132)"
                    value={courseCode} onChange={ifCourseCode} 
                    />
                )
            }

            {/*maps over every event in the list, and creates actual event cards for each one*/}
            <div className="EventsList">
                
                {   //make skeleton loaidng screen w/ an empty event
                    isLoading && (<EventCard empty = "" />)
                }
                {   //if not loading & no events: place this
                    !isLoading && checkIfNoEvents && (<h1>No events found; try making your own!</h1>)
                }

                {   //if not loading & events: we can map normally, and make the event cards clickable
                    !isLoading && !checkIfNoEvents && (events.map((event) => 
                        (<div key = {event.id} onClick = {() => onEventClick(event.id)}>
                            <EventCard event={event} />
                        </div>)))
                }
            </div>

        </div>

    );

}




export default Events;

