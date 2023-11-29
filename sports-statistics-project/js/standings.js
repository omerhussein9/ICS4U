// Array to store team objects
const teams = [];

// Array of Eastern Conference teams
const eastern_teams = [
    "Boston Celtics", "Orlando Magic", "Milwaukee Bucks", "Philadelphia 76ers", "Indiana Pacers", "Miami Heat",
    "New York Knicks", "Cleveland Caveliers", "Atlanta Hawks", "Brooklyn Nets", "Toronto Raptors", "Charlotte Hornets", "Chicago Bulls", "Detroit Pistons", "Washington Wizards"
];

// SVG icons for the table headers
const square = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M384 80c8.8 0 16 7.2 16 16V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V96c0-8.8 7.2-16 16-16H384zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64z"/></svg>';
const up_arrow = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>';
const down_arrow = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>';

// Variables for sorting state and current sorting element
let lastSort = 0;
let lastFilter = 'Overall';
let currentTextSort = document.getElementById('position');

// Retrieve or initialize scoreData from localStorage
let scoreData = JSON.parse(localStorage.getItem('scoreData')) || [];

// Team constructor function
function Team(name) {
    this.name = name;
    this.w = 0;
    this.l = 0;
    this.points = 0;
    this.wstreak = 0;
    this.position = 0;
    this.conference = '';

    // Method to add a game to the team's record
    this.addGame = (thisScore, otherScore, otherIndex) => {
        if (thisScore > otherScore) {
            this.w++;
            this.wstreak++;
        } else if (thisScore < otherScore) {
            this.l++;
            this.wstreak = 0;
        }

        this.points += thisScore;

        if (otherIndex !== -1) teams[otherIndex].addGame(otherScore, thisScore, -1);
    };
}

// Function to initialize teams and update standings
function initializeTeams() {
    initializeTable();
    scoreData.forEach(score => {
        // Add teams to the array if they aren't already there
        if (JSON.stringify(teams).indexOf(score.team1) === -1)
            teams.push(new Team(score.team1));

        if (JSON.stringify(teams).indexOf(score.team2) === -1)
            teams.push(new Team(score.team2));

        // Find the index in the teams array for the two teams
        const team1 = teams.findIndex((e) => e.name === score.team1);
        const team2 = teams.findIndex((e) => e.name === score.team2);

        // Check the conference that the teams are in
        if (JSON.stringify(eastern_teams).indexOf(teams[team1].name) === -1)
            teams[team1].conference = 'Western';
        if (JSON.stringify(eastern_teams).indexOf(teams[team1].name) > -1)
            teams[team1].conference = 'Eastern';

        if (JSON.stringify(eastern_teams).indexOf(teams[team2].name) === -1)
            teams[team2].conference = 'Western';
        if (JSON.stringify(eastern_teams).indexOf(teams[team2].name) > -1)
            teams[team2].conference = 'Eastern';

        // Check if the teams won, lost, or tied and add the data to the array
        teams[team1].addGame(score.team1Score, score.team2Score, team2);
    });
    setPositions();

    // Update the table with the standings
    updateStandings(posForward);
}

// Event listener for mouseover on table headers
const thead = document.querySelector('tr');
thead.addEventListener('mouseover', e => {
    e.preventDefault();
    thead.childNodes.forEach(td => {
        if (td.innerText !== undefined) {
            td.lastChild.addEventListener('click', event => {
                let date = new Date();
                if (date.getSeconds() !== lastSort) {
                    textSort(td, true);
                    lastSort = date.getSeconds();
                }
            });
        }
    });
});

// Function to initialize the table headers with sorting icons
function initializeTable() {
    thead.childNodes.forEach(td => {
        if (td.innerText !== undefined && td.innerText !== 'Team') {
            const icon = document.createElement('svg');
            icon.innerHTML = square;
            icon.setAttribute('state', '0');

            if (td.innerText == 'Pos') { // Sets the default state for the table as position in descending order
                icon.innerHTML = up_arrow;
                icon.setAttribute('state', '1');
            }

            icon.classList.add('align');
            td.appendChild(icon);
        }
    });
}

// Function to handle text-based sorting
function textSort(td, sortedFromClick) {
    resetStates(td.innerText);

    if (td.innerText == 'Pos')
        setStates(posForward, posDownward, td, sortedFromClick);

    if (td.innerText == 'Pld')
        setStates(pldForward, pldDownward, td, sortedFromClick);

    if (td.innerText == 'W')
        setStates(posDownward, posForward, td, sortedFromClick);

    if (td.innerText == 'L')
        setStates(lDownward, lForward, td, sortedFromClick);

    if (td.innerText == 'Pts/Game')
        setStates(ptsPerGameDownward, ptsPerGameForward, td, sortedFromClick);

    if (td.innerText == 'Win Streak')
        setStates(wstreakDownward, wstreakForward, td, sortedFromClick);

    if (td.innerText == 'PCT')
        setStates(pctDownward, pctForward, td, sortedFromClick);
}

// Function to set sorting states
function setStates(forwardsSort, downwardsSort, td, sortedFromClick) {
    let child = td.lastChild;
    switch (child.getAttribute('state')) {
        case '0':
            if (sortedFromClick) {
                child.innerHTML = down_arrow;
                child.setAttribute('state', '1');
                updateStandings(downwardsSort);
            } else
                updateStandings(forwardsSort);
            break;
        case '1':
            if (sortedFromClick) {
                child.innerHTML = down_arrow;
                child.setAttribute('state', '2');
                updateStandings(downwardsSort);
            } else
                updateStandings(forwardsSort);
            break;
        case '2':
            if (sortedFromClick) {
                child.innerHTML = up_arrow;
                child.setAttribute('state', '1');
                updateStandings(forwardsSort);
            } else
                updateStandings(downwardsSort);
    }
    currentTextSort = child.parentNode;
}

// Function to reset sorting states
function resetStates(str) {
    thead.childNodes.forEach(td => {
        if (td.innerText !== str && td.innerText !== undefined && td.innerText !== 'Team') {
            td.lastChild.innerHTML = square;
            td.lastChild.setAttribute('state', '1');
        }
    });
}

// Function to set positions for teams based on wins
function setPositions() {
    teams.sort((a, b) => a.w > b.w ? -1 : 1).forEach((team, index) => team.position = index + 1);
}

// Function to update the standings in the table
function updateStandings(sortFunction) {
    let arr = [];

    // Filter teams based on conference
    const filter = document.getElementById("conference").value;
    if (filter == 'Eastern')
        arr = teams.filter(team => team.conference == 'Eastern');
    else if (filter == 'Western')
        arr = teams.filter(team => team.conference == 'Western');
    else
        arr = teams;

    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    // Sort and display teams in the table
    arr.sort(sortFunction).forEach((team, index) => {
        const tr = document.createElement('tr');

        // Display the position the team is currently in
        const pos = document.createElement('th');
        pos.innerText = team.position;
        tr.appendChild(pos);

        // Display the name of the team
        const name = document.createElement('td');
        name.innerHTML = `<a class="team" href="games.html?team=${team.name}">${team.name}</a>`;
        tr.appendChild(name);

        // Display the amount of games the team has played
        const played = document.createElement('td');
        played.innerText = team.w + team.l;
        tr.appendChild(played);

        // Display the amount of wins the team has
        const wins = document.createElement('td');
        wins.innerText = team.w;
        tr.appendChild(wins);

        // Display the amount of losses the team has
        const losses = document.createElement('td');
        losses.innerText = team.l;
        tr.appendChild(losses);

        // Display additional statistics if the screen width is greater than 768 pixels
        if (updateWidth()) {
            // Display the amount of points the team has scored
            const points = document.createElement('td');
            points.innerText = (team.points / (team.w + team.l) + "").substring(0, 5);
            tr.appendChild(points);

            // Display the current win streak of that team
            const wstreak = document.createElement('td');
            wstreak.innerText = team.wstreak === 0 ? 0 : 'W' + team.wstreak;
            tr.appendChild(wstreak);

            // Display the winning percentage of the team
            const pct = document.createElement('td');
            pct.innerText = (team.w / (team.w + team.l) + "").substring(0, 5);
            tr.appendChild(pct);
        }

        tbody.appendChild(tr);
    });
}

// Event listener for conference filter change
const updateConference = () => {
    const filter = document.getElementById("conference").value;

    if (filter != lastFilter) {
        updateStandings();
        lastFilter = filter;
    }
};

// Function to check if the screen width is greater than 768 pixels
const updateWidth = () => window.innerWidth > 768;

// Sorting functions to be called before updating the standings
const posForward = (a, b) => a.position < b.position ? -1 : 1;

const posDownward = (a, b) => a.position > b.position ? -1 : 1;

const pldDownward = (a, b) => a.w + a.l > b.w + b.l ? -1 : 1;

const pldForward = (a, b) => a.w + a.l < b.w + b.l ? -1 : 1;

const lForward = (a, b) => a.l > b.l ? -1 : 1;

const lDownward = (a, b) => a.l < b.l ? -1 : 1;

const ptsPerGameForward = (a, b) => a.points / (a.w + a.l) > b.points / (b.w + b.l) ? -1 : 1;

const ptsPerGameDownward = (a, b) => a.points / (a.w + a.l) < b.points / (b.w + b.l) ? -1 : 1;

const wstreakForward = (a, b) => a.wstreak > b.wstreak ? -1 : 1;

const wstreakDownward = (a, b) => a.wstreak < b.wstreak ? -1 : 1;

const pctForward = (a, b) => a.w / (a.w + a.l) > b.w / (b.w + b.l) ? -1 : 1

const pctDownward = (a, b) => a.w / (a.w + a.l) < b.w / (b.w + b.l) ? -1 : 1

initializeTeams();

// call the update conference method every 100 milliseconds
setInterval(updateConference, 100)