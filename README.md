<img src="./src/site/icon/transparent.png" alt="" width="128" height="128">

# Big Island Buses

> _Go Green. Go Hele-On. Go Online!_
>
> Stop fumbling with paper schedules and never miss the Hawaii bus again! Use
> Big Island Buses, an app created in partnership with Hele-On. Find bus stops
> near you, see live GPS locations of buses, and look for the schedules from the
> comfort of your phone or computer.

A web app created for bus riders in the Big Island of Hawai'i. The app was
created to offer an alternative the the county's
[paper-only bus schedules](http://www.heleonbus.org/schedules-and-maps). I built
the
[initial version](https://github.com/NotWoods/big-island-buses/tree/app-challenge)
during my 11th grade in high school, where it won
[**Grade Prize in Congressional App Challenge 2014, Hawaii’s 2nd Congressional District**](http://gabbard.house.gov/index.php/press-releases/339-rep-tulsi-gabbard-presents-congressional-awards-to-young-leaders-from-hawai-i-s-second-district).

For my senior project, I redesigned the app and began to work directly with the
County of Hawai'i'. The app was updated with an enhanced map interface along
with server rendering. Since GitHub Pages only supports static websites, this
version of the code is from before I added server rendering, but backports a
couple features. You can see the source code for the final version in the
[server-render](https://github.com/NotWoods/big-island-buses/tree/server-render)
branch.

The program went on to be featured in
[West Hawaii Today](http://westhawaiitoday.com/news/local-news/hele-schedule-be-available-app),
[Hawaii Public Radio](http://www.bytemarkscafe.org/2015/04/29/episode-348-sounding-rockets-apr-29-2015/),
and [Hawaii](https://www.youtube.com/watch?v=MHPlJsosHDc)
[TechWorks](https://www.youtube.com/watch?v=yl_3d7PSKMY).

The app originally implemented the AppCache API to allow it to run offline. It
has since been moved to Service Workers, which became widely available some time
after the app was launched. It also uses the JavaScript geolocation API to
locate nearby bus stops and routes for the user.

The schedule data is located in a
[separate repository](https://github.com/NotWoods/hawaii-gtfs).

## Deployment

Currently deployment is manual until I can get Travis working properly.

```sh
npm ci
# Lint and build JS
npm run lint:check
npm run build
# Copy app-challenge branch into ./heleon
source checkout.sh
create_all_branches
mkdir -p heleon
git --work-tree=./heleon checkout app-challenge -- .
```

## Licensing

Copyright (c) 2015 Tiger Oakes All Rights Reserved
