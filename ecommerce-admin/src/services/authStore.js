let session = {
  token: null,
  admin: null,
};

export function setAdminSession(token, admin) {
  session = { token, admin };
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
}

export function getAuthToken() {
  return session.token;
}

export function getAdmin() {
  return session.admin;
}

export function updateAdmin(updates) {
  if (session.admin) {
    session.admin = { ...session.admin, ...updates };
  }
}

export function clearAdminSession() {
  session = { token: null, admin: null };
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
}

export function hasAdminSession() {
  return Boolean(session.token && session.admin);
}
