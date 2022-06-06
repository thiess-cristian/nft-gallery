import Axios from 'axios'

// export const BASE_URL = 'https://bf.dallemini.ai/'
export const BASE_URL = 'http://localhost:3000/'

const api = Axios.create({
  baseURL: BASE_URL,
})

export type DalleResponse = {
  images: string[]
  version: string
}

export const askDalleMini = async (prompt: string): Promise<DalleResponse> => {
  // const { status, data } = await api.post<DalleResponse>('generate', { prompt })
  const { status, data } = await api.get<DalleResponse>('generate')
  console.log('[DALLE::askDalleMini]', status)
  return data
}
