import axios from "axios";

const instance = axios.create({
  baseURL: "https://spa-comments-backend.onrender.com/api",
  withCredentials: true,
  timeout: 35000,
});

export default instance;
