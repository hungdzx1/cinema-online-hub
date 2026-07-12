import { fetchApi } from './api';

export const authApi = {
  /**
   * POST /auth/login
   * @param {{ email: string, password: string }} credentials
   * @returns {{ message, accessToken, user: { id, username, email, role, avatarUrl } }}
   */
  login: (credentials) =>
    fetchApi('/auth/login', { method: 'POST', data: credentials }),

  /**
   * POST /auth/register
   * @param {{ username: string, email: string, password: string }} data
   */
  register: (data) =>
    fetchApi('/auth/register', { method: 'POST', data }),
};
