function getConfig(name, defaultValue = null) {
  // If inside a docker container, use window.ENV
  if (window.ENV !== undefined) {
    return window.ENV[name] || defaultValue;
  }

  return import.meta.env[name] || defaultValue;
}

export function getBackendUrl() {
  return getConfig("VITE_BACKEND_URL");
}

export function getHoursCloseTicketsAuto() {
  return getConfig("VITE_HOURS_CLOSE_TICKETS_AUTO");
}
