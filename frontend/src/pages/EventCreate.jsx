import { useState, useEffect } from "react"; 
import { useParams } from "react-router-dom";
import api from "/frontend/src/services/api"; //axios instance from env setup
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


        <textarea placeholder = "Enter a description of your event" value={description}
            onChange={(input) => setDescription(input.target.value)} />





        </div>


        
    );
}




export default EventCreate;