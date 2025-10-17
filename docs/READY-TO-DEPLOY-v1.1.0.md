# Ready to Deploy: v1.1.0

## Summary
Version 1.1.0 includes critical fixes for the hide feature and improvements to YouTube video integration.

## What's in This Release

### 1. **Hide Feature Fix** (Critical for Production)
**Problem**: The hide feature (X icon) was not working reliably in production.

**Root Cause**: Event name normalization logic was duplicated between `eventUtils.js` and `useFilters.js`, causing inconsistencies.

**Fix**:
- Consolidated normalization into a single exported function
- All hide/unhide operations now use the same normalization logic
- Added comprehensive debug logging
- Added 8 new tests (all passing)

**Files Changed**:
- [src/utils/eventUtils.js](../src/utils/eventUtils.js) - Exported `normalizeEventName()`, added filter debug logging
- [src/hooks/useFilters.js](../src/hooks/useFilters.js) - Use centralized normalization, added hide debug logging
- [src/utils/eventUtils.test.js](../src/utils/eventUtils.test.js) - Added 8 normalization tests
- [docs/HIDE-FEATURE-DEBUG.md](../docs/HIDE-FEATURE-DEBUG.md) - Complete debug guide

### 2. **YouTube Videos Fix**
**Problem**: YouTube videos weren't appearing in either local dev or production.

**Root Cause**: `fetchYouTubeVideos()` was using hardcoded relative URLs instead of respecting `API_BASE_URL` config.

**Fix**:
- Added `apiBaseUrl` parameter to `fetchYouTubeVideos()`
- Updated all callers to pass `API_BASE_URL`
- Local dev now correctly fetches from production API

**Files Changed**:
- [src/utils/youtubeUtils.js](../src/utils/youtubeUtils.js) - Accept apiBaseUrl parameter
- [src/hooks/useEvents.js](../src/hooks/useEvents.js) - Pass API_BASE_URL to fetchYouTubeVideos

### 3. **Enable YouTube for The Fillmore**
**Change**: Enabled YouTube video fetching for all Fillmore events.

**Why**: The Fillmore events have artist names (not venue names), so YouTube searches return relevant music videos. Previously disabled to save API quota.

**Impact**: Users will see YouTube videos for many more events since The Fillmore is a major venue.

**Files Changed**:
- [src/hooks/useEvents.js](../src/hooks/useEvents.js) - Enabled YouTube for Fillmore events

### 4. **Version Logging**
**Change**: Added version logging to browser console on app mount.

**Why**: Makes it easy to confirm production is running the latest code.

**What You'll See**:
```
🎉 CLT Events Discovery v1.1.0
Build: 2025-10-17T21:24:45.123Z
Environment: production
```

**Files Changed**:
- [package.json](../package.json) - Bumped version to 1.1.0
- [src/App.jsx](../src/App.jsx) - Added version logging with styled console output

### 5. **Debug Logging**
**Change**: Added comprehensive debug logging throughout the app.

**Why**: Helps diagnose issues in production without needing to deploy new code.

**What's Logged**:
- Hide/unhide operations with normalized keys
- Filter operations showing which events are hidden
- YouTube fetch operations with URLs and results
- Total events loaded and YouTube counts
- EventCard renders with YouTube links

**Can Be Removed**: If console gets too noisy, debug logs can be removed while keeping the fixes.

## Test Results
- ✅ All 143 unit tests passing
- ✅ Hide feature working correctly in local dev
- ✅ YouTube videos appearing for Fillmore events
- ✅ Version logging working
- ✅ YouTube caching working (7-day localStorage cache)

## Local Testing Checklist
Before deploying, test in local dev at http://localhost:3000/:

- [ ] Browser console shows version "v1.1.0"
- [ ] Hide an event with X icon → disappears immediately
- [ ] Switch to "Hidden" category → event appears there
- [ ] Unhide event → returns to main list
- [ ] Fillmore events show "▼ Listen on YouTube" button
- [ ] Click YouTube button → videos play
- [ ] Console shows debug logs for hide/unhide operations
- [ ] Console shows YouTube fetch logs

## Production Testing Checklist
After deploying to https://clt.show:

- [ ] Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5) to clear cache
- [ ] Check console for version "v1.1.0" (confirms deployment)
- [ ] Test hide feature on multiple events
- [ ] Verify hidden events appear in "Hidden" category
- [ ] Test YouTube videos on Fillmore events
- [ ] Check console for any errors

## Known Issues
- **Comet Grill**: Still disabled due to stale website
- **Eternally Grateful**: YouTube still disabled to save API quota (can enable if needed)
- **Debug Logging**: Console may be verbose; logs can be removed after confirming fixes work

## Deployment Command
When ready to deploy:
```bash
# This will trigger GitHub Actions to deploy to production
git push origin main
```

## Rollback Plan
If issues occur in production:
```bash
# Revert to previous version
git revert HEAD
git push origin main
```

Or manually revert in GitHub to commit: `ddf43bc` (previous stable version)

## Files Changed in This Release
```
M package.json                           # Version bump to 1.1.0
M src/App.jsx                           # Version logging + debug
M src/components/EventCard/EventCard.jsx # Debug logging
M src/hooks/useEvents.js                # Enable Fillmore YouTube + API_BASE_URL
M src/hooks/useFilters.js               # Consolidated normalization + debug
M src/utils/eventUtils.js               # Export normalizeEventName + debug
M src/utils/eventUtils.test.js          # Add 8 normalization tests
M src/utils/youtubeUtils.js             # Accept apiBaseUrl parameter
A docs/HIDE-FEATURE-DEBUG.md            # Debug guide
A docs/READY-TO-DEPLOY-v1.1.0.md        # This file
```

## Related Documentation
- [HIDE-FEATURE-DEBUG.md](HIDE-FEATURE-DEBUG.md) - Complete guide to hide feature debugging
- [TEXT-SUBSTITUTIONS.md](TEXT-SUBSTITUTIONS.md) - Text substitution system documentation

---

**Ready to deploy when you give the word!** 🚀
