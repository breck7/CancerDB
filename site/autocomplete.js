let searchIndex = false
let searchIndexRequestMade = false

// This method is currently used to enable autocomplete on: the header search, front page search, 404 page search
const initAutocomplete = elementId => {
  const input = document.getElementById(elementId)
  const urlParams = new URLSearchParams(window.location.search)
  const query = urlParams.get("q")
  if (query) input.value = query
  autocomplete({
    input,
    minLength: 1,
    emptyMsg: "No matching entities found",
    preventSubmit: true,
    fetch: async (query, update) => {
      text = query.toLowerCase()
      // you can also use AJAX requests instead of preloaded data

      if (!searchIndexRequestMade) {
        searchIndexRequestMade = true
        let response = await fetch("/autocomplete.json")
        if (response.ok) searchIndex = await response.json()
      }

      const suggestions = searchIndex.filter(entity =>
        entity.label.toLowerCase().startsWith(text)
      )

      const htmlEncodedQuery = query.replace(/</g, "&lt;")

      suggestions.push({
        label: `Full text search for "${htmlEncodedQuery}"`,
        id: "",
        url: `/fullTextSearch?q=${htmlEncodedQuery}`
      })
      update(suggestions)
    },
    onSelect: item => {
      const { url, id } = item
      if (id) window.location = url
      else
        window.location = "/fullTextSearch?q=" + encodeURIComponent(input.value)
    }
  })
}

document.addEventListener("DOMContentLoaded", evt =>
  initAutocomplete("headerSearch")
)
