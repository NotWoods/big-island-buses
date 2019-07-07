# Server rendering

Code to be run by a build task, which generates HTML and JSON files that can be
statically served later.

## api

Generates JSON files containing schedule data. These files serve as the REST API
that is queried by the client later.

## pages

Pre-renders HTML pages for the site. Each schedule gets its own page.
