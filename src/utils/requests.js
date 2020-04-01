export function wikiSearchRequest(query) {
  return `https://ru.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${encodeURI(query)}&exchars=800&origin=*`;
}

export function wikiOrthographyRequest(query) {
  return `https://ru.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodeURI(query)}&origin=*`
}
