(function () {
  'use strict';

  var pathPrefix = "/big-island-buses/";

  const toInt = (n) => Number.parseInt(n, 10);

  var Type;
  (function (Type) {
      Type[Type["ROUTE"] = 0] = "ROUTE";
      Type[Type["STOP"] = 1] = "STOP";
      Type[Type["TRIP"] = 2] = "TRIP";
  })(Type || (Type = {}));
  /**
   * Generates a link for href values. Meant to maintain whatever active data is avaliable.
   * @param {Type} type  		Type of item to change
   * @param {string} value 	ID to change
   * @return {string} URL to use for href, based on active object.
   */
  function createLink(type, value, state) {
      let url = pathPrefix;
      switch (type) {
          case Type.ROUTE:
              url += `routes/${value}/`;
              if (state.Route.TRIP != null) {
                  url += state.Route.TRIP;
              }
              if (state.STOP != null) {
                  url += `?stop=${state.STOP}`;
              }
              break;
          case Type.STOP:
              return `?stop=${value}`;
          case Type.TRIP:
              url += `routes/${state.Route.ID}/${value}`;
              if (state.STOP != null) {
                  url += `?stop=${state.STOP}`;
              }
              break;
          default:
              console.warn('Invalid type provided for link: %i', type);
              break;
      }
      return url;
  }
  /**
   * Slices off the fragment from the string and returns the result.
   * Null is returned if the fragment does not exist in the string.
   * @param str Full string
   * @param fragment Part to slice off
   */
  function sliceOff(str, fragment) {
      const idx = str.indexOf(fragment);
      if (idx > -1) {
          return str.substring(idx + fragment.length);
      }
      else {
          return null;
      }
  }
  /**
   * Group 1: Route name
   * Group 2: Trip name
   */
  const LINK_FORMAT = new RegExp(pathPrefix + 'routes/([\\w-]+)/(\\w+)?');
  /**
   * Parse a link. Handles the current /route/<name>/<trip> format and
   * the older query parameters in hash syntax.
   * Returns the corresponding state object.
   */
  function parseLink(url) {
      var _a;
      const query = sliceOff(url.hash, '#!') || ((_a = sliceOff(url.search, '_escaped_fragment_')) === null || _a === void 0 ? void 0 : _a.replace(/%26/g, '&'));
      if (query) {
          const params = new URLSearchParams(query);
          return {
              Route: {
                  ID: params.get('route'),
                  TRIP: params.get('trip'),
              },
              STOP: params.get('stop'),
          };
      }
      const path = url.pathname.match(LINK_FORMAT);
      const stop = url.searchParams.get('stop');
      if (path) {
          const [, route, trip = null] = path;
          return {
              Route: {
                  ID: route,
                  TRIP: trip,
              },
              STOP: stop,
          };
      }
      else {
          return {
              Route: {
                  ID: null,
                  TRIP: null,
              },
              STOP: stop,
          };
      }
  }

  /**
   * Contains construstors and helper functions.  Avoids using the DOM for functions.
   * @author       Tiger Oakes <tigeroakes@gmail.com>
   * @copyright    2014 Tiger Oakes
   */
  var _a;
  var View;
  (function (View) {
      View[View["LIST"] = 0] = "LIST";
      View[View["MAP_PRIMARY"] = 1] = "MAP_PRIMARY";
      View[View["STREET_PRIMARY"] = 2] = "STREET_PRIMARY";
  })(View || (View = {}));
  let Active = {
      Route: {
          ID: null,
          TRIP: null,
      },
      STOP: null,
      View: {
          ROUTE: View.LIST,
          STOP: View.MAP_PRIMARY,
      },
  };
  const updateEvent = new CustomEvent('pageupdate');
  (_a = navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.register(pathPrefix + 'service-worker.js');
  /**
   * @type {Record<Type, Function>}
   */
  const openCallbacks = {};
  const normal = {
      url: 'assets/pins.png',
      size: { height: 26, width: 24 },
      scaledSize: { height: 26, width: 120 },
      origin: { x: 0, y: 0 },
      anchor: { x: 12, y: 12 },
  }, unimportant = {
      url: 'assets/pins.png',
      size: { height: 26, width: 24 },
      scaledSize: { height: 26, width: 120 },
      origin: { x: 96, y: 0 },
      anchor: { x: 12, y: 12 },
  }, userShape = {
      url: 'assets/pins.png',
      size: { height: 26, width: 24 },
      scaledSize: { height: 26, width: 120 },
      origin: { x: 48, y: 0 },
      anchor: { x: 12, y: 12 },
  }, placeShape = {
      url: 'assets/pins.png',
      size: { height: 26, width: 24 },
      scaledSize: { height: 26, width: 120 },
      origin: { x: 72, y: 0 },
      anchor: { x: 12, y: 23 },
  }, stopShape = {
      url: 'assets/pins.png',
      size: { height: 26, width: 24 },
      scaledSize: { height: 26, width: 120 },
      origin: { x: 24, y: 0 },
      anchor: { x: 12, y: 20 },
  };
  function setActiveState(newState) {
      Active = newState;
  }
  /**
   * Grabs the API data and parses it into a GTFSData object for the rest of the program.
   */
  function getScheduleData() {
      return fetch(pathPrefix + 'api.json')
          .then(res => {
          if (res.ok)
              return res.json();
          throw new Error(res.statusText);
      })
          .then(json => json);
  }
  function createElement(type, props) {
      return Object.assign(document.createElement(type), props);
  }
  function getCurrentPosition() {
      return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
      });
  }
  function locateUser(busPromise, customLocation) {
      let locatePromise;
      if (customLocation) {
          locatePromise = Promise.resolve({
              coords: customLocation,
              customLocationFlag: true,
          });
      }
      else {
          locatePromise = getCurrentPosition();
      }
      let closestDistance = Number.MAX_VALUE;
      let closestStop;
      return Promise.all([locatePromise, busPromise]).then(([e, schedule]) => {
          const userPos = e.coords;
          for (const stop_id of Object.keys(schedule.stops)) {
              const stop = schedule.stops[stop_id];
              const distance = Math.sqrt(Math.pow(userPos.latitude - parseFloat(stop.stop_lat), 2) +
                  Math.pow(userPos.longitude - parseFloat(stop.stop_lon), 2));
              if (distance < closestDistance) {
                  closestStop = stop_id;
                  closestDistance = distance;
              }
          }
          if (closestStop) {
              const results = {
                  stop: closestStop,
                  location: userPos,
                  custom: e.customLocationFlag ? true : false,
              };
              return results;
          }
          else {
              throw new Error(JSON.stringify(userPos));
          }
      });
  }
  /**
   * Creates a promise version of the document load event
   * @return {Promise<DocumentReadyState>} resolves if document has loaded
   */
  function documentLoad() {
      if (document.readyState === 'interactive' ||
          document.readyState === 'complete') {
          return Promise.resolve(document.readyState);
      }
      return new Promise(resolve => {
          document.addEventListener('readystatechange', () => {
              if (document.readyState === 'interactive') {
                  resolve(document.readyState);
              }
          });
      });
  }
  /**
   * Generates a link for href values. Meant to maintain whatever active data is avaliable.
   * @param {Type} type  		Type of item to change
   * @param {string} value 	ID to change
   * @return {string} URL to use for href, based on active object.
   */
  function pageLink(type, value) {
      return createLink(type, value, Active);
  }
  /**
   * Converts an A element into an automatically updating link.
   * @param  {Type} type      What value to change in link
   * @param  {string} value   Value to use
   * @param  {boolean} update Wheter or not to listen for "pageupdate" event and update href
   * @return {Node}           A element with custom properties
   */
  function convertToLinkable(node, type, value, update) {
      Object.assign(node, { Type: type, Value: value, href: pageLink(type, value) });
      node.href = pageLink(type, value);
      node.addEventListener('click', clickEvent);
      if (update) {
          node.addEventListener('pageupdate', function () {
              node.href = pageLink(type, value);
          });
      }
      return node;
  }
  /**
   * Creates an A element with custom click events for links.  Can update itself.
   * @param  {Type} type      What value to change in link
   * @param  {string} value   Value to use
   * @param  {boolean} update Wheter or not to listen for "pageupdate" event and update href
   * @return {Node}           A element with custom properties
   */
  function dynamicLinkNode(type, value, update) {
      const node = document.createElement('a');
      return convertToLinkable(node, type, value, update);
  }
  /**
   * Navigate to the page described by the `Linkable`.
   */
  function openLinkable(link) {
      var _a;
      const state = Active;
      const val = link.Value;
      const newLink = pageLink(link.Type, val);
      const callback = openCallbacks[link.Type];
      switch (link.Type) {
          case Type.ROUTE:
              state.Route.ID = val;
              break;
          case Type.STOP:
              state.STOP = val;
              break;
          case Type.TRIP:
              state.Route.TRIP = val;
              break;
      }
      callback(val);
      history.pushState(state, null, newLink);
      (_a = ga) === null || _a === void 0 ? void 0 : _a('send', 'pageview', { page: newLink, title: document.title });
  }
  /**
   * Used for the click event of a dynamicLinkNode
   * @param  {Event} e
   */
  function clickEvent(e) {
      var _a, _b, _c, _d;
      (_b = (_a = e).preventDefault) === null || _b === void 0 ? void 0 : _b.call(_a);
      (_d = (_c = e).stopPropagation) === null || _d === void 0 ? void 0 : _d.call(_c);
      openLinkable(this);
      return false;
  }
  /**
   * Sorts stop time keys
   * @param {GTFSData stop_times} stopTimes
   * @return ordered list
   */
  function sequence(stopTimes) {
      const stopSequence = [];
      for (const key in stopTimes) {
          stopSequence.push(key);
      }
      return stopSequence.sort((a, b) => toInt(a) - toInt(b));
  }

  /**
   * Turns a date into a string with hours, minutes.
   * @param  {Date} 	date Date to convert
   * @param  {string} date 24hr string in format 12:00:00 to convert to string in 12hr format
   * @return {string}    	String representation of time
   */
  function stringTime(date) {
      if (typeof date === 'string') {
          if (date.indexOf(':') > -1 && date.lastIndexOf(':') > date.indexOf(':')) {
              const [hour, min, second] = date.split(':').map(toInt);
              date = new Date(0, 0, 0, hour, min, second, 0);
          }
      }
      if (typeof date != 'object') {
          throw new TypeError(`date must be Date or string, not ${typeof date}`);
      }
      let m = 'am';
      let displayHour = '';
      let displayMinute = '';
      const hr = date.getHours();
      const min = date.getMinutes();
      if (hr === 0) {
          displayHour = '12';
      }
      else if (hr === 12) {
          displayHour = '12';
          m = 'pm';
      }
      else if (hr > 12) {
          const mathHr = hr - 12;
          displayHour = mathHr.toString();
          m = 'pm';
      }
      else {
          displayHour = hr.toString();
      }
      if (min === 0) {
          displayMinute = '';
      }
      else if (min < 10) {
          displayMinute = ':0' + min.toString();
      }
      else {
          displayMinute = ':' + min.toString();
      }
      return displayHour + displayMinute + m;
  }
  /**
   * Returns a date object based on the string given
   * @param  {string} string in format 13:00:00, from gtfs data
   * @return {Date}
   */
  function gtfsArrivalToDate(string) {
      const [hour, min, second] = string.split(':').map(s => toInt(s));
      let extraDays = 0;
      let extraHours = 0;
      if (hour > 23) {
          extraDays = Math.floor(hour / 24);
          extraHours = hour % 24;
      }
      return new Date(0, 0, 0 + extraDays, hour + extraHours, min, second, 0);
  }
  /**
   * Combines stringTime() and gtfsArrivalToDate()
   * @param  {string} string in format 13:00:00, from gtfs data
   * @return {string}        String representation of time
   */
  function gtfsArrivalToString(string) {
      return stringTime(gtfsArrivalToDate(string));
  }
  /**
   * Returns the current time, with date stripped out
   * @return {Date} Current time in hour, min, seconds; other params set to 0
   */
  function nowDateTime() {
      const now = new Date();
      return new Date(0, 0, 0, now.getHours(), now.getMinutes(), now.getSeconds(), 0);
  }

  /**
   * Hydrate the pre-rendered sidebar HTML.
   */
  function hydrateAside() {
      const nearbyList = document.getElementById('nearby');
      const otherList = document.getElementById('other');
      const routeListItems = new Map();
      for (const child of otherList.children) {
          const listItem = child;
          const route_id = listItem.dataset.route;
          const link = listItem.querySelector('a.routes__link');
          convertToLinkable(link, Type.ROUTE, route_id, true);
          routeListItems.set(route_id, listItem);
      }
      return function onLocationChange(nearbyRoutes) {
          for (const [route_id, listItem] of routeListItems) {
              if (nearbyRoutes.has(route_id)) {
                  nearbyList.appendChild(listItem);
              }
              else {
                  otherList.appendChild(listItem);
              }
          }
      };
  }

  /**
   * Contains code to build UI. Interacts with DOM.
   * @author       Tiger Oakes <tigeroakes@gmail.com>
   * @copyright    2014 Tiger Oakes
   */
  let map;
  let streetview;
  let autocomplete;
  let boundsAllStops;
  let markers = [];
  let userMapMarker;
  let stopMarker;
  const documentPromise = documentLoad();
  const schedulePromise = getScheduleData();
  const locatePromise = locateUser(schedulePromise);
  let placeMapMarker;
  try {
      loadMap();
  }
  catch (err) {
      console.error(err);
      locatePromise.then(function (position) {
          if (!Active.STOP)
              openStop(position.stop);
      });
  }
  function stopToPos(stop) {
      return new google.maps.LatLng(parseFloat(stop.stop_lat), parseFloat(stop.stop_lon));
  }
  function loadMap() {
      if (!navigator.onLine ||
          typeof google !== 'object' ||
          typeof google.maps !== 'object') {
          documentPromise.then(function () {
              document.body.classList.add('no-map');
          });
          throw new Error('Google Maps API has not loaded');
      }
      boundsAllStops = new google.maps.LatLngBounds();
      markers = [];
      function markersAndLatLng(schedule) {
          return Promise.resolve().then(() => {
              for (const stop of Object.values(schedule.stops)) {
                  const marker = new google.maps.Marker({
                      position: stopToPos(stop),
                      title: stop.stop_name,
                      icon: normal,
                  });
                  marker.Type = Type.STOP;
                  marker.Value = stop.stop_id;
                  marker.stop_id = stop.stop_id;
                  google.maps.event.addListener(marker, 'click', clickEvent);
                  boundsAllStops.extend(marker.getPosition());
                  markers.push(marker);
              }
              return {
                  markers: markers,
                  bounds: boundsAllStops,
              };
          });
      }
      function mapLoad() {
          return Promise.resolve().then(() => {
              const mapElement = Active.View.STOP === View.MAP_PRIMARY
                  ? document.getElementById('map-canvas')
                  : document.getElementById('streetview-canvas');
              const panoElement = Active.View.STOP === View.STREET_PRIMARY
                  ? document.getElementById('map-canvas')
                  : document.getElementById('streetview-canvas');
              map = new google.maps.Map(mapElement, {
                  center: new google.maps.LatLng(19.6, -155.56),
                  zoom: 10,
                  mapTypeControlOptions: {
                      position: google.maps.ControlPosition.TOP_CENTER,
                  },
                  panControlOptions: {
                      position: google.maps.ControlPosition.RIGHT_TOP,
                  },
                  streetViewControlOptions: {
                      position: google.maps.ControlPosition.RIGHT_TOP,
                  },
                  zoomControlOptions: {
                      position: google.maps.ControlPosition.RIGHT_TOP,
                  },
              });
              streetview = new google.maps.StreetViewPanorama(panoElement, {
                  position: new google.maps.LatLng(19.723835, -155.084741),
                  visible: true,
                  pov: { heading: 34, pitch: 0 },
                  scrollwheel: false,
                  panControlOptions: {
                      position: google.maps.ControlPosition.RIGHT_CENTER,
                  },
                  zoomControlOptions: {
                      style: google.maps.ZoomControlStyle.SMALL,
                      position: google.maps.ControlPosition.RIGHT_CENTER,
                  },
                  addressControl: false,
              });
              map.setStreetView(streetview);
              autocomplete = new google.maps.places.Autocomplete(document.getElementById('search'));
              autocomplete.bindTo('bounds', map);
              google.maps.event.addListener(autocomplete, 'place_changed', function () {
                  const place = autocomplete.getPlace();
                  if (!place.geometry)
                      return;
                  const loc = place.geometry.location;
                  console.log('Lat %s, Lon %s', loc.lat(), loc.lng());
                  locateUser(schedulePromise, {
                      latitude: loc.lat(),
                      longitude: loc.lng(),
                  }).then(position => {
                      if (!placeMapMarker) {
                          placeMapMarker = new google.maps.Marker({
                              position: new google.maps.LatLng(position.location.latitude, position.location.longitude),
                              title: 'Search Location',
                              icon: placeShape,
                              map: map,
                              animation: google.maps.Animation.DROP,
                              zIndex: 1000,
                          });
                          placeMapMarker.Type = Type.STOP;
                          google.maps.event.addListener(placeMapMarker, 'click', clickEvent);
                      }
                      placeMapMarker.Value = position.stop;
                      openStop(position.stop);
                  });
              });
              return map;
          });
      }
      Promise.all([
          documentPromise.then(mapLoad),
          schedulePromise.then(markersAndLatLng),
      ]).then(function ([map, { markers, bounds }]) {
          map.setCenter(bounds.getCenter());
          map.fitBounds(bounds);
          google.maps.event.addListener(map, 'bounds_changed', function () {
              const mapBounds = map.getBounds();
              for (const marker of markers) {
                  if (mapBounds.contains(marker.getPosition())) {
                      if (marker.getMap() !== map)
                          marker.setMap(map);
                  }
                  else {
                      marker.setMap(null);
                  }
              }
          });
          markers.forEach(marker => marker.setMap(map));
          locatePromise.then(function (position) {
              userMapMarker = new google.maps.Marker({
                  position: new google.maps.LatLng(position.location.latitude, position.location.longitude),
                  title: position.custom ? 'Location of Place' : 'My Location',
                  icon: position.custom ? placeShape : userShape,
                  map: map,
                  animation: google.maps.Animation.DROP,
                  zIndex: 1000,
              });
              userMapMarker.Type = Type.STOP;
              userMapMarker.Value = position.stop;
              google.maps.event.addListener(userMapMarker, 'click', clickEvent);
              if (!Active.STOP)
                  openStop(position.stop);
              window.addEventListener('locationupdate', (evt) => {
                  const { custom, location } = evt.detail;
                  userMapMarker.setIcon(custom ? placeShape : userShape);
                  userMapMarker.setPosition(new google.maps.LatLng(location.latitude, location.longitude));
              });
          });
      });
      window.addEventListener('resize', function () {
          google.maps.event.trigger(map, 'resize');
          google.maps.event.trigger(streetview, 'resize');
          if (!Active.Route.ID) {
              map.setCenter(boundsAllStops.getCenter());
              map.fitBounds(boundsAllStops);
          }
      });
  }
  Promise.all([documentPromise.then(hydrateAside), schedulePromise, locatePromise]).then(([onLocationChange, schedule, locationResult]) => {
      onLocationChange(new Set(schedule.stops[locationResult.stop].routes));
  });
  documentPromise.then(function () {
      uiEvents();
  });
  function openActive(state) {
      console.log(state);
      let routePromise;
      if (state.Route.ID) {
          routePromise = openRoute(state.Route.ID).then(bestTrip => openTrip(state.Route.TRIP ? state.Route.TRIP : bestTrip));
      }
      return Promise.all([
          routePromise,
          state.STOP ? openStop(state.STOP) : undefined,
      ]).then(() => { });
  }
  Promise.all([documentPromise, schedulePromise]).then(function () {
      if (window.history.state) {
          setActiveState(window.history.state);
      }
      else {
          const state = parseLink(new URL(location.href));
          state.View = Active.View;
          setActiveState(state);
      }
      openActive(Active);
  });
  window.onhashchange = function () {
      const state = parseLink(new URL(location.href));
      state.View = Active.View;
      setActiveState(state);
      openActive(Active);
  };
  window.onpopstate = function (e) {
      setActiveState(e.state);
      openActive(Active);
  };
  /**
   * Adds click events to buttons in the site.
   */
  function uiEvents() {
      if (!navigator.onLine) {
          document.getElementById('main').classList.add('offline');
      }
      document
          .getElementById('map-toggle')
          .addEventListener('click', switchMapStreetview);
      const select = document.getElementById('trip-select');
      select.Type = Type.TRIP;
      select.addEventListener('change', function (e) {
          select.Value = select.options[select.selectedIndex].value;
          clickEvent.call(select, e);
      });
      function toggleSidebar() {
          document.getElementById('aside').classList.toggle('open');
      }
      document
          .getElementById('screen-cover')
          .addEventListener('click', toggleSidebar);
      document.getElementById('menu').addEventListener('click', toggleSidebar);
      document.getElementById('alt-menu').addEventListener('click', toggleSidebar);
  }
  function removeChildren(parent) {
      while (parent.firstChild)
          parent.removeChild(parent.firstChild);
  }
  /**
   * Swaps map and streetview divs
   * @return {[type]} [description]
   */
  function switchMapStreetview() {
      if (!map || !streetview) {
          console.error('Map and StreetViewPanorama have not loaded');
          throw new TypeError();
      }
      const mapParent = document.getElementById('map');
      const panoParent = document.getElementById('streetview-header');
      if (Active.View.STOP === View.MAP_PRIMARY) {
          mapParent.insertBefore(document.getElementById('streetview-canvas'), mapParent.firstChild);
          panoParent.insertBefore(document.getElementById('map-canvas'), mapParent.firstChild);
          this.classList.add('on');
          Active.View.STOP = View.STREET_PRIMARY;
      }
      else if (Active.View.STOP === View.STREET_PRIMARY) {
          mapParent.insertBefore(document.getElementById('map-canvas'), mapParent.firstChild);
          panoParent.insertBefore(document.getElementById('streetview-canvas'), mapParent.firstChild);
          this.classList.remove('on');
          Active.View.STOP = View.MAP_PRIMARY;
      }
      dispatchEvent(updateEvent);
  }
  /**
   * Creates a route UI and opens the section if the map is currently in fullscreen mode.
   * @param  {string} route_id ID of the route
   * @return {Promise<string>} trip_id that can be used in openTrip. Best matches time and open stop, if any.
   * @throws {string} If the ID does not exist
   */
  function openRoute(route_id) {
      return schedulePromise.then(buses => {
          const thisRoute = buses.routes[route_id];
          if (!thisRoute || !thisRoute.route_id) {
              console.error('Invalid Route %s', route_id);
              //throw route_id;
              return;
          }
          Active.Route.ID = route_id;
          Active.Route.TRIP = null;
          document.title = `${thisRoute.route_long_name} | Big Island Buses`;
          document.body.style.setProperty('--route-color', `#${thisRoute.route_color}`);
          document.body.style.setProperty('--route-text-color', `#${thisRoute.route_text_color}`);
          const name = document.getElementById('route_long_name');
          name.textContent = thisRoute.route_long_name;
          let firstStop;
          let lastStop;
          let largest = 0;
          let earliest = new Date(0, 0, 0, 23, 59, 59, 0);
          let latest = new Date(0, 0, 0, 0, 0, 0, 0);
          let earliestTrip;
          let earliestTripStop;
          const nowTime = nowDateTime();
          let closestTrip;
          let closestTripTime = Number.MAX_VALUE;
          let closestTripStop;
          const select = document.getElementById('trip-select');
          removeChildren(select);
          const routeStops = new Set();
          for (const trip_id of Object.keys(thisRoute.trips)) {
              const trip = thisRoute.trips[trip_id];
              for (const stop in trip.stop_times) {
                  if (stop == '1' && toInt(trip.direction_id) === 0) {
                      firstStop = trip.stop_times[stop].stop_id;
                  }
                  else {
                      if (toInt(stop) > largest && toInt(trip.direction_id) === 0) {
                          largest = toInt(stop);
                          lastStop = trip.stop_times[stop].stop_id;
                      }
                  }
                  routeStops.add(trip.stop_times[stop].stop_id);
                  const timeDate = gtfsArrivalToDate(trip.stop_times[stop].arrival_time);
                  if (timeDate > latest) {
                      latest = timeDate;
                  }
                  if (timeDate < earliest) {
                      earliest = timeDate;
                      earliestTrip = trip.trip_id;
                      earliestTripStop = trip.stop_times[stop].stop_id;
                  }
                  if (timeDate.getTime() - nowTime.getTime() < closestTripTime &&
                      timeDate.getTime() - nowTime.getTime() > 0) {
                      closestTripTime = timeDate.getTime() - nowTime.getTime();
                      closestTrip = trip.trip_id;
                      closestTripStop = trip.stop_times[stop].stop_id;
                  }
              }
              if (!closestTrip) {
                  //Too late for all bus routes
                  closestTripTime =
                      new Date(0, 0, 1, earliest.getHours(), earliest.getMinutes(), earliest.getSeconds(), 0).getTime() - nowTime.getTime();
                  closestTrip = earliestTrip;
                  closestTripStop = earliestTripStop;
              }
              const option = createElement('option', {
                  value: trip.trip_id,
                  textContent: trip.trip_short_name,
              });
              select.appendChild(option);
          }
          const minString = Math.floor(closestTripTime / 60000) != 1
              ? Math.floor(closestTripTime / 60000) + ' minutes'
              : '1 minute';
          document.getElementById('place-value').textContent =
              'Between ' +
                  buses.stops[firstStop].stop_name +
                  ' - ' +
                  buses.stops[lastStop].stop_name;
          document.getElementById('time-value').textContent =
              stringTime(earliest) + ' - ' + stringTime(latest);
          document.getElementById('next-stop-value').textContent =
              'Reaches ' +
                  buses.stops[closestTripStop].stop_name +
                  ' in ' +
                  minString;
          document.getElementById('main').classList.add('open');
          if (navigator.onLine &&
              typeof google === 'object' &&
              typeof google.maps === 'object') {
              const routeBounds = new google.maps.LatLngBounds();
              for (const marker of markers) {
                  if (routeStops.has(marker.stop_id)) {
                      marker.setIcon(normal);
                      marker.setZIndex(200);
                      marker.activeInRoute = true;
                      routeBounds.extend(marker.getPosition());
                  }
                  else {
                      marker.setIcon(unimportant);
                      marker.setZIndex(null);
                      marker.activeInRoute = false;
                  }
              }
              if (stopMarker) {
                  stopMarker.setIcon(stopShape);
                  stopMarker.setZIndex(300);
              }
              google.maps.event.trigger(map, 'resize');
              map.setCenter(routeBounds.getCenter());
              map.fitBounds(routeBounds);
              google.maps.event.trigger(streetview, 'resize');
          }
          window.dispatchEvent(updateEvent);
          openTrip(closestTrip);
          return closestTrip;
      });
  }
  /**
   * Creates a Stop fragment in the #stop element
   * @param  {[type]} stop_id Id of the stop to use
   * @return {void}           Creates an element
   */
  function openStop(stop_id) {
      return schedulePromise.then(buses => {
          const thisStop = buses.stops[stop_id];
          if (!thisStop || !thisStop.stop_id) {
              console.error('Invalid Stop %s', stop_id);
              //throw stop_id;
              return;
          }
          Active.STOP = stop_id;
          if (streetview) {
              streetview.setPosition(stopToPos(thisStop));
          }
          if (map) {
              for (const marker of markers) {
                  if (marker.activeInRoute || Active.Route.ID == null) {
                      marker.setIcon(normal);
                  }
                  else {
                      marker.setIcon(unimportant);
                  }
                  if (marker.stop_id === thisStop.stop_id) {
                      stopMarker = marker;
                  }
              }
              stopMarker.setIcon(stopShape);
              stopMarker.setZIndex(300);
              streetview.setPosition(stopMarker.getPosition());
              google.maps.event.trigger(streetview, 'resize');
              google.maps.event.addListener(streetview, 'pano_changed', function () {
                  document.getElementById('address').textContent = streetview.getLocation().description;
                  streetview.setPov(streetview.getPhotographerPov());
              });
          }
          if (!streetview) {
              document.getElementById('stop').classList.add('no-streetview');
          }
          document.getElementById('stop_name').textContent = thisStop.stop_name;
          const list = document.getElementById('connections');
          removeChildren(list);
          for (const route_id of thisStop.routes) {
              const route = buses.routes[route_id];
              const linkItem = dynamicLinkNode(Type.ROUTE, route_id, false);
              linkItem.className = 'connections__link';
              linkItem.style.borderColor = `#${route.route_color}`;
              linkItem.textContent = route.route_long_name;
              const listItem = document.createElement('li');
              listItem.className = 'connections__item';
              listItem.append(linkItem);
              if (Active.Route.ID === route_id) {
                  listItem.classList.add('connections__item--active-route');
              }
              list.append(listItem);
          }
          document.getElementById('main').classList.add('open-stop');
          window.dispatchEvent(updateEvent);
      });
  }
  function openTrip(trip_id) {
      return schedulePromise.then(buses => {
          const route = buses.routes[Active.Route.ID];
          if (!route) {
              console.error('Invalid Route %s', Active.Route.ID);
              return;
          }
          const trip = route.trips[trip_id];
          if (!trip || !trip.trip_id) {
              console.error('Invalid trip %s in route %s', trip_id, Active.Route.ID);
              return;
          }
          Active.Route.TRIP = trip_id;
          const schedule = document.getElementById('schedule');
          removeChildren(schedule);
          const stopSequence = sequence(trip.stop_times);
          const select = document.getElementById('trip-select');
          for (let option = 0; option < select.options.length; option++) {
              if (select.options[option].value === trip_id) {
                  select.selectedIndex = option;
                  select.options[option].selected = true;
                  break;
              }
          }
          document.getElementById('week-days-value').textContent =
              buses.calendar[trip.service_id].text_name;
          for (const sequence of stopSequence) {
              const tripStop = trip.stop_times[sequence];
              const routeListItem = dynamicLinkNode(Type.STOP, tripStop.stop_id);
              routeListItem.className = 'schedule__stop';
              const lines = createElement('div', { className: 'lines' });
              for (let j = 0; j < 2; j++) {
                  const line = createElement('span', { className: 'line' });
                  lines.appendChild(line);
              }
              routeListItem.appendChild(lines);
              const name = createElement('span', {
                  className: 'schedule__stopname name',
                  textContent: buses.stops[tripStop.stop_id].stop_name,
              });
              routeListItem.appendChild(name);
              const time = createElement('time', {
                  className: 'schedule__time',
                  textContent: gtfsArrivalToString(tripStop.arrival_time),
              });
              routeListItem.appendChild(time);
              const connection = createElement('div', {
                  className: 'connections',
              });
              for (const connectRoute of buses.stops[tripStop.stop_id].routes) {
                  if (connectRoute === Active.Route.ID) {
                      continue;
                  }
                  const item = createElement('span', {
                      className: 'route-dash',
                      title: buses.routes[connectRoute].route_long_name,
                  });
                  item.style.backgroundColor = buses.routes[connectRoute].route_color;
                  connection.appendChild(item);
              }
              routeListItem.appendChild(connection);
              schedule.appendChild(routeListItem);
          }
          window.dispatchEvent(updateEvent);
      });
  }
  openCallbacks[Type.ROUTE] = openRoute;
  openCallbacks[Type.STOP] = openStop;
  openCallbacks[Type.TRIP] = openTrip;

}());
//# sourceMappingURL=main.js.map
