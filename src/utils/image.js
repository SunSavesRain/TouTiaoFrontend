import { apiConfig } from '../config/api'

export const getImageUrl = image => {
  if (!image) return ''
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('blob:')) return image
  return `${apiConfig.baseURL}${image}`
}