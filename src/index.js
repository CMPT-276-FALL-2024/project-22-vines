const clientId = 'efe131fac3c74d3cac20ae0886b01ff9';
const redirectUri = 'https://cmpt-276-fall-2024.github.io/project-22-vines/src/createplaylist.html';
let accessToken = '';

document.getElementById('log-in-button').addEventListener('click', authorizeSpotify);

// Calls the Spotify account sign-in page and redirects user to the playlist creation page
function authorizeSpotify() {
    const authEndpoint = 'https://accounts.spotify.com/authorize';
    const scope = 'playlist-modify-public playlist-modify-private';
    console.log("redirectUri: " + redirectUri);
    window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=token&show_dialog=true`;
}

// Gets the AccessToken (recieved after logging-in) upon refreshing the page
function getAccessToken() {
    if (window.location.hash) {
        const hash = window.location.hash.substring(1).split('&').reduce((acc, item) => {
            const parts = item.split('=');
            acc[parts[0]] = decodeURIComponent(parts[1]);
            return acc;
        }, {});
        accessToken = hash.access_token;

        window.history.pushState('', document.title, window.location.pathname);
    }
}

// Get access token from URL on page load
getAccessToken();
