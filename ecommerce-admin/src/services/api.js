import axios from "axios";


// this is an axios library to create http and https requests
//(Base URL: is the base of every request.) and headers is used to tell the server the type of the request(in this case json)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5147';

export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
};

const API = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers:{
        "Content-Type":'application/json',
    },
    timeout: 30000,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
    if (!error.response) return true;
    const status = error.response.status;
    return status === 502 || status === 503 || status === 504;
};

//interCeptors runs before every request ! checks if a token exists in the browsers storage , if yes adds authorization : Bearer in front of it ! 
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error)=>Promise.reject(error)
);

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        if (config && isRetryableError(error)) {
            config.__retryCount = (config.__retryCount || 0) + 1;
            if (config.__retryCount <= 2) {
                await sleep(4000 * config.__retryCount);
                return API(config);
            }
        }

        if (error.response?.status === 401) {
            const hadToken = localStorage.getItem('token');
            if (hadToken) {
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default API;