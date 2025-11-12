export function isAuthenticated(): boolean {
  return localStorage.getItem("consoleblue_auth") === "true";
}

export function logout() {
  localStorage.removeItem("consoleblue_auth");
}
