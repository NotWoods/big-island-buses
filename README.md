# Big Island Buses

This program is written with HTML5, CSS, and JavaScript and can run in any modern browser.  It is used to serve the bus schedule to users, based on data from the [Hawai'i County Mass Transit Agency](http://heleonbus.org/).  It is an alternative to the pdf schedules avaliable there, which are not very useful on mobile devices.  

The program pulls all the schedule information from the `data.json` file.  This seperates the schedule from the program's logic, allowing me to update the schedule without having to update the entire program.  

The schedule can be found live at [tigeroakes.com/heleon](http://tigeroakes.com/heleon).

Despite using JavaScript, the code will recognize certain query variables, depending on the webpage being visited.  
```
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

route.js will look at the variables "name", "dir", and "time"
station.js will look at the variable "id"
```
As all the data is seperated from the logic of the program, it can easily be used by other software, such as an Android native port of the program or a third-party implementation.  
