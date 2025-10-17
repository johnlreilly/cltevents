# Hide Feature Debug Guide

## Overview
The hide feature allows users to hide events using the X icon. Hidden events are stored in localStorage using normalized event names as keys.

## Recent Changes (2025-10-17)

### 1. Consolidated Normalization Logic
**Problem**: The normalization logic was duplicated between `eventUtils.js` and `useFilters.js`, which could lead to inconsistencies.

**Fix**:
- Exported `normalizeEventName()` from [eventUtils.js](../src/utils/eventUtils.js#L191-L198)
- Updated `useFilters.js` to import and use the centralized function
- Added 8 comprehensive tests for normalization logic

### 2. Added Debug Logging
**Location**: [useFilters.js:89-115](../src/hooks/useFilters.js#L89-L115) and [eventUtils.js:211-279](../src/utils/eventUtils.js#L211-L279)

**What's logged**:
- When hiding/unhiding: Original name, normalized key, before/after arrays
- When filtering: Hidden count, hidden keys, events being filtered out

### 3. Normalization Rules
Event names are normalized using this logic:
1. Remove text in parentheses: `"Concert (Night 1)"` → `"Concert"`
2. Remove text after hyphen: `"Artist - Tour Name"` → `"Artist"`
3. Convert to lowercase and trim: `"Artist"` → `"artist"`

**Example**:
```javascript
normalizeEventName('Charlotte FC (Home) - vs Orlando')
// Returns: "charlotte fc"
```

## Testing the Fix

### In Browser Console
1. Open browser DevTools (F12)
2. Navigate to the site
3. Try hiding an event - you should see:
```
🔍 Hide Debug: {
  originalName: "Charlotte FC vs Orlando",
  normalizedKey: "charlotte fc",
  currentHidden: [],
  willBeHidden: true
}
✅ hiding event: "Charlotte FC vs Orlando"
   Normalized key: "charlotte fc"
   Previous hidden array: []
   New hidden array: ["charlotte fc"]
   localStorage key: cltevents-hidden
```

### Check localStorage
```javascript
// In browser console
localStorage.getItem('cltevents-hidden')
// Should return: ["charlotte fc", "other event", ...]
```

### View Hidden Events
1. Click the "Hidden" filter category
2. You should see all hidden events
3. Console will show:
```
✅ Including hidden event in 'hidden' category: "Charlotte FC vs Orlando" (normalized: "charlotte fc")
```

## Known Edge Cases

### 1. Text Substitutions
Events are processed through text substitutions BEFORE normalization:
- `"CLTFC vs Miami"` → (substitution) → `"Charlotte FC vs Miami"` → (normalization) → `"charlotte fc"`
- `"CLT FC vs Miami"` → (substitution) → `"Charlotte FC vs Miami"` → (normalization) → `"charlotte fc"`

Both variations normalize to the same key, so hiding one hides all.

### 2. Grouped Events
Events are grouped by normalized name, so:
- `"Concert (Night 1)"` on 2024-12-15
- `"Concert (Night 2)"` on 2024-12-16

Both normalize to `"concert"` and are grouped together. Hiding the group hides all dates.

### 3. Old localStorage Data
If users have old hidden keys from before text substitutions were added, they might not match current event names.

**Solution**: Users can clear their hidden list by:
1. Going to "Hidden" category
2. Clicking X on each event to unhide
3. Or clearing localStorage: `localStorage.removeItem('cltevents-hidden')`

## Production Testing Checklist

- [ ] Hide an event - verify it disappears immediately
- [ ] Check browser console for debug logs
- [ ] Switch to "Hidden" category - verify event appears
- [ ] Unhide the event - verify it returns to main list
- [ ] Hide a Charlotte FC event - verify all dates/variations are hidden
- [ ] Check localStorage contains correct normalized keys
- [ ] Test with events that have parentheses
- [ ] Test with events that have hyphens
- [ ] Test with events that have both

## Reverting Changes

If the debug logging is too noisy in production, remove these console.log statements:
- [useFilters.js:93-111](../src/hooks/useFilters.js#L93-L111)
- [eventUtils.js:213-219, 227-228, 242-243, 254-255, 271-272](../src/utils/eventUtils.js#L213-L275)

The core functionality (exported `normalizeEventName` and consistent usage) should remain.

## Related Files
- [src/utils/eventUtils.js](../src/utils/eventUtils.js) - Normalization and filtering logic
- [src/hooks/useFilters.js](../src/hooks/useFilters.js) - Hide/unhide state management
- [src/utils/eventUtils.test.js](../src/utils/eventUtils.test.js) - Tests for normalization
