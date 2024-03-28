import axios from 'axios'


const instance = axios.create({
    baseURL: '', // 根路径
    timeout: 2000 
})

//axios前置拦截器
instance.interceptors.request.use(function (config) {
    return config;
}, function (error) {
    return Promise.reject(error);
});

//axios后置拦截器
instance.interceptors.response.use(function (response) {
    return response.data;
}, function (error) {
    return Promise.reject(error);
});

// 最终返回的对象
export default instance

