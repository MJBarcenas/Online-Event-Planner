// Database variables declaration and initialization 
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseSettings = {
    databaseURL: "https://event-planner-portfolio-69ddd-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseSettings);
const database = getDatabase(app);
const eventsPlanned = ref(database, "Events");
const notes = ref(database, "Notes");

onValue(eventsPlanned, function(snapshot) {
    clearWebsite();
    let events = snapshot.val();

    readFirebase(events);
});

onValue(notes, function(snapshot) {
    let savedNote = Object.values(snapshot.val());
    note.value = savedNote[0];
});

// Set the height of the container div to be just equal to the client screen height

let nav = document.querySelector("nav");
let body = document.querySelector("body");
let container = document.querySelector(".container");
let footer = document.querySelector("footer");

container.style.height = body.getBoundingClientRect().height - nav.getBoundingClientRect().height - footer.getBoundingClientRect().height;

let note = document.querySelector("textarea");
note.addEventListener("focusout", () => {
    // Resets the value of the notes if it has no value and push it to the database
    if (note.value === "") {
        note.value = "Start a note...";
    }

    let oldNotes = ref(database, "Notes");
    remove(oldNotes);
    push(notes, note.value);
});

let wrapper = document.querySelector(".wrapper");
wrapper.addEventListener('dblclick', (event) => {
    // Checks for user's mouse event and if they click a date show the add event modal
    if (event.target.tagName.toLowerCase() == "li" && !event.target.hasAttribute("class") && event.target.parentNode.classList.contains("days")) {
        let clickedDate = event.target.innerText;
        let clickedMonth = event.target.closest(".calendar").firstChild.innerText;
        let chosenYear = document.querySelector(".current-year").innerText;

        document.querySelector("#Add-EventDate").value = `${clickedMonth} ${clickedDate}, ${chosenYear}`;

        showAddEventModal();
    }
});

let addEventAddGuest = document.querySelector("#Add-Event-Add-Guest");
let addEventBody = document.querySelector(".Add-Event-Body");
addEventAddGuest.addEventListener("click", () => {
    // Adds a new input element to the add event body 

    let input = document.createElement("input");
    input.type = "text";
    input.className = "Textbox-Control fill";
    input.placeholder = "Enter the guest name";

    addEventBody.insertBefore(input, addEventBody.children.length == 1 ? addEventBody.children[0] : addEventBody.lastElementChild);
})

function clearWebsite() {
    // Clear the booked dates in the calendar with their id and classes
    // and the events list

    let bookedDates = document.querySelectorAll("li .booked");
    for (let i = 0; bookedDates.length; i++) {
        bookedDates[i].removeAttribute("class");
    }

    let eventBody = document.querySelector("#Event-Body");
    eventBody.innerHTML = "";
}

function readFirebase(db) {
    // Reads the firebase results and displays it into the website
    let events = Object.entries(db);
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let eventBody = document.querySelector("#Event-Body");
        let newEventTR = document.createElement("tr");

        let eventNameTD = document.createElement("td");
        eventNameTD.innerText = event[1].eventName;

        let eventDateTD = document.createElement("td");
        eventDateTD.innerText = event[1].eventDate;

        let eventLocationTD = document.createElement("td");
        eventLocationTD.innerText = event[1].eventLocation;

        let eventActionTD = document.createElement("td");
        let eventDeleteButton = document.createElement("button");
        eventDeleteButton.innerText = "DELETE";
        eventDeleteButton.className = "Button-Red";
        eventActionTD.appendChild(eventDeleteButton);

        newEventTR.append(eventNameTD, eventDateTD, eventLocationTD, eventActionTD);
        newEventTR.setAttribute("unique-id", event[0]);

        eventBody.appendChild(newEventTR);

        let currentEventYear = event[1].eventDate.split(" ")[2];
        if (currentEventYear != currYear) {
            continue;
        }

        let calendarDate = document.getElementById(event[1].eventDate);
        calendarDate.setAttribute("class", "booked");
    }
}

function showAddEventModal() {
    // Shows the add event modal
    document.querySelector("#Add-Event").style.display = "grid";
}

function hideAddEventModal() {
    // Hides the add event modal
    document.querySelector("#Add-Event").style.display = "none";
}

function showEditEventModal() {
    // Shows the edit event modal
    document.querySelector("#Edit-Event").style.display = "grid";
}

function hideEditEventModal() {
    // Hides the edit event modal
    document.querySelector("#Edit-Event").style.display = "none";
}

function validateAddEventModal() {
    // Check for the validity of the edit event modal's input
    return document.querySelector("#Add-EventName").value.trim() != "" && document.querySelector("#Add-EventDate").value.trim() != "" && document.querySelector("#Add-EventLocation").value.trim() != "";
}

function validateEditEventModal() {
    // Check for the validity of the edit event modal's input
    return document.querySelector("#Edit-EventName").value.trim() != "" && document.querySelector("#Edit-EventDate").value.trim() != "" && document.querySelector("#Edit-EventLocation").value.trim() != "";
}

function clearAddEventModal() {
    // Clears the edit event modal's inputs
    document.querySelector("#Add-EventName").value = "";
    document.querySelector("#Add-EventDate").value = "";
    document.querySelector("#Add-EventLocation").value = "";
    let eventBody = document.querySelector(".Add-Event-Body");

    while (eventBody.children.length != 1) {
        eventBody.removeChild(eventBody.firstElementChild);
    }
}

function clearEditEventModal() {
    // Clears the edit event modal's inputs
    document.querySelector("#Edit-EventName").value = "";
    document.querySelector("#Edit-EventDate").value = "";
    document.querySelector("#Edit-EventLocation").value = "";
    let eventBody = document.querySelector(".Edit-Event-Body");

    while (eventBody.children.length != 1) {
        eventBody.removeChild(eventBody.firstElementChild);
    }
}

function clearEventsEntry() {
    // Clear all the events that is in the event body div
    let eventBody = document.querySelector("#Event-Body");
    eventBody.innerHTML = "";
}

let addEventButton = document.querySelector("#Add-Event-Button");
addEventButton.addEventListener("click", () => {
    // Checks if the modal's input are all valid and if 
    // it is, then update the value that is stored in the firebase
    if (!validateAddEventModal()) {
        return;
    }

    let eventName = document.querySelector("#Add-EventName").value.trim();
    let eventDate = document.querySelector("#Add-EventDate").value.trim();
    let eventLocation = document.querySelector("#Add-EventLocation").value.trim();
    let guestList = Array.from(document.querySelectorAll(".Add-Event-Body > input")).filter(guestEntry => guestEntry.value.trim() != "").map(object => object.value.trim());

    let eventDetails = {
        eventName: eventName,
        eventDate: eventDate,
        eventLocation: eventLocation,
        guestsList: guestList
    }
    push(eventsPlanned, eventDetails);

    clearAddEventModal();
    hideAddEventModal();
});

let editEventButton = document.querySelector("#Edit-Event-Button");
editEventButton.addEventListener("click", async() => {
    // Checks if the modal's input are all valid and if 
    // it is, then update the value that is stored in the firebase
    if (!validateEditEventModal()) {
        return;
    }

    let uniqueID = document.querySelector("#Edit-Event").getAttribute("to-be-edited");
    let eventName = document.querySelector("#Edit-EventName").value.trim();
    let eventDate = document.querySelector("#Edit-EventDate").value.trim();
    let eventLocation = document.querySelector("#Edit-EventLocation").value.trim();
    let guestList = Array.from(document.querySelectorAll(".Edit-Event-Body > input")).filter(guestEntry => guestEntry.value.trim() != "").map(object => object.value.trim());

    let eventDetails = {
        eventName: eventName,
        eventDate: eventDate,
        eventLocation: eventLocation,
        guestsList: guestList
    }

    update(ref(database, "Events/" + uniqueID), eventDetails);

    clearEditEventModal();
    hideEditEventModal();
});

let sortableHeaders = Array.from(document.querySelectorAll(".Listview-Control th"));
let eventNameHeaders = sortableHeaders[0];
let eventDates = sortableHeaders[1];

eventNameHeaders.addEventListener("click", () => {
    // Sorts the event's entry using its date
    let eventNames = Array.from(document.querySelectorAll(".Listview-Control tbody tr td:first-child")).map((event) => {
        return [event.innerText, event.parentNode];
    }).sort().map(event => { return event[1] });

    clearEventsEntry();

    let eventBody = document.querySelector("#Event-Body");
    if (eventBody.hasAttribute("ascending")) {
        eventBody.append(...eventNames.reverse());
        eventBody.removeAttribute("ascending", "");
    } else {
        eventBody.append(...eventNames);
        eventBody.setAttribute("ascending", "");
    }

});

eventDates.addEventListener("click", () => {
    // Sorts the event's entry using its date
    let eventNames = Array.from(document.querySelectorAll(".Listview-Control tbody tr td:nth-child(2")).map((event) => {
        return [event.innerText, event.parentNode];
    }).sort(function(date1, date2) { return new Date(date1[0]) - new Date(date2[0]) }).map(event => { return event[1] });

    clearEventsEntry();
    let eventBody = document.querySelector("#Event-Body");
    if (eventBody.hasAttribute("earliest")) {
        eventBody.append(...eventNames.reverse());
        eventBody.removeAttribute("earliest", "");
    } else {
        eventBody.append(...eventNames);
        eventBody.setAttribute("earliest", "");
    }
});

let addEvent = document.querySelector("#Add-Event");
addEvent.addEventListener("dblclick", (event) => {
    // Clears the show the add event modal when the user perform a double click on
    // a calendar date
    if (event.target.id == "Add-Event" && event.target.tagName.toLowerCase() == "div") {
        clearAddEventModal();
        addEvent.style.display = "none";
    }
});

let editEvent = document.querySelector("#Edit-Event");
editEvent.addEventListener("dblclick", (event) => {
    // Clears the edit event modal and shows it if the user perform a double click 
    // on one of the event's entry
    if (event.target.id == "Edit-Event" && event.target.tagName.toLowerCase() == "div") {
        clearEditEventModal();
        editEvent.style.display = "none";
    }
});

let eventBody = document.querySelector("#Event-Body");
eventBody.addEventListener("click", (event) => {
    // Checks for the mouse event performed by the user and if it's for the delete
    // button then it will remove it fromt he firebase which will automatically 
    // refresh the list of the events
    if (event.target.tagName.toLowerCase() == "button" && event.target.innerText == "DELETE") {
        let eventDate = event.target.parentNode.parentNode.children[1].innerText;
        let eventCalendarDate = document.getElementById(eventDate);

        if (eventCalendarDate !== null) {
            eventCalendarDate.removeAttribute("class");
        }
        // Remove also in the firebase
        let eventID = event.target.closest("tr").getAttribute("unique-id");
        let fireBaseEntry = ref(database, `Events/${eventID}`);

        remove(fireBaseEntry);
    }
});

eventBody.addEventListener("dblclick", (event) => {
    // Lets the user to edit an existing event
    if (event.target.tagName.toLowerCase() == "tr" || event.target.tagName.toLowerCase() == "td") {
        let uniqueID = event.target.closest("tr").getAttribute("unique-id");
        onValue(ref(database, "Events/" + uniqueID), function(snapshot) {
            clearEditEventModal();
            let eventDetails = snapshot.val();
            let editEventName = document.querySelector("#Edit-EventName");
            let editEventDate = document.querySelector("#Edit-EventDate");
            let editEventLocation = document.querySelector("#Edit-EventLocation");

            editEventName.value = eventDetails.eventName;
            editEventDate.value = eventDetails.eventDate;
            editEventLocation.value = eventDetails.eventLocation;

            if ("guestsList" in eventDetails) {
                let guestsList = eventDetails.guestsList;
                for (let i = 0; i < guestsList.length; i++) {
                    let guestInput = document.createElement("input");
                    guestInput.type = "text";
                    guestInput.className = "Textbox-Control fill";
                    guestInput.placeholder = "Edit guest name";
                    guestInput.value = guestsList[i];

                    let editEventBody = document.querySelector(".Edit-Event-Body");
                    editEventBody.insertBefore(guestInput, editEventBody.children.length == 1 ? editEventBody.children[0] : editEventBody.lastElementChild);
                }
            }
        });

        document.querySelector("#Edit-Event").setAttribute("to-be-edited", uniqueID);
        showEditEventModal();
    }
});


//
// Functions and variables related to the calendar
//

const currentYear = document.querySelector(".current-year"),
    prevNextIcon = document.querySelectorAll(".icons span");

// getting new date, current year and month
let date = new Date(),
    currYear = date.getFullYear()

// storing full name of all months in array
const months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
];

function clearCalendar() {
    let wrapper = document.querySelector(".wrapper");
    while (wrapper.children.length > 1) {
        wrapper.removeChild(wrapper.lastChild);
    }
}

function renderCalendar() {
    // Generate the calendar for the entire year
    let wrapperElements = document.querySelector(".wrapper");
    for (let month = 0; month < 12; month++) {
        let calendarDiv = document.createElement("div");
        calendarDiv.className = "calendar";

        let calendarMonth = document.createElement("p");
        calendarMonth.className = "calendar-month";
        calendarMonth.innerText = months[month];

        let weeksUL = document.createElement("ul");
        weeksUL.className = "weeks";
        weeksUL.innerHTML = `<li>Sun</li>
                            <li>Mon</li>
                            <li>Tue</li>
                            <li>Wed</li>
                            <li>Thu</li>
                            <li>Fri</li>
                            <li>Sat</li>`;

        let daysUL = document.createElement("ul");
        daysUL.className = "days";

        let firstDayofMonth = new Date(currYear, month, 1).getDay(),
            lastDateofMonth = new Date(currYear, month + 1, 0).getDate(),
            lastDateofLastMonth = new Date(currYear, month, 0).getDate();
        let liTag = "";


        for (let i = firstDayofMonth; i > 0; i--) {
            liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
        }

        for (let i = 1; i <= lastDateofMonth; i++) {
            let isToday = i === date.getDate() && month === new Date().getMonth() &&
                currYear === new Date().getFullYear() ? "class='active'" : "";

            liTag += `<li id="${months[month]} ${i}, ${currYear}" ${isToday}>${i}</li>`;
        }

        for (let i = 0; i < (42 - (firstDayofMonth + lastDateofMonth)); i++) {
            liTag += `<li class="inactive">${i + 1}</li>`;
        }
        daysUL.innerHTML = liTag;
        calendarDiv.append(calendarMonth, weeksUL, daysUL);
        wrapperElements.appendChild(calendarDiv);
    }
    currentYear.innerText = `${currYear}`;
}

renderCalendar(); // Render the calendar when user launches the site

prevNextIcon.forEach(icon => {
    // Add functions the the icons where user can check other year's calendar
    icon.addEventListener("click", () => {
        currYear = icon.id === "prev" ? currYear - 1 : currYear + 1;
        clearCalendar();
        renderCalendar();

        onValue(eventsPlanned, function(snapshot) {
            let events = snapshot.val();

            readFirebase(events);
        });
    });
});