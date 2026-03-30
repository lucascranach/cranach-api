const model = require('../models');
const Aggregator = require('../es-engine/aggregator');
const FormatterFactory = require('../formatters/formatter-factory');
const { Mappings, MappingType } = require('../mappings');
const FilterParam = require('../../entities/filterparam');

function getSingleItem(mappings) {
  return async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(422).json({
        error: true,
        data: 'Missing required path parameter: id',
      });
      return;
    }

    // Determine format to check if we need both languages
    const format = req.api && req.api.format ? req.api.format : 'json';
    const fetchBothLanguages = format === 'lido';

    const params = {
      id,
      language: req.query.language,
      showDataAll: req.query.show_data_all || false,
      fetchBothLanguages,
    };

    try {
      const result = await model.getSingleItem(mappings, params);

      // Aggregate complete response using Aggregator
      const data = Aggregator.aggregateSingleItemResponse(
        result, mappings, params.showDataAll, fetchBothLanguages, params.language,
      );

      // Check if we need to fetch fields from referenced printing plate
      // If isVirtual is false, this is a printed exemplar and we need certain fields
      // from the printing plate
      if (fetchBothLanguages && data.results && data.results.length > 0) {
        const primaryData = data.results[0].data;
        const isVirtual = primaryData.is_virtual;
        const hasReferences = primaryData.references_reprints
          && primaryData.references_reprints.length > 0;

        if (isVirtual !== true && hasReferences) {
          const referencedInventoryNumber = primaryData.references_reprints[0].inventoryNumber;
          if (referencedInventoryNumber) {
            try {
              // Fetch the referenced printing plate record for both languages
              const referencedParams = {
                id: referencedInventoryNumber,
                language: params.language,
                showDataAll: false,
                fetchBothLanguages: true,
              };
              const referencedResult = await model.getSingleItem(mappings, referencedParams);
              const referencedData = Aggregator.aggregateSingleItemResponse(
                referencedResult, mappings, false, true, params.language,
              );

              // Get fields to copy from the referenced object to the current object
              // This is configured in the mappings for each entity type
              const fieldsToCopy = mappings.getReferencedFieldsToCopy();

              // Copy specified fields from the referenced record
              if (referencedData.results && referencedData.results.length > 0) {
                referencedData.results.forEach((referencedItem) => {
                  const matchingItem = data.results.find(
                    (item) => item.language === referencedItem.language,
                  );
                  if (matchingItem) {
                    fieldsToCopy.forEach((field) => {
                      if (referencedItem.data[field] !== undefined
                        && referencedItem.data[field] !== null
                        && referencedItem.data[field] !== '') {
                        matchingItem.data[field] = referencedItem.data[field];
                      }
                    });
                  }
                });
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error(
                `Failed to fetch referenced record ${referencedInventoryNumber}:`,
                error,
              );
              // Continue with original data if fetch fails
            }
          }
        }

        // Enrich publications with literature reference data
        if (data.results && data.results.length > 0) {
          // Extract all unique referenceIds from publications (using primary language data)
          const referenceIds = new Set();
          if (Array.isArray(primaryData.publications)) {
            primaryData.publications.forEach((publication) => {
              if (publication.referenceId) {
                referenceIds.add(publication.referenceId);
              }
            });
          }

          if (referenceIds.size > 0) {
            try {
              // Create literature mappings
              const literatureMappings = new Mappings(MappingType.LITERATURE);

              // Fetch literature references
              const literatureParams = {
                entityTypes: literatureMappings.getEntityTypes(),
                filters: [
                  new FilterParam(
                    'reference_id',
                    Array.from(referenceIds),
                    'eq',
                    'equals',
                    'referenceId',
                  ),
                ],
                from: 0,
                language: 'de',
                size: referenceIds.size,
                searchterms: [],
                showDataAll: false,
                sort: [],
              };

              const literatureResult = await model.getItems(
                literatureMappings,
                {},
                literatureParams,
              );

              const literatureData = Aggregator.aggregateItemsResponse(
                literatureResult.result,
                literatureResult.queryBuilder,
                literatureMappings,
                literatureParams,
              );

              // Create a map of referenceId to literature data
              const literatureMap = {};
              if (literatureData.results && Array.isArray(literatureData.results)) {
                literatureData.results.forEach((item) => {
                  literatureMap[item.reference_id] = item;
                });

                // Enrich publications in all language results with the same literature data
                for (let i = 0; i < data.results.length; i += 1) {
                  const languageItem = data.results[i];
                  if (Array.isArray(languageItem.data.publications)) {
                    data.results[i].data.publications = languageItem.data.publications.map(
                      (publication) => {
                        if (publication.referenceId) {
                          const literatureItem = literatureMap[publication.referenceId];
                          if (literatureItem) {
                            return {
                              ...publication,
                              authors: literatureItem.authors,
                              publish_location: literatureItem.publish_location,
                              publish_date: literatureItem.publish_date,

                            };
                          }
                        }
                        return publication;
                      },
                    );
                  }
                }
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('Failed to fetch literature references:', error);
              // Continue with original data if fetch fails
            }
          }
        }

        // Enrich related_in_content_to with title data
        const relatedInContentTo = primaryData.related_in_content_to;

        if (relatedInContentTo && relatedInContentTo.length > 0) {
          const relatedInventoryNumber = relatedInContentTo[0].inventoryNumber;

          if (relatedInventoryNumber) {
            try {
              // Fetch the related work for both languages
              const relatedParams = {
                id: relatedInventoryNumber,
                language: params.language,
                showDataAll: false,
                fetchBothLanguages: true,
              };

              const relatedResult = await model.getSingleItem(mappings, relatedParams);
              // console.log(relatedResult.body.responses[1].hits.hits);
              const relatedData = Aggregator.aggregateSingleItemResponse(
                relatedResult, mappings, false, true, params.language,
              );

              // Extract titles and enrich related_in_content_to in all language results
              if (relatedData.results && relatedData.results.length > 0) {
                data.results.forEach((languageItem) => {
                  const matchingRelatedItem = relatedData.results.find(
                    (item) => item.language === languageItem.language,
                  );

                  if (
                    matchingRelatedItem
                    && matchingRelatedItem.data.title
                    && Array.isArray(languageItem.data.related_in_content_to)
                    && languageItem.data.related_in_content_to.length > 0
                    && languageItem.data.related_in_content_to[0]
                  ) {
                    const relatedItem = languageItem.data.related_in_content_to[0];
                    relatedItem.title = matchingRelatedItem.data.title;
                  }
                });
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error(
                `Failed to fetch related work ${relatedInventoryNumber}:`,
                error,
              );
              // Continue with original data if fetch fails
            }
          }
        }
      }

      // Format response based on requested format
      const formatter = FormatterFactory.getFormatter(format, mappings);

      const output = formatter.formatSingleItem(data, params.language);

      // Send formatted output with correct content type
      res.type(formatter.getContentType()).send(output);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

function getItems(mappings) {
  return async (req, res) => {
    const params = {
      entityTypes: mappings.getEntityTypes(),
      filters: req.api.filterParams,
      from: req.api.from,
      language: req.query.language,
      size: req.api.size,
      searchterms: req.api.searchtermParams,
      showDataAll: req.query.show_data_all || false,
      sort: req.api.sortParams,
      geoData: req.path.match(/\/geodata\/?$/),
    };

    const { query } = req;

    // }
    try {
      const rawResult = await model.getItems(mappings, query, params);

      // Aggregate complete response using Aggregator
      const result = params.geoData
        ? Aggregator.aggregateGeoDataResponse(rawResult.result)
        : Aggregator.aggregateItemsResponse(
          rawResult.result, rawResult.queryBuilder, mappings, params,
        );

      // Format response based on requested format
      const format = req.api && req.api.format ? req.api.format : 'json';
      const formatter = FormatterFactory.getFormatter(format, mappings);

      if (format === 'lido') {
        // LIDO format for multiple items not yet implemented
        res.status(501).json({
          error: 'LIDO format for multiple items not yet implemented',
          message: 'Currently only single item LIDO export is supported',
        });
        return;
      }

      const output = formatter.formatItems(result, params);

      // Send formatted output with correct content type
      res.type(formatter.getContentType()).send(output);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      res.status(500).json({ success: false, error: err.message });
    }
  };
}

module.exports = {
  getSingleItem,
  getItems,
};
