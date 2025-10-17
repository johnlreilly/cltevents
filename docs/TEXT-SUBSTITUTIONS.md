# Text Substitutions

This document explains how to configure text substitutions to normalize event and venue names across all event sources.

## Overview

The text substitution system allows you to automatically replace certain text patterns (like abbreviations or variations) with standardized text across all events. This is useful for:

- Normalizing team/venue names (e.g., "Cltfc" → "Charlotte FC")
- Fixing common abbreviations
- Ensuring consistent branding and naming

## How It Works

Text substitutions are applied automatically to all events from all sources (Ticketmaster, Fillmore, Smokey Joe's, Eternally Grateful, Comet Grill, CLTtoday) during event processing.

The substitutions are applied to:
- Event names
- Venue names
- Event descriptions
- Location names

## Configuration

### Location

Substitution rules are defined in: **`src/data/substitutionText.json`**

### Format

```json
{
  "substitutions": [
    {
      "pattern": "cltfc",
      "replacement": "Charlotte FC",
      "description": "Charlotte FC soccer team"
    },
    {
      "pattern": "clt fc",
      "replacement": "Charlotte FC",
      "description": "Charlotte FC with space"
    }
  ]
}
```

### Fields

- **pattern** (required): The text to search for (case-insensitive)
- **replacement** (required): The text to replace it with
- **description** (optional): A description of what this substitution is for

## Adding New Substitutions

1. Open `src/data/substitutionText.json`
2. Add a new object to the `substitutions` array:

```json
{
  "pattern": "panthers stadium",
  "replacement": "Bank of America Stadium",
  "description": "Panthers home stadium"
}
```

3. Save the file - changes will take effect immediately in development

## Examples

### Input Event
```javascript
{
  name: "CLTFC vs Atlanta United",
  venue: "Cltfc Stadium",
  description: "Come watch CLT FC play at home!"
}
```

### After Substitutions
```javascript
{
  name: "Charlotte FC vs Atlanta United",
  venue: "Charlotte FC Stadium",
  description: "Come watch Charlotte FC play at home!"
}
```

## Technical Details

### Implementation

- **Utility Module**: `src/utils/textSubstitutions.js`
- **Functions**:
  - `applyTextSubstitutions(text)` - Applies substitutions to a string
  - `applyEventSubstitutions(event)` - Applies substitutions to an event object
  - `getSubstitutions()` - Returns all configured substitutions

### Pattern Matching

- Patterns are **case-insensitive** (matches "cltfc", "CLTFC", "Cltfc", etc.)
- Uses **word boundaries** when the pattern is a complete word
- Preserves the capitalization of the replacement text

### Integration Points

Substitutions are applied in `src/hooks/useEvents.js` in these processors:
- `processTicketmasterEvents()`
- `processSmokeyjoesEvents()`
- `processFillmoreEvents()`
- `processEternallyGratefulEvents()`
- `processCometGrillEvents()`
- `processCLTtodayEvents()`

## Testing

The text substitution system includes comprehensive unit tests in:
**`src/utils/textSubstitutions.test.js`**

Run tests with:
```bash
npm run test:unit
```

## Best Practices

1. **Be Specific**: Use specific patterns to avoid unintended replacements
2. **Document**: Always include a description for each substitution
3. **Test**: Verify substitutions work as expected by checking events in the app
4. **Order**: Substitutions are applied in the order they appear in the config file

## Common Use Cases

### Team Names
```json
{
  "pattern": "hornets",
  "replacement": "Charlotte Hornets",
  "description": "NBA team"
}
```

### Venue Abbreviations
```json
{
  "pattern": "boa stadium",
  "replacement": "Bank of America Stadium",
  "description": "Common abbreviation for Panthers stadium"
}
```

### Misspellings
```json
{
  "pattern": "neighboorhood theater",
  "replacement": "Neighborhood Theater",
  "description": "Fix common misspelling"
}
```
