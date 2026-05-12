export function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh');
}

export function redirectToLogin() {
  clearStoredAuth();
  window.location.href = '/';
}
