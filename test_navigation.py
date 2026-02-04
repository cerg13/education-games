from playwright.sync_api import sync_playwright
import time
import sys

# Set UTF-8 encoding for console output
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_navigation():
    """Test the navigation fix for the back button"""

    print("Testing Number Racing Navigation Fix")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Run visible for debugging
        page = browser.new_page()

        try:
            # Load the game
            print("\n[Test 1] Loading Number Racing game...")
            page.goto('http://83.222.23.107:8081/games-number-racing.html', timeout=30000)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)  # Wait for React to render
            print("[OK] Number Racing loaded")

            # Check we're on menu screen
            print("\n[Test 2] Verifying we're on menu screen...")
            start_button = page.locator('button:has-text("▶️")').first
            if start_button.is_visible():
                print("[OK] Menu screen detected (start button visible)")

            # Click on garage button
            print("\n[Test 3] Navigating to garage...")
            garage_button = page.locator('button:has-text("🚗")').first
            garage_button.click()
            page.wait_for_timeout(1000)

            # Verify we're in garage (check for car unlock buttons or stars display)
            car_locks = page.locator('text=🔒').all()
            if len(car_locks) > 0:
                print(f"[OK] Garage screen detected ({len(car_locks)} locked cars)")

            # Now test the back button from garage
            print("\n[Test 4] Testing back button from garage...")
            back_button = page.locator('button:has-text("← Назад")').first
            back_button.click()
            page.wait_for_timeout(1000)

            # Verify we're back on menu (not marketplace)
            start_button = page.locator('button:has-text("▶️")').first
            if start_button.is_visible():
                print("[OK] Back button correctly returned to menu screen")
            else:
                print("[FAIL] Back button did not return to menu")
                page.screenshot(path='test_screenshots/navigation_fail.png')

            # Test back button from menu to marketplace
            print("\n[Test 5] Testing back button from menu to marketplace...")
            back_button = page.locator('button:has-text("← Назад")').first
            back_button.click()
            page.wait_for_timeout(2000)

            # Check if we're on marketplace page
            current_url = page.url
            if current_url == 'http://83.222.23.107:8081/' or 'index.html' in current_url:
                print(f"[OK] Back button from menu correctly returned to marketplace")
                print(f"    Current URL: {current_url}")
            else:
                print(f"[FAIL] Unexpected URL: {current_url}")

            # Navigate back to game and test stats screen
            print("\n[Test 6] Testing back button from stats screen...")
            page.goto('http://83.222.23.107:8081/games-number-racing.html', timeout=30000)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)

            # Click stats button
            stats_button = page.locator('button:has-text("📊")').first
            stats_button.click()
            page.wait_for_timeout(1000)

            # Click back button
            back_button = page.locator('button:has-text("◀️")').first  # Stats has its own back button
            back_button.click()
            page.wait_for_timeout(1000)

            # Verify we're back on menu
            start_button = page.locator('button:has-text("▶️")').first
            if start_button.is_visible():
                print("[OK] Back button from stats correctly returned to menu")

            print("\n" + "=" * 70)
            print("Navigation testing completed successfully!")
            print("=" * 70)

        except Exception as e:
            print(f"\n[ERROR] Error during testing: {str(e)}")
            page.screenshot(path='test_screenshots/navigation_error.png', full_page=True)
            print("[OK] Error screenshot saved")
            raise

        finally:
            browser.close()

if __name__ == '__main__':
    # Create screenshots directory
    import os
    os.makedirs('test_screenshots', exist_ok=True)

    test_navigation()
