function getConfig(name, defaultValue=null) {
    // If inside a docker container, use window.ENV
    console.log('AQUIIII', window?.ENV);
    if( window.ENV !== undefined ) {
        return window.ENV[name] || defaultValue;
    }
    console.log('AQUIIII 2', process?.env);
    return process.env[name] || defaultValue;
}

export function getBackendUrl() {
    return getConfig('REACT_APP_BACKEND_URL');
}

export function getWorkerUrl() {
    return getConfig('REACT_APP_WORKER_URL');
}

export function getSQSUrl() {
    return getConfig('REACT_APP_SQS_URL');
}

export function getHoursCloseTicketsAuto() {
    return getConfig('REACT_APP_HOURS_CLOSE_TICKETS_AUTO');
}