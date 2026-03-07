import axios from 'axios'

const baseURL = '/api'
const instance = axios.create({ baseURL })

instance.interceptors.request.use(
  (config) => {
    return config
  },
  (err) => {
    return Promise.reject(err)
  },
)

instance.interceptors.response.use(
  (result) => {
    // 直接返回响应数据，不再检查success字段
    return result.data
  },
  (err) => {
    // 网络错误或服务器错误
    return Promise.reject(new Error(err.response?.data?.message || '网络错误'))
  },
)

export default instance