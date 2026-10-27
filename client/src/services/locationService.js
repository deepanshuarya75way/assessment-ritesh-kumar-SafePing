import api from './api';

export const locationService = {
  list: async () => (await api.get('/locations')).data,
  create: async (payload) => (await api.post('/locations', payload)).data,
  remove: async (locationId) => (await api.delete(`/locations/${locationId}`)).data,
  checkArrival: async (payload) => (await api.post('/locations/check', payload)).data,
  update: async (locationId,payload) => (await api.put(`/location/${locationId}`,payload)).data,
};
