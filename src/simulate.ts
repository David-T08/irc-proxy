import axios, { isCancel, AxiosError } from 'axios';

// Create an Axios instance with the base URL
const client = axios.create({
    baseURL: "https://irc-proxy.beenman.com",
    timeout: 5000, // optional timeout

    headers: {
        ["X-Auth-Token"]: "XAE12"
    }
});

// Function to connect to IRC through the proxy
async function connectToIRC(host: string, port: number, secure: boolean) {
    try {
        // Make a GET request to the /connect endpoint with query parameters
        const response = await client.get('/connect', {
            params: {
                host: host,
                port: port,
                secure: secure,
            }
        });

        // Log success or handle response
        console.log('Connection successful:', response.data);

        return response.data; // return response if needed
    } catch (error) {
        // Handle errors
        if (axios.isAxiosError(error)) {
            // Axios-specific error handling
            console.error('Axios error occurred:', error.message);
            if (error.response) {
                // The server responded with a status code out of 2xx range
                console.error('Error data:', error.response.data);
                console.error('Error status:', error.response.status);
            } else if (error.request) {
                // No response was received after the request was made
                console.error('No response received:', error.request);
            }
        } else {
            // Handle non-Axios errors
            console.error('An unexpected error occurred:', error);
        }
    }
}

async function getStatus() {
    try {
        // Make a GET request to the /connect endpoint with query parameters
        const response = await client.get('/status');

        return response.data; // return response if needed
    } catch (error) {
        // Handle errors
        if (axios.isAxiosError(error)) {
            // Axios-specific error handling
            console.error('Axios error occurred:', error.message);
            if (error.response) {
                // The server responded with a status code out of 2xx range
                console.error('Error data:', error.response.data);
                console.error('Error status:', error.response.status);
            } else if (error.request) {
                // No response was received after the request was made
                console.error('No response received:', error.request);
            }
        } else {
            // Handle non-Axios errors
            console.error('An unexpected error occurred:', error);
        }
    }
}

// Example usage of the function
const run = async () => {
    const invalidStatus = await getStatus()
    console.log(invalidStatus)

    await connectToIRC('irc.beenman.com', 6697, true);
}

run()
