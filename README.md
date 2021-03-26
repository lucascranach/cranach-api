# Overview
API to retrieve data from the Lucas Cranach Archive

* Response to every request is sent in JSON format. In case the API request results in an error, it is represented by an "error": {} key in the JSON response.
* The API only provides the GET method. Data changes are not possible via the API.
* The API calls will respond with appropriate HTTP status codes for all requests.

# API 

## All Items
Returns a list of all items

### Example
http://mivs02.gm.fh-koeln.de:8080/


## Items paginated
Returns a list of the items paginated by the defined parameters.

http://mivs02.gm.fh-koeln.de:8080/?from={{from}}&size={{size}}

### Example
http://mivs02.gm.fh-koeln.de:8080/?from=100&size=10 




### Parameters
The `from` parameter defines the offset from the first result you want to fetch.

The `size` parameter allows you to configure the maximum amount of hits to be returned.


## Items filtered by ranges
Returns a list of items filtered by the specified range.  
For criteria that contain numeric values, an upper and lower limit can be specified for filtering.

http://mivs02.gm.fh-koeln.de:8080/?{{filterfield}}:{{rangeparam}}=

### Example
http://localhost:8080/?dating_begin:gte=1920&dating_begin:lte=1950


### Paramters
The `filterfield` is used to define the field by which the data is to be filtered.

The `rangeparam` is the operator to define the range.
Possible values:
* `gt` = greater then
* `gte` = greater then or equals
* `lt` = lower then
* `lte` = lower then or equals

The `filtervalue` is used to define the value for the upper or lower limit.


## Items filtered by value
http://localhost:8080/?{{filterfield}}:{{equalparam}}={{filtervalue}}

### Example
http://localhost:8080/?entity_type:eq=PAINTING

### Paramters
The `filterfield` is used to define the field by which the data is to be filtered.

The `equalparam` is the operator to set equals or not equals
Possible operators:
* `eq` = equals
* `neq` = not equals

The `filtervalue` is used to define the value by which the article data is to be filtered.


### Serveral filter criteria
Several criteria can be passed for filtering.

http://localhost:8080/?dating_begin:gte=1900&entity_type:eq=PAINTING

### Multiple values
Several values can be specified for one filter criteria.
In this case, multiple values can be defined using a comma-separated list.

http://localhost:8080/?entity_type:neq=PAINTING,GRAPHIC
