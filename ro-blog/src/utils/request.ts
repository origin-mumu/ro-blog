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
    return result.data
  },
  (err) => {
    return Promise.reject(new Error(err.response?.data?.message || '网络错误'))
  },
)

export default instance