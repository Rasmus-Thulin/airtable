document.addEventListener('DOMContentLoaded', function() {
    const accessToken = 'patKWiLAdEV1i1OHo.a8e7478a0b05ff7e6c05353f521fe92ee9cd363bc40a13944d2a9410d2ac5d06'; // Replace with your actual access token
    const baseId = 'appOjP57vqzGyxnHu';
    const tableId = 'tblRpmSVor2nZqFkH'; // This is the table ID, not the name
    const viewId = 'viwNq0EDTIGPRlakV';  // This is the view ID, not the name
    
    let url = `https://api.airtable.com/v0/${baseId}/${tableId}?view=${viewId}`;
    let container = document.getElementById('data-container');
    let allRecords = [];

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const fetchData = (url) => {
        console.log(`Fetching URL: ${url}`);
        fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allRecords = allRecords.concat(data.records);

            if (data.offset) {
                // Adding a delay of 5ms before the next fetch request
                setTimeout(() => {
                    fetchData(`https://api.airtable.com/v0/${baseId}/${tableId}?view=${viewId}&offset=${data.offset}`);
                }, 5);
            } else {
                const today = new Date();
                today.setHours(0, 0, 0, 0);  // Reset time to the beginning of the day
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);

                // Filter and sort records by "Event start" date from today and onward
                const filteredRecords = allRecords.filter(record => {
                    const eventStart = new Date(record.fields["Event start"]);
                    return eventStart >= today && record.fields["Event status"] !== "Personel Absence";
                }).sort((a, b) => new Date(a.fields["Event start"]) - new Date(b.fields["Event start"]));

                // Format dates and display filtered records
                filteredRecords.forEach(record => {
                    const row = document.createElement('tr');
                    
                    const fieldsToDisplay = ["Event start", "Project", "Tags", "Place", "Event status"];
                    
                    fieldsToDisplay.forEach(field => {
                        const cell = document.createElement('td');
                        if (field === "Event start") {
                            const eventStart = new Date(record.fields[field]);
                            const eventStartMidnight = new Date(eventStart);
                            eventStartMidnight.setHours(0, 0, 0, 0);  // Reset event time to the beginning of the day
                            if (eventStartMidnight.getTime() === today.getTime()) {
                                cell.textContent = "Today";
                            } else if (eventStartMidnight.getTime() === tomorrow.getTime()) {
                                cell.textContent = "Tomorrow";
                            } else {
                                const formattedDate = `${dayNames[eventStart.getDay()]}, ${eventStart.getDate()} ${monthNames[eventStart.getMonth()]}`;
                                cell.textContent = formattedDate;  // Format with day of the week and short month name
                            }
                        } else {
                            cell.textContent = record.fields[field] || '';
                        }
                        row.appendChild(cell);
                    });
                    
                    // Apply status-specific classes
                    switch (record.fields["Event status"]) {
                        case "To do":
                            row.classList.add('status-todo');
                            break;
                        case "In progress":
                            row.classList.add('status-in-progress');
                            break;
                        case "Completed":
                            row.classList.add('status-completed');
                            break;
                        case "Cancelled":
                            row.classList.add('status-cancelled');
                            break;
                        case "Requested":
                            row.classList.add('status-requested');
                            break;
                    }
                
                    container.appendChild(row);
                });
                
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error: ${error.message}`);
        });
    };

    fetchData(url);
});
