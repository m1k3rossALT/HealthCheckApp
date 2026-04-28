import { get } from './client';

export const getCategories = () => get('/api/v1/categories');

export const checkCategory = (name) =>
  get(`/api/v1/check/${encodeURIComponent(name)}`);

export const checkAll = () => get('/api/v1/check-all');