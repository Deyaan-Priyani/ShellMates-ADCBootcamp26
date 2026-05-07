import { useState, useEffect } from "react"; 
import { useParams } from "react-router-dom";
import api from "../services/api"; //axios instance from env setup
import { useNavigate } from "react-router-dom";

function EventCreate()
{
    //for the category dropdown:
    const eventCategoriesSelect = 
    [
        "Parties and Pregames",
        "Sports and Tournaments",
        "Study Sessions",
        "Miscellaneous",
    ];  
    //doesn't contain "All" because an event cannot have every category
    
    const navigate = useNavigate();

    //a var for each field of the event, bc we're gonna need to pull these each out from user's typing
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [maxCapacity, setMaxCapacity] = useState("");

    //for creating event, if not fully filled out
    const [errorText, setErrorText] = useState("");

    //for location suggestions; autocompletes location suggestions
    const [locationSuggestions, setLocationSuggestions] = useState([]);

    //location list
    const campusLocations = 
    [
        "Stamp Student Union",
        "McKeldin Library",
        "Eppley Recreation Center",
        "Riggs Alumni Center",
        "Clarice Smith Performing Arts Center",
        "Cole Field House",
        "Byrd Stadium",
    ];

    function handleLocationChange(input) 
    {
        const typed = input.target.value;
        setLocation(typed);

        //filter down to only typed location
        if (typed.length > 0) 
        {
            const matches = campusLocations.filter((spot) =>
            spot.toLowerCase().includes(typed.toLowerCase())
            );
            setLocationSuggestions(matches);
        } 
        else 
        {
            //set to empty if nothing matches
            setLocationSuggestions([]);
        }
    }

    function handleLocationSelect(spot) 
    {
        setLocation(spot);
        setLocationSuggestions([]);
        //once location is picked, we hide the suggestions
    }  


    //this checks every field and makes sure that something was inputted for all of them
    function checkSubmition()
    {
        if(title === "") 
        {
            return "Please enter a title!";
        }   
        
        if(category === "") 
        {
            return "Please select a category!";
        } 
        
        if(description === "") 
        {
            return "Please enter a description!";
        } 

        if(location === "") 
        {
            return "Please enter a location!";
        } 

        if(date === "") 
        {
            return "Please enter a date!";
        } 

        if(time === "") 
        {
            return "Please enter a time!";
        } 

        if(maxCapacity === "") 
        {
            return "Please enter a maximum capacity!";
        } 

        //if no errors, continue with null error message
        return null;

    }

    //function called when submit button clicked to create the event
    async function submitEvent()
    {
        const error = checkSubmition();
        //checks for error; if there is one, we stop the function here and set an error message
        if (error != null)
        {
            setErrorText(error);
            return;
        }

        //now we gather up everything the user submitted
        const newEvent =
        {
            title: title,
            category: category,
            description: description,
            location: location,
            date_time: `${date}T${time}`, //making one date and time string
            max_capacity: parseInt(maxCapacity), //converting into number
        }

        const eventCreated = await api.post("/events/create", newEvent);

        //now, we move to the detail page of the newly created event
        navigate(`/events/${eventCreated.data.id}`);
        //TODO: is 'response.data.id' correct? check w/ backend
        
    } //q's: what does the T do? isn't max_capacity already a number?



    return (
        <div>

        {/*title:*/}
        <input type="text" placeholder = "Enter a title"
            value={title} onChange={(input) => setTitle(input.target.value)} />
        
        {/*categories:*/}
        <select value={category} onChange={(input) => setCategory(input.target.value)}>
            <option value="">Select a category</option>
             {eventCategoriesSelect.map((item) => (<option key={item} value={item}>{item}</option>))}
            </select>

        {/*description:*/}
        <textarea placeholder = "Enter a description of your event" value={description}
            onChange={(input) => setDescription(input.target.value)} />

        {/*location:*/}
        <input type="text" placeholder="Search campus locations" value={location} onChange={handleLocationChange}/>

        {/*now the location suggestion dropdown*/}
        {locationSuggestions.length > 0 && (<div className="Suggestions">
            {locationSuggestions.map((spot) => (<div key={spot} onClick={() => handleLocationSelect(spot)}>
            {spot} </div> ))} </div> )}

        {/*date:*/}
        <input type="date" placeholder = "Enter a date"
            value={date} onChange={(input) => setDate(input.target.value)} />

        {/*time:*/}
        <input type="time" placeholder = "Enter a time"
            value={time} onChange={(input) => setTime(input.target.value)} />

        {/*max capacity:*/}
        <input type="number" placeholder = "Enter the max capacity" min="1" 
            value={maxCapacity} onChange={(input) => setMaxCapacity(input.target.value)} />

        {/*error message, & submit button:*/}
        {errorText !== "" && (<p className="error">{errorText}</p>)}
        <button onClick = {submitEvent}>Create Event!</button>

        </div> 
    );
}




export default EventCreate;