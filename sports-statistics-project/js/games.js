// Retrieve or initialize scoreData from localStorage
const scoreData = JSON.parse(localStorage.getItem('scoreData')) || [];

// Get team parameter from URL query string
const url = window.location.search;
const searchParams = new URLSearchParams(url);
const team = searchParams.get('team');

// Constants for pagination and game display
const num_games_per_page = 4;
let games_on_page = 0;
let curr_page = 1;
let max_page = 0;

// Flags and variables for filtering
let isFiltered = false;
let lastPagination = 0;

// Arrays to store game data
let arr = [];
let newArr = [];

// Set the title on the page
document.querySelector('h1').textContent = team + " Games";

// Function to filter games based on date range
function filterDates() {
    // Get date inputs and convert them to Date objects
    const date1 = new Date(document.getElementById('date1').value) || '';
    const date2 = new Date(document.getElementById('date2').value) || '';

    // Validate date inputs
    if (date1.getTime() > date2.getTime() || date1 === '' || date2 === '') {
        alert("Please make sure that the first date is less than the second date and they both have values.");
        return;
    }

    // Retrieve games for the selected team
    gamesWithTeam();

    // Clear the card container
    document.querySelector(".card-container").innerHTML = '';

    // Filter games based on date range
    arr = arr.filter((score, index) => {
        let d = new Date(score.date);
        if (d.getTime() >= date1.getTime() && d.getTime() <= date2.getTime()) {
            return score;
        }
    });

    // Handle case when no games match the date range
    if (arr.length === 0) {
        alert("No games for this selected date range, resetting filters");
        resetGames();
        return;
    }

    // Update flags and pagination
    isFiltered = true;
    updatePagination();

    // Create cards for the filtered games
    createCards();
}

// Function to reset games and clear filters
function resetGames() {
    // Retrieve games for the selected team
    gamesWithTeam();

    // Reset filtering flag
    isFiltered = false;

    // Clear the card container
    document.querySelector(".card-container").innerHTML = '';

    // Create cards for all games
    createCards();
}

// Function to create game cards for display
function createCards() {
    // Slice the array to get games for the current page
    newArr = arr.slice((curr_page - 1) * num_games_per_page, num_games_per_page * curr_page);

    // Iterate over the games and create card elements
    newArr.forEach((score, index) => {
        const card = document.createElement('div');
        card.classList.add("card");
        document.querySelector('.card-container').append(card);

        const cardHeader = document.createElement('header');
        cardHeader.classList.add('card-header');
        card.append(cardHeader);

        const cardHeaderTitle = document.createElement('p');
        cardHeaderTitle.classList.add('card-header-title');
        cardHeaderTitle.textContent = teamWon(score) + " " + score.date;
        cardHeader.append(cardHeaderTitle);

        const cardContent = document.createElement('div');
        cardContent.classList.add("card-content");
        card.append(cardContent);

        const p = document.createElement('p');
        p.classList.add('subtitle');
        p.textContent = `${score.team1}: ${score.team1Score} - ${score.team2}: ${score.team2Score}`;
        cardContent.append(p);
    });
}

// Function to filter games for the selected team
function gamesWithTeam() {
    arr = [];
    scoreData.forEach((score, index) => {
        if (score.team1 == team || score.team2 == team) {
            arr.push(score);
        }
    });

    // Update pagination based on the filtered games
    updatePagination();
}

// Function to determine if the selected team won a game
function teamWon(score) {
    if (score.team1 == team && score.team1Score > score.team2Score) return "VICTORY!";
    if (score.team2 == team && score.team2Score > score.team1Score) return "VICTORY!";
    else return "DEFEAT";
}

// Function to update pagination based on the number of games
function updatePagination() {
    // Calculate the maximum number of pages
    max_page = Math.ceil((arr.length) / num_games_per_page);

    // Get the pagination container
    const ul = document.querySelector("#pagination");
    ul.innerHTML = '';

    // Create pagination links
    for (let page = 1; page <= max_page; page++) {
        const li = document.createElement('li');
        li.innerHTML = `<a class="pagination-link" aria-label="Goto page ${page}">${page}</a>`;
        ul.append(li);
    }
}

// Event listener for pagination links
const ul = document.querySelector('ul');
ul.addEventListener('mouseover', e => {
    ul.childNodes.forEach(li => {
        // Event listener for clicking on a pagination link
        li.addEventListener('click', event => {
            // Avoid rapid clicks within the same second
            if (lastPagination !== new Date().getSeconds()) {
                // Update current page and clear the card container
                curr_page = parseInt(li.textContent);
                document.querySelector(".card-container").innerHTML = '';

                // Update game display based on filtering status
                if (isFiltered) filterDates();
                else createCards();

                // Update the last click timestamp
                lastPagination = new Date().getSeconds();
            }
        });
    });
});

// Initial retrieval and display of games for the selected team
gamesWithTeam();
createCards();