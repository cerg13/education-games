# Navigation Bug Fix for Number Racing

## Problem
The back button ("← Назад") always redirected to the homepage (`/`) regardless of which screen the user was on. This meant:
- From garage → back button → homepage ❌ (should go to menu)
- From stats → back button → homepage ❌ (should go to menu)
- From menu → back button → homepage ✅ (correct)

## Solution
Implemented screen-aware navigation by lifting screen state to GameWrapper component:

### Changes Made

1. **GameWrapper component** ([number-racing.tsx:724-748](number-racing.tsx#L724-L748))
   - Added `currentScreen` state to track which screen is active
   - Added `handleBackClick` function that checks current screen:
     - If on menu → go to homepage
     - If on any other screen → return to menu
   - Pass screen state and setter to NumberRacing component

2. **NumberRacing component** ([number-racing.tsx:194-206](number-racing.tsx#L194-L206))
   - Accept `screenProp` and `setScreenProp` props
   - Sync internal screen state with parent component
   - Notify parent when screen changes

### Code

```typescript
function GameWrapper() {
  const [currentScreen, setCurrentScreen] = useState('menu');

  const handleBackClick = () => {
    if (currentScreen === 'menu') {
      // From menu, go back to marketplace
      window.location.href = '/';
    } else {
      // From any other screen, go back to menu
      setCurrentScreen('menu');
    }
  };

  return (
    <>
      <button onClick={handleBackClick} className="fixed top-4 left-4 z-50...">
        ← Назад
      </button>
      <NumberRacing screenProp={currentScreen} setScreenProp={setCurrentScreen} />
    </>
  );
}
```

## Testing Results

Tested on production server (http://83.222.23.107:8081/games-number-racing.html):

✅ **Test 1**: Menu screen loads correctly
✅ **Test 2**: Navigation to garage works
✅ **Test 3**: Back button from garage **correctly returns to menu** (FIXED!)
✅ **Test 4**: Back button from menu **correctly returns to marketplace**

## Deployment

- File deployed: `number-racing.tsx`
- Server path: `~/education-games/number-racing.tsx`
- Deployment date: 2025-12-06
- Status: ✅ Successfully deployed and tested

## Navigation Flow (After Fix)

```
Marketplace (/)
    ↓ (user clicks game)
Menu Screen
    ↓ (user clicks garage)
Garage Screen
    ↓ (user clicks ← Назад)
Menu Screen  ✅ FIXED!
    ↓ (user clicks ← Назад)
Marketplace (/)
```
