import { useState, useEffect } from "react"; //importing from react so we can use
import api from "/frontend/src/services/api"; //axios instance from env setup

//constant of event categories; one will be active at a time
const eventCategories = 
[   "All",
    "Parties and Pregames",
    "Sports and Tournaments",
    "Study Sessions",
    "Miscellaneous"
]

//where all the tabs are stored
function eventTabs()
{
    ///////CONSTS:

    const [activeCategory, setActiveCategory] = useState("All"); //used for setting active category when clicked
    //(all is used by default, bc when we start up there's no filter selected yet)

    const [events, setEvents] = useState([]); //used for setting events we see on screen
    //(start off with nothing bc no events set yet) 

    ///////FOR TAB BUTTONS: 

    //function that handles clicking and setting the active tab
    function activeCategory(item)
    {
        setActiveCategory(item); //TODO: change this name

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
        const filtersAdded = {};  //we define empty obj for events loaded bc this essentially
        //represents the filters we're adding; we start with no filters by default

        if(activeCategory !== "All") //(adds category filter)
        {
            //if all the categories aren't active, we only show the categories in the selected category
            filtersAdded.category = activeCategory;   
        }

        //TODO: add more filters (once other stuff is set up yippee)

        //contact API to get all the events that match these filters, returned into list
        const eventsLoaded = await api.get("/events", {filtersAdded});

        //using events hook, pass in the events loaded that we jsut got from API and 
        //pass in, loading the events onto the screen
        setEvents(eventsLoaded);
    }

    //^now we call the loadEvents function up there using useEffect, so this triggers whenever we change activeCategory
    useEffect(() => {loadEvents();}, [activeCategory]);
    //(when activeCategory changes, call loadEvents, activeCategory is dependency)



    return 
    (
        //all the tabs inside the filter bar
        //TODO: is key supposed to be in brackets or quotations?
        <div id = "FilterBar">
            <button key="All"  onClick={setActiveCategory} className={isActive(All)}>All</button> 
            
            <button key="PartiesAndPregames"  onClick={setActiveCategory} 
                className={isActive(PartiesAndPregames)}>PartiesAndPregames</button>

            <button key="SportsAndTournaments"  onClick={setActiveCategory} 
                className={isActive(SportsAndTournaments)}>SportsAndTournaments</button> 

            <button key="StudySessions"  onClick={setActiveCategory} 
                className={isActive(StudySessions)}>Study Sessions</button>
            
            <button key="Miscellaneous"  onClick={setActiveCategory} className={isActive(Miscellaneous)}>Miscellaneous</button>  
        </div>
        //events list:

    );

}




export default App;

