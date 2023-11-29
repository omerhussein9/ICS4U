// Get the form element
const form = document.getElementById('scoreForm');

// Define the number of games per page and initialize variables for pagination
const num_games_per_page = 8;
let games_on_page = 0;
let curr_page = 1;
let max_page = 0;

// Variable to track the last time the pagination was clicked
let lastPagination = 0;

// Check if local storage has existing scores
let scoreData = JSON.parse(localStorage.getItem('scoreData')) || [];

// Function to update the list with cards and save to local storage
function updateList() {
    document.querySelector(".card-container").innerHTML = '';

    // Calculate the maximum number of pages based on the number of games and games per page
    max_page = Math.ceil(scoreData.length / num_games_per_page);

    // Display a subset of games based on the current page
    changeToArr().slice((curr_page - 1) * num_games_per_page, num_games_per_page * curr_page).forEach((score, index) => {
        // Create a card element
        const card = document.createElement('div');
        card.classList.add("card");
        document.querySelector('.card-container').append(card);

        // Create card header with date
        const cardHeader = document.createElement('header');
        cardHeader.classList.add('card-header');
        card.append(cardHeader);

        // Display date in the card header
        const cardHeaderTitle = document.createElement('p');
        cardHeaderTitle.classList.add('card-header-title');
        cardHeaderTitle.textContent = score.date;
        cardHeader.append(cardHeaderTitle);

        // Create card content with game details and remove link
        const cardContent = document.createElement('div');
        cardContent.classList.add("card-content");
        card.append(cardContent);

        const p = document.createElement('p');
        p.classList.add('subtitle');
        // Display game details and provide a link to remove the score
        p.innerHTML = `<span>${score.team1}: ${score.team1Score} - ${score.team2}: ${score.team2Score} -</span> <a href="#" onclick="removeScore(${index})">Remove</a>`;
        cardContent.append(p);
    });

    // Save the updated scoreData to local storage
    localStorage.setItem('scoreData', JSON.stringify(scoreData));
}

// Function to add game scores from the form
form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Get form input elements
    const team1Select = document.getElementById('team1');
    const team1ScoreInput = document.getElementById('team1Score');
    const team2Select = document.getElementById('team2');
    const team2ScoreInput = document.getElementById('team2Score');
    const date = document.getElementById('date').value;

    // Extract values from form inputs
    const team1 = team1Select.value;
    const team1Score = parseInt(team1ScoreInput.value);
    const team2 = team2Select.value;
    const team2Score = parseInt(team2ScoreInput.value);

    // Check if inputs are valid
    if (!isNaN(team1Score) && !isNaN(team2Score) && team1 !== team2) {
        // Create a score object and add it to the scoreData array
        const score = { team1, team1Score, team2, team2Score, date };
        scoreData.push(score);

        // Clear form input fields
        team1Select.value = 'Team A';
        team1ScoreInput.value = '';
        team2Select.value = 'Team A';
        team2ScoreInput.value = '';
        date.value = '';

        // Update the displayed list of scores
        updateList();
    } else {
        alert("Please pick possible outcomes for games.");
    }
});

// Function to remove a score from the list
function removeScore(index) {
    // Remove the score at the specified index
    scoreData.splice(index, 1);
    // Update the displayed list of scores
    updateList();
}

// Convert the scoreData object to an array
function changeToArr() {
    let arr = [];
    scoreData.forEach((score, index) => {
        arr.push(score);
    });
    return arr;
}

// Function to update the pagination UI
function updatePagination() {
    const ul = document.querySelector("#pagination");
    ul.innerHTML = '';
    // Create pagination links for each page
    for (let page = 1; page <= max_page; page++) {
        const li = document.createElement('li');
        li.innerHTML = `<a class="pagination-link" aria-label="Goto page ${page}">${page}</a>`;
        ul.append(li);
    }
}

// Event listener for mouseover on pagination links
const ul = document.querySelector('ul');
ul.addEventListener('mouseover', e => {
    ul.childNodes.forEach(li => {
        // Event listener for click on pagination link
        li.addEventListener('click', event => {
            // Check if pagination link was clicked within the same second
            if (lastPagination !== new Date().getSeconds()) {
                // Update current page and refresh the displayed list of scores
                curr_page = parseInt(li.textContent);
                document.querySelector(".card-container").innerHTML = '';
                updateList();
                // Update the lastPagination variable to prevent rapid clicking
                lastPagination = new Date().getSeconds();
            }
        });
    });
});

// Initial list population
updateList();
// Initial pagination UI setup
updatePagination();
