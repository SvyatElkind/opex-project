# QA Report: errorService
> Path: `src/services/errorService.js` | Last audit: 2026-03-24

## Purpose
Error parsing and HTTP status utility service. Parses all Django REST Framework error response formats into a standardized structure with general message, human-readable message, and per-field error map. Used by `ApiError` in `apiClient.js` to normalize backend error responses.

## Exports
| Export | Type | Description |
|--------|------|-------------|
| `parseApiError` | `function` | Parse any API error response into `{ general, message, fields }` |
| `isErrorStatus` | `function` | Check if HTTP status >= 400 |
| `isNoContentStatus` | `function` | Check if HTTP status === 204 |
| `isNotFoundStatus` | `function` | Alias for `isNoContentStatus` (backward-compatible, misleading name) |
| `getStatusMessage` | `function` | Get Latvian user-friendly message for HTTP status code |
| `formatErrorMessage` | `function` | Template string formatter with positional `{}` placeholder replacement |

## `parseApiError(response, _depth)` Behavior
Handles 9 documented input formats:

| Format | Input Example | Parsing |
|--------|---------------|---------|
| 1 | `{ "detail": "Not found." }` | `general = "Not found."` |
| 2 | `{ "detail": ["Error 1", "Error 2"] }` | `general = "Error 1. Error 2"` |
| 3 | `{ "error": "Something went wrong" }` | `general = "Something went wrong"` |
| 4 | `{ "field": ["Required."] }` | `fields.field = "Required."` |
| 5 | `{ "non_field_errors": ["Invalid."] }` | `general = "Invalid."` |
| 6 | `{ "field": "Error message" }` | `fields.field = "Error message"` |
| 7 | `{ "field": { "nested": ["Error"] } }` | `fields["field.nested"] = "Error"` |
| 8 | `"Plain string error"` | `general = "Plain string error"` |
| 9 | `null / undefined` | `general = "Neparedzēta kļūda. Mēģiniet vēlreiz."` |

### Return Value
```
{
  general: string | null,  // General error message
  message: string,         // Summary message (always populated)
  fields: Object           // { fieldName: errorString }
}
```

### Recursion Protection
- `_depth` parameter prevents infinite recursion (e.g., circular references).
- `MAX_DEPTH = 5`. At max depth, stringifies response.

### Message Priority
1. `response.detail` (string or array) -- returns immediately
2. `response.error` (string) -- returns immediately
3. `response.non_field_errors` (array or string) -- sets general, continues to fields
4. Field-level errors from remaining keys -> general = "Lūdzu izlabojiet kļūdas formas laukos."
5. Fallback: "Neparedzēta kļūda."

## `getStatusMessage(status)` Mapping
Returns Latvian messages for HTTP status codes:
- 200: "Operācija veiksmīga", 201: "Ieraksts izveidots", 204: "Nav satura"
- 400: "Validācijas kļūda", 401: "Nav autorizācijas", 403: "Pieeja liegta", 404: "Nav atrasts"
- 408: "Pieprasījuma noilgums", 409: "Konflikts", 413: "Pieprasījums pārāk liels"
- 500: "Servera kļūda", 502: "Slikts vārtejs", 503: "Serveris nav pieejams", 504: "Vārtejas noilgums"
- Unknown: `HTTP kļūda ${status}`

## `formatErrorMessage(message, ...args)`
Simple positional `{}` placeholder replacement. Each arg replaces the next `{}` occurrence in the message string.

## Known Limitations
- `isNotFoundStatus` is aliased to `isNoContentStatus` (checks 204, not 404). Semantically misleading.
- `non_field_errors` does NOT short-circuit -- after setting `general`, continues to iterate all fields. Both general and field errors captured simultaneously.
- Nested error flattening uses dot notation (`"field.nested"`) which may not match form field names in `useFormErrors`.
- `formatErrorMessage` only supports positional `{}`, not named `{placeholder}` despite JSDoc suggesting both.
- All default messages in Latvian, no i18n.
- Does not handle array responses (e.g., `[{ "error": "..." }]`).
- No distinction between 4xx and 5xx in parsed result.

## Quality Score: 8/10
