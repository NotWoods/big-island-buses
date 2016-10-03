# Big Island Buses

A web app created for bus riders in the Big Island of Hawai'i'. 
The app was created to offer an alternative the the county's [paper-only bus schdules](http://www.heleonbus.org/schedules-and-maps).
I built the [initial version](https://github.com/NotWoods/big-island-buses/tree/app-challenge) during my 11th grade in high school,
where it won [**Grade Prize in Congressional App Challenge 2014, Hawaii’s 2nd Congressional District**](http://gabbard.house.gov/index.php/press-releases/339-rep-tulsi-gabbard-presents-congressional-awards-to-young-leaders-from-hawai-i-s-second-district).

For my senior project, I redesigned the app and began to work directly with the County of Hawai'i'. 
The app was updated with an enhanced map interface along with server rendering. Since GitHub Pages only supports static websites, 
this version of the code is from before I added server rendering, but backports a couple features. You can see the source code for the 
final version in the [server-render](https://github.com/NotWoods/big-island-buses/tree/server-render) branch.

The app implements the AppCache API to allow it to run offline, 
and uses the JavaScript geolocation API to locate nearby bus stops and routes for the user.

The schedule data is located in a [seperate repository](https://github.com/NotWoods/hawaii-gtfs).
