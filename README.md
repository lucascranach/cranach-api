API to retrieve data from the Lucas Cranach Archive
# Overview

* Response to every request is sent in JSON format. In case the API request results in an error, it is represented by an "error": {} key in the JSON response.
* The API only provides the GET method. Data changes are not possible via the API.
* The API calls will respond with appropriate HTTP status codes for all requests.

# API 

## All Items
Returns a list of all items

### Example
https://mivs02.gm.fh-koeln.de/


## Items paginated
Returns a list of the items paginated by the defined parameters.

https://mivs02.gm.fh-koeln.de/?from={{from}}&size={{size}}

### Example
https://mivs02.gm.fh-koeln.de/?from=100&size=10 


### Parameters
The `from` parameter defines the offset from the first result you want to fetch.

The `size` parameter allows you to configure the maximum amount of hits to be returned.


## Items filtered by ranges
Returns a list of items filtered by the specified range.  
For criteria that contain numeric values, an upper and lower limit can be specified for filtering.

https://mivs02.gm.fh-koeln.de/?{{filterfield}}:{{rangeparam}}=

### Example
https://mivs02.gm.fh-koeln.de/?dating_begin:gte=1920&dating_end:gte=1950


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
https://mivs02.gm.fh-koeln.de/?{{filterfield}}:{{equalparam}}={{filtervalue}}

### Example
https://mivs02.gm.fh-koeln.de/?entity_type:eq=PAINTING

### Paramters
The `filterfield` is used to define the field by which the data is to be filtered.

The `equalparam` is the operator to set equals or not equals  
Possible operators:
* `eq` = equals
* `neq` = not equals
* `diff` = differ - for wildcard search

The `filtervalue` is used to define the value by which the data is to be filtered.


### Serveral filter criteria
Several criteria can be passed for filtering.

https://mivs02.gm.fh-koeln.de/?dating_begin:gte=1900&entity_type:eq=PAINTING

### Multiple values
Several values can be specified for one filter criteria.
In this case, multiple values can be defined using a comma-separated list.

If searching by wildcard, only one value is possible.

https://mivs02.gm.fh-koeln.de/?entity_type:neq=PAINTING,GRAPHIC

## Items sorted by a certain field
Returns a list of items sorted by certain field ascending or descending.

https://mivs02.gm.fh-koeln.de/?sort_by={{sortfield}}.{{sortdirection}}

### Example
https://mivs02.gm.fh-koeln.de/?sort_by=dating_end.asc

### Parameters
The `sortfield` is used to define the field by which the items are to be sorted.

The items can be sorted ascending or descending.
The parameter `sortdirection` must be set accordingly.  
* `asc` = ascending order  
* `des` = descending order

## Show Development Data

To add all available fields to the result set use the `show_data_all=true` parameter within the query string.

### Example
https://mivs02.gm.fh-koeln.de/?size=20&show_data_all=true
