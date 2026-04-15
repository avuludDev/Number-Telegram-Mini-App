import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://numbers-app.tech/api', // Adjust to your API base URL
});

// Set the authentication header for all requests
const setAuthHeader = (token) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
};

// Restore token from localStorage when the app starts
const token = localStorage.getItem('authToken');
setAuthHeader(token);

export { axiosInstance, setAuthHeader };
