import { toast } from 'react-toastify';
import axios from 'axios';

export const handleSuccess = (msg) => {
    toast.success(msg, {
        position: 'top-right'
    })
}

export const handleError = (msg) => {
    toast.error(msg, {
        position: 'top-right'
    })
}

export const APIUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a unified axios instance for the live backend
export const api = axios.create({
    baseURL: APIUrl
});
