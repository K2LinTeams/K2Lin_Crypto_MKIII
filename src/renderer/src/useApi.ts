import { api, ApiService } from './apiAdapter'

export function useApi(): ApiService {
  return api
}
