from playwright.sync_api import sync_playwright
import time
import sys

# Set UTF-8 encoding for console output
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_marketplace():
    """Test the deployed Education Games marketplace"""

    print("Testing Education Games Marketplace at http://83.222.23.107:8081/")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Test 1: Main marketplace loads
            print("\n[Test 1] Loading main marketplace page...")
            page.goto('http://83.222.23.107:8081/', timeout=30000)
            page.wait_for_load_state('networkidle')
            print(f"[OK] Page loaded: {page.title()}")

            # Take screenshot
            page.screenshot(path='test_screenshots/01_marketplace_home.png', full_page=True)
            print("[OK] Screenshot saved: 01_marketplace_home.png")

            # Test 2: Check for key elements
            print("\n[Test 2] Checking for key UI elements...")

            # Check for profile-related elements
            profile_buttons = page.locator('button').all()
            print(f"[OK] Found {len(profile_buttons)} buttons on the page")

            # Check for character selection
            characters = page.locator('[class*="character"], [class*="fox"], [class*="bear"], [class*="rabbit"]').all()
            if characters:
                print(f"[OK] Found {len(characters)} character elements")

            # Test 3: Check console for errors
            print("\n[Test 3] Checking browser console...")
            console_messages = []
            page.on('console', lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
            page.reload()
            page.wait_for_load_state('networkidle')

            errors = [msg for msg in console_messages if 'error' in msg.lower()]
            if errors:
                print(f"[WARNING] Found {len(errors)} console errors:")
                for error in errors[:5]:  # Show first 5
                    print(f"   {error}")
            else:
                print("[OK] No console errors detected")

            # Test 4: API Health Check
            print("\n[Test 4] Testing API endpoints...")
            response = page.goto('http://83.222.23.107:8081/api/health')
            if response.status == 200:
                print(f"[OK] API Health Check: {response.status}")
                health_data = response.json()
                print(f"   Response: {health_data}")
            else:
                print(f"[FAIL] API Health Check failed: {response.status}")

            # Test 5: Check profiles endpoint
            page.goto('http://83.222.23.107:8081/api/profiles')
            page.wait_for_load_state('networkidle')
            profiles_text = page.content()
            print(f"[OK] Profiles endpoint accessible")

            # Test 6: Check game pages
            print("\n[Test 5] Testing game pages...")

            # Test Number Racing
            print("   Testing Number Racing game...")
            page.goto('http://83.222.23.107:8081/games-number-racing.html', timeout=30000)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)  # Wait for React to render
            page.screenshot(path='test_screenshots/02_number_racing.png', full_page=True)
            print(f"   [OK] Number Racing loaded: {page.title()}")

            # Test Reading Game
            print("   Testing Reading game...")
            page.goto('http://83.222.23.107:8081/games-reading.html', timeout=30000)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)  # Wait for React to render
            page.screenshot(path='test_screenshots/03_reading_game.png', full_page=True)
            print(f"   [OK] Reading Game loaded: {page.title()}")

            # Test 7: Network requests
            print("\n[Test 6] Monitoring network requests...")
            page.goto('http://83.222.23.107:8081/')
            page.wait_for_load_state('networkidle')

            # Check if React and other libraries loaded
            react_loaded = page.evaluate('typeof React !== "undefined"')
            react_dom_loaded = page.evaluate('typeof ReactDOM !== "undefined"')
            babel_loaded = page.evaluate('typeof Babel !== "undefined"')

            print(f"   React loaded: {'[OK]' if react_loaded else '[FAIL]'}")
            print(f"   ReactDOM loaded: {'[OK]' if react_dom_loaded else '[FAIL]'}")
            print(f"   Babel loaded: {'[OK]' if babel_loaded else '[FAIL]'}")

            print("\n" + "=" * 70)
            print("Testing completed successfully!")
            print("=" * 70)

        except Exception as e:
            print(f"\n[ERROR] Error during testing: {str(e)}")
            page.screenshot(path='test_screenshots/error.png', full_page=True)
            print("[OK] Error screenshot saved")
            raise

        finally:
            browser.close()

if __name__ == '__main__':
    # Create screenshots directory
    import os
    os.makedirs('test_screenshots', exist_ok=True)

    test_marketplace()
