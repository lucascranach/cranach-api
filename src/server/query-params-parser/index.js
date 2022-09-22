const {
  availableFilterTypes,
  availableSortTypes,
  defaultFilterType,
  defaultResponseSize,
  defautSortDirection,
  specialParams,
  getAllowedFilters,
  getSearchTermFields,
  getDefaultSortFields,
  getSortableFields,
} = require('../mappings');

const SortParam = require('../../entities/sortparam');
const FilterParam = require('../../entities/filterparam');

// TODO: Aufrufe in einer Middleware zusammen
function validateSearchTermParams(req) {
  const searchtermParam = req.query.searchterm;
  const resultSearchtermParams = [];

  if (!searchtermParam) {
    return;
  }

  const searchtermFieldss = getSearchTermFields();
  searchtermFieldss.forEach((searchtermField) => {
    const filter = new FilterParam(
      'searchterm',
      searchtermParam,
      'sim',
      null,
      searchtermField.display_value,
      searchtermField.nestedPath || null,
      null,
    );
    resultSearchtermParams.push(filter);
  });
  req.api.searchtermParams = resultSearchtermParams;
}

function validateSortParams(req) {
  const filterParamsQuery = req.query;
  const sortableFields = getSortableFields();
  const resultSortParams = [];

  if (!filterParamsQuery.sort_by) {
    const defaultSortFields = getDefaultSortFields();

    defaultSortFields.forEach((defaultSortField) => {
      resultSortParams.push(new SortParam(defaultSortField.value, defautSortDirection));
    });
  } else {
    if (Array.isArray(filterParamsQuery.sort_by)) {
      res.status(500).json({ success: false, error: 'Serveral sort params are not allowed' });
      res.end();
    }

    const [sortFieldParam, sortDirectionParam] = filterParamsQuery.sort_by.split('.');

    if (sortDirectionParam) {
      if (!availableSortTypes[sortDirectionParam]) {
        // TODO: Error Objekt erzeugen, in in welches die Error Nachricht
        //       reingereicht wird und welches dann die Ausgabe erzeugt
        res.status(500).json({ success: false, error: `Not allowed sort direction <${sortDirectionParam}>` });
        res.end();
      }
    }

    // TODO auslagern in Mapping => funktion isSortable definieren
    const sortField = sortableFields.find(
      (sortableField) => sortableField.key === sortFieldParam,
    );

    if (!sortField) {
      res.status(500).json({ success: false, error: `Not allowed sort field <${sortFieldParam}>` });
      res.end();
    }

    resultSortParams.push(new SortParam(sortField.value, sortDirectionParam));
  }

  req.api.sortParams = resultSortParams;
}

function validateFilterParams(req) {
  const filterParamsQuery = req.query;
  const filterParamsKeys = Object.keys(filterParamsQuery);
  const resultFilterParams = [];
  const allowedFilters = getAllowedFilters();

  filterParamsKeys.forEach((filterParamKey) => {
    // Split filter param from query
    // eslint-disable-next-line prefer-const
    let [filterKey, filterType = defaultFilterType] = filterParamKey.split(':');

    if (specialParams.includes(filterKey)) {
      return;
    }

    const filterTypeGroup = availableFilterTypes[filterType];
    if (filterTypeGroup === undefined) {
      res.status(500).json({ success: false, error: `Not allowed filter type <${filterType}>` });
    }

    const filteredFilter = allowedFilters.filter(
      (allowedFilter) => allowedFilter.key === filterKey,
    );

    // TODO: Operation überprüfen. => macht semantisch nicht das Richtige
    if (filteredFilter.length > 1) {
      res.status(500).json({ success: false, error: `filter key <${filterKey}> assigned serveral times` });
    }

    if (filteredFilter.length === 0) {
      res.status(500).json({ success: false, error: `Not allowed filter key <${filterKey}>` });
    }

    if (!filteredFilter[0].filter_types.includes(filterTypeGroup)) {
      res.status(500).json({ success: false, error: `Not allowed filter type <${filterType}> for filter key <${filterKey}>` });
    }

    let filterValues = [];

    // Ranges and Wildcard search allows only one filter value
    if ((filterTypeGroup === 'range') || (filterTypeGroup === 'notrange') || (filterTypeGroup === 'differ')) {
      filterValues = filterParamsQuery[filterParamKey];
    } else {
      filterValues = filterParamsQuery[filterParamKey].split(',');
    }

    const sortBy = filteredFilter[0].nestedPath && filteredFilter[0].sortBy
      ? filteredFilter[0].sortBy
      : null;

    const filter = new FilterParam(
      filterKey,
      filterValues,
      filterType,
      filterTypeGroup,
      filteredFilter[0].value,
      filteredFilter[0].nestedPath || null,
      sortBy,
    );

    resultFilterParams.push(filter);
  });

  req.api.filterParams = resultFilterParams;
}

function validatePaginationParams(req) {
  const filterParamsQuery = req.query;
  const size = parseInt(filterParamsQuery.size, 10);
  const from = parseInt(filterParamsQuery.from, 10);

  req.api.size = (Number.isNaN(size)) ? defaultResponseSize : size;
  req.api.from = (Number.isNaN(from)) ? 0 : from;
}

function validateParams(req, res, next) {
  req.api = {};
  validateSearchTermParams(req);
  validateSortParams(req);
  validateFilterParams(req);
  validatePaginationParams(req);
  next();
}

module.exports = {
  validateParams,
};
