import api from './api';

export const contactService = {
  list: async () => (await api.get('/contacts')).data,
  create: async (payload) => (await api.post('/contacts', payload)).data,
  remove: async (contactId) => (await api.delete(`/contacts/${contactId}`)).data,
  update: async (contactId,payload) => (await api.put(`/contacts/${contactId}`, payload)).data,
};
