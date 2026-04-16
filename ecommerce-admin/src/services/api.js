import axios from "axios";


// this is an axios library to create http and https requests
//(Base URL: is the base of every request.) and headers is used to tell the server the type of the request(in this case json)
const API = axios.create({
    baseURL: 'http://localhost:5147/api',
    headers:{
        "Content-Type":'application/json',
    },
});

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

export default API;