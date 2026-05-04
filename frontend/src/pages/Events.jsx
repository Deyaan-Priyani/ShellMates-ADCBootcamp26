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

    const [activeCategory, setActiveCategory] = useState("All"); //used for setting active category when clicked
    const [events, setEvents] = useState([]);

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

    return 
    (
        <div id = "FilterBar">
            //'All' tab
            <button key={All}  onClick={setActiveCategory} className={isActive(All)}>All</button> 
            
            //'Parties and Pregames' tab
            <button key={PartiesAndPregames}  onClick={setActiveCategory} 
                className={isActive(PartiesAndPregames)}>PartiesAndPregames</button>
            
            //'Sports and Tournaments' tab
            <button key={SportsAndTournaments}  onClick={setActiveCategory} 
                className={isActive(SportsAndTournaments)}>SportsAndTournaments</button> 

            //Study Sessions tab
            <button key={StudySessions}  onClick={setActiveCategory} 
                className={isActive(StudySessions)}>Study Sessions</button>
            
            //Miscellaneous tab
            <button key={Miscellaneous}  onClick={setActiveCategory} className={isActive(Miscellaneous)}>Miscellaneous</button>
            
            //event list
        </div>

    );

}




export default App;

