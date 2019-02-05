import axios from 'axios';

export const serverAPI = axios.create({
    baseURL: '/api'
});