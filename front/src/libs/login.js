import { axiosInstance, setAuthHeader } from './axios';

// Function to handle user login
export const login = async (tgId) => {
    try {
        const response = await axiosInstance.post('/init', {tgId}); // Adjust to your login endpoint
        const { token } = response.data; // Assume the token is in the response data

        // Store the token in localStorage
        localStorage.setItem('authToken', token);

        // Set the authorization header
        setAuthHeader(token);
        
        // Continue with your app logic (e.g., redirecting, updating state)
    } catch (error) {
        console.error('Login error:', error);
        // Handle login error (e.g., show an error message)
    }
};