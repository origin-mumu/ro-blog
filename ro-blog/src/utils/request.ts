import axios from 'axios'

const baseURL = '/api'
const instance = axios.create({ baseURL })

instance.interceptors.request.use(
  (config) => {
    if (typeof localStorage !== 'undefined') {
      let id = localStorage.getItem('ro_ai_client_id')
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem('ro_ai_client_id', id)
      }
      config.headers = config.headers ?? {}
      ;(config.headers as Record<string, string>)['X-Client-Id'] = id
    }
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