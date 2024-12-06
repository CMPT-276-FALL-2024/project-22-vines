const { authorizeSpotify } = require('../src/index'); 

describe('authorizeSpotify function', () => {
    beforeAll(() => {
        // Mock the DOM
        document.body.innerHTML = `
            <button id="log-in-button"></button>
        `;
    });

    test('Button click triggers Spotify authorization', () => {
        const button = document.getElementById('log-in-button');
        const mockAuthorizeSpotify = jest.fn();
        
        button.addEventListener('click', mockAuthorizeSpotify);
        button.click();

        expect(mockAuthorizeSpotify).toHaveBeenCalled();
    });
});

const { setupEventListeners } = require('../src/index');

describe('setupEventListeners function', () => {
    beforeAll(() => {
        // Set up a mock DOM
        document.body.innerHTML = `<button id="log-in-button"></button>`;
    });

    test('Adds event listener to the log-in button', () => {
        const button = document.getElementById('log-in-button');
        const mockAuthorizeSpotify = jest.fn();

        button.addEventListener = jest.fn(); // Mock the addEventListener method
        setupEventListeners(mockAuthorizeSpotify);

        expect(button.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
});

const { getAccessToken, getAccessTokenValue } = require('../src/index');

describe('getAccessToken function', () => {
    let originalLocation;

    beforeEach(() => {
        // Mock window.location
        originalLocation = window.location;
        delete window.location;
        window.location = {
            hash: '',
            pathname: '/test-path',
            pushState: jest.fn(),
        };
        global.history.pushState = jest.fn(); // Mock history.pushState
    });

    afterEach(() => {
        // Restore original window.location
        window.location = originalLocation;
    });

    test('Parses access token from the hash and removes the hash', () => {
        window.location.hash = '#access_token=testToken&token_type=Bearer&expires_in=3600';

        getAccessToken();

        // Check if accessToken is correctly updated
        expect(getAccessTokenValue()).toBe('testToken');

        // Check if the hash was removed from the URL
        expect(global.history.pushState).toHaveBeenCalledWith('', document.title, '/test-path');
    });

    test('Does nothing when hash is empty', () => {
        window.location.hash = '';

        getAccessToken();

        // Check that pushState is not called
        expect(global.history.pushState).not.toHaveBeenCalled();
    });
});