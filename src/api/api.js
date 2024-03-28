import request from '@/utils/request'


export function getWearch(params) {
    return request({
        url: '/adminapi/get_weather_information',
        method: 'get',
        params
      })
  }