// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements c\an be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseUrl: (function () {
    let apiBaseUrl = "http://" + window.location.hostname + ':3000';
    return apiBaseUrl;
  })(),  
  websocketPath: '/socket.io',
  googleClientId: '',
  bingKey: '',
  geePlanetCollection: '',
  geoserver: '',  
  alertsBucket: ''
};
