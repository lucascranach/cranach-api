const {
  availableFilterTypes,
  availableSortTypes,
  defaultFilterType,
  defautSortDirection,
  specialParams,
  isFilterInfosFilter,
  isNestedFilter,
  getAllowedFilters,
  getDefaultSortField,
  getSearchTermFields,
  getSortableFields,
  getVisibleFilters,
  getVisibleResults,
  getFilterByKey,
} = require('../mappings');

function validateSortParams(req, res, next) {
  const filterParams = req.query;
  const sortableFields = getSortableFields();

  if (filterParams.sort_by) {
    if (Array.isArray(filterParams.sort_by)) {
      res.status(500).json({ success: false, error: 'Serveral sort params are not allowed' });
      res.end();
    }

    const [sortFieldParam, sortDirectionParam] = filterParams.sort_by.split('.');

    if (sortDirectionParam) {
      if (!availableSortTypes[sortDirectionParam]) {
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
  }
  next();
}

function validateFilterParams(req, res, next) {
  const filterParams = req.query;
  const filterParamsKeys = Object.keys(filterParams);
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

    if (filteredFilter.length > 1) {
      res.status(500).json({ success: false, error: `filter key <${filterKey}> assigned serveral times` });
    }

    if (filteredFilter.length === 0) {
      res.status(500).json({ success: false, error: `Not allowed filter key <${filterKey}>` });
    }

    if (!filteredFilter[0].filter_types.includes(filterTypeGroup)) {
      res.status(500).json({ success: false, error: `Not allowed filter type <${filterType}> for filter key <${filterKey}>` });
    }
  });
  next();
}

module.exports = {
  validateFilterParams,
  validateSortParams,
};
