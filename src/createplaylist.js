let accessToken = '';
let query = '';
const gsbKey = '6841f85f109ed5bb43076a588fb8d79d';

function setupEventListeners() {
    const searchButton = document.getElementById('search-button');
    const createPlaylistButton = document.getElementById('create-playlist-button');

    if (searchButton) {
        searchButton.addEventListener('click', searchSongs);
    } else {
        console.error("Search button not found in the DOM.");
    }

    if (createPlaylistButton) {
        createPlaylistButton.addEventListener('click', createPlaylist);
    } else {
        console.error("Create Playlist button not found in the DOM.");
    }
}

// Ensure setupEventListeners is called after DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
}

// Generate dropdown 1-50 for playlist length
const lengthInput = document.getElementById('length-input');
if (lengthInput) {
    for (let i = 1; i <= 50; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        lengthInput.appendChild(option);
    }
    lengthInput.value = "10"; // Default value
}

// API placeholder functions
async function searchSongs() {
    query = document.getElementById('song-input')?.value;
    const playlistLength = document.getElementById('length-input')?.value;

    if (!query) return alert('Please enter a song or artist.');

    if (!accessToken) {
        console.log("Access token not found:", accessToken);
        return;
    }

    try {
        const tracks = await getSongsFromSpotify(query, playlistLength, 0, 0);
        displayResults(tracks);
    } catch (error) {
        console.error('Error searching songs:', error);
    }
}

async function getSongsFromSpotify(query, playlistLength, offset, filteredTracksLength) {
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${playlistLength}&offset=${offset}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await response.json();
        return filterUniqueTracks(data.tracks.items);
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

function displayResults(tracks) {
    const resultsDiv = document.getElementById('results');
    const resultsBox = document.getElementById('results-box');
    const createPlaylistButton = document.getElementById('create-playlist-button');

    if (!resultsDiv || !resultsBox || !createPlaylistButton) {
        console.error("Results elements not found in the DOM.");
        return;
    }

    resultsDiv.innerHTML = '';
    resultsBox.style.display = 'block';

    if (tracks.length === 0) {
        resultsDiv.textContent = 'No results found.';
        return;
    }

    tracks.forEach(track => {
        const trackElement = document.createElement('div');
        trackElement.classList.add('track');

        const albumCover = document.createElement('img');
        albumCover.src = track.album.images[0]?.url || 'placeholder-image-url';
        albumCover.alt = `${track.name} album cover`;

        const trackInfo = document.createElement('p');
        trackInfo.textContent = `${track.name} by ${track.artists[0].name}`;
        if (track.explicit) trackInfo.textContent += ` (Explicit)`;

        trackElement.appendChild(albumCover);
        trackElement.appendChild(trackInfo);
        resultsDiv.appendChild(trackElement);
    });

    createPlaylistButton.style.display = 'block';
    createPlaylistButton.trackUris = tracks.map(track => track.uri);
}

async function createPlaylist() {
    const trackUris = document.getElementById('create-playlist-button')?.trackUris;

    if (!trackUris || !accessToken) {
        console.error("Track URIs or access token missing.");
        return;
    }

    try {
        const userResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userData = await userResponse.json();

        const playlistResponse = await fetch(
            `https://api.spotify.com/v1/users/${userData.id}/playlists`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: `${query} Playlist`,
                    description: 'Playlist created using the app',
                    public: true,
                }),
            }
        );

        const playlistData = await playlistResponse.json();

        await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: trackUris }),
        });

        alert('Playlist created successfully!');
    } catch (error) {
        console.error('Error creating playlist:', error);
    }
}

function filterUniqueTracks(tracks) {
    const uniqueTracks = [];
    const trackNames = new Set();

    tracks.forEach(track => {
        const normalizedTrackName = track.name.toLowerCase();
        if (!trackNames.has(normalizedTrackName)) {
            uniqueTracks.push(track);
            trackNames.add(normalizedTrackName);
        }
    });

    return uniqueTracks;
}

// Export for testing
module.exports = { searchSongs, displayResults, createPlaylist, setupEventListeners };