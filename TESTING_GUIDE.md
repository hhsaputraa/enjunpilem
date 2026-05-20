# Testing Guide - LCP Fix Verification

## Server Status
✅ Preview server is running at: http://localhost:4173/

## Quick Test Steps

### 1. Visual Test (Immediate)
1. Open http://localhost:4173/ in Chrome
2. Open DevTools (F12)
3. Go to Network tab
4. Enable "Disable cache"
5. Refresh the page (Ctrl+R)
6. **Expected**: You should see the skeleton with text "Memuat konten terbaru..." immediately (no blank screen)
7. **Expected**: Hero image should load within 1-2 seconds

### 2. Lighthouse Test (Performance Audit)

#### Option A: Chrome DevTools
1. Open http://localhost:4173/ in Chrome
2. Open DevTools (F12)
3. Go to "Lighthouse" tab
4. Configuration:
   - Mode: Navigation
   - Device: Mobile
   - Categories: Performance only
5. Click "Analyze page load"
6. Wait for results

#### Option B: Command Line (More Accurate)
```bash
# Install Lighthouse CLI if not installed
npm install -g lighthouse

# Run Lighthouse audit
lighthouse http://localhost:4173/ --only-categories=performance --form-factor=mobile --screenEmulation.mobile --throttling.cpuSlowdownMultiplier=4 --view
```

### 3. Expected Lighthouse Results

#### Before Fix (Old Results)
```
❌ Largest Contentful Paint: Error (NO_LCP)
❌ Total Blocking Time: Error (NO_LCP)
⚠️  First Contentful Paint: 2.4s
⚠️  Speed Index: 2.5s
```

#### After Fix (Expected Results)
```
✅ Largest Contentful Paint: 1.5-2.0s (Good)
✅ First Contentful Paint: 1.0-1.5s (Good)
✅ Total Blocking Time: <300ms (Good)
✅ Speed Index: <2.5s (Good)
✅ Performance Score: 80-90+
```

### 4. Network Performance Check

1. Open DevTools → Network tab
2. Filter by "Img"
3. Refresh page
4. Check the first hero image:
   - **Expected URL**: Should contain `w500` (not `w780`)
   - **Expected Size**: ~80-100KB (not 150KB+)
   - **Expected Load Time**: <1s on 3G, <500ms on 4G

### 5. Visual Regression Check

#### What to Look For:
1. ✅ **No blank screen** - Skeleton appears immediately
2. ✅ **Smooth transition** - Skeleton → Hero image (no flash)
3. ✅ **No layout shift** - Content doesn't jump when image loads
4. ✅ **Text visible** - "Memuat konten terbaru..." shows during load
5. ✅ **Proper sizing** - Hero section is 400px tall from start

#### What NOT to See:
1. ❌ Blank white/black screen for 2-4 seconds
2. ❌ Content jumping/shifting when image loads
3. ❌ Skeleton with no text
4. ❌ Hero section changing height

### 6. Mobile Device Testing (Real Device)

1. Find your local IP from preview server output (e.g., http://192.168.55.192:4173/)
2. Open that URL on your mobile device
3. Test on slow 3G connection:
   - Chrome DevTools → Network → Throttling → Slow 3G
4. Verify:
   - Skeleton shows immediately
   - No blank screen
   - Image loads progressively

### 7. Performance Metrics Breakdown

#### Critical Metrics:
- **LCP (Largest Contentful Paint)**: <2.5s = Good, 2.5-4s = Needs Improvement, >4s = Poor
- **FCP (First Contentful Paint)**: <1.8s = Good, 1.8-3s = Needs Improvement, >3s = Poor
- **TBT (Total Blocking Time)**: <200ms = Good, 200-600ms = Needs Improvement, >600ms = Poor

#### What Each Metric Means:
- **LCP**: Time until largest visible element (hero image or skeleton text) is rendered
- **FCP**: Time until first pixel is painted (skeleton background)
- **TBT**: Total time main thread is blocked (should be minimal now)

### 8. Troubleshooting

#### If LCP is still slow (>2.5s):
1. Check Network tab - is image loading slowly?
2. Check if image URL contains `w500` (not `w780`)
3. Check if skeleton text is visible (not opacity:0)
4. Check if hero container has background color

#### If you still see NO_LCP error:
1. Verify skeleton text "Memuat konten terbaru..." is visible
2. Check if hero container has fixed height (400px)
3. Ensure no `display:none` or `opacity:0` on skeleton
4. Check browser console for errors

#### If you see layout shift:
1. Verify hero container has `min-height: 400px`
2. Check if skeleton fills entire container
3. Ensure image has `width` and `height` attributes

### 9. Comparison Test

#### Test Scenario:
1. Open old version (before fix) in one tab
2. Open new version (after fix) in another tab
3. Record both with DevTools Performance tab
4. Compare:
   - Time to first paint
   - Time to LCP
   - Layout shift score
   - Visual completeness timeline

### 10. Success Criteria

✅ **PASS** if ALL of these are true:
1. No blank screen on initial load
2. Skeleton with text appears within 500ms
3. Hero image loads within 2 seconds
4. LCP metric shows <2.5s (not NO_LCP error)
5. No layout shift (CLS < 0.1)
6. Performance score > 80

❌ **FAIL** if ANY of these are true:
1. Blank screen for >1 second
2. NO_LCP error in Lighthouse
3. LCP > 4 seconds
4. Visible layout shift when content loads
5. Performance score < 70

## Quick Commands

```bash
# Build
npm run build

# Preview
npm run preview

# Lighthouse audit (if installed)
lighthouse http://localhost:4173/ --only-categories=performance --form-factor=mobile --view

# Stop preview server
# Press Ctrl+C in the terminal running preview
```

## Files to Verify

After testing, verify these files were modified correctly:
1. ✅ `src/hooks/useMobileApi.ts` - Image size changed to w500
2. ✅ `src/components/mobile/pages/MobileHome.tsx` - Container has background
3. ✅ `src/components/mobile/Skeletons.tsx` - Text is visible
4. ✅ `src/components/mobile/HeroSlider.tsx` - Image opacity is 1
5. ✅ `index.html` - Critical CSS added

## Next Steps After Testing

If tests pass:
1. ✅ Commit changes
2. ✅ Deploy to production
3. ✅ Monitor real user metrics
4. ✅ Run Lighthouse on production URL

If tests fail:
1. ❌ Check browser console for errors
2. ❌ Review Network tab for slow requests
3. ❌ Verify all files were modified correctly
4. ❌ Test on different browsers/devices
