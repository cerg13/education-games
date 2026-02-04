from playwright.sync_api import sync_playwright
import time
import sys

# Set UTF-8 encoding for console output
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_number_racing_improvements():
    """Test the improved Number Racing game"""

    print("Testing Number Racing Improvements")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Visible for debugging
        page = browser.new_page()

        try:
            # Load the game
            print("\n[Test 1] Loading Number Racing game...")
            page.goto('http://83.222.23.107:8081/games-number-racing.html', timeout=30000)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)
            print("[OK] Number Racing loaded")

            # Take screenshot of menu with learning stage
            page.screenshot(path='test_screenshots/number_racing_menu_with_stage.png', full_page=True)
            print("[OK] Menu screenshot saved")

            # Check for learning stage indicator
            print("\n[Test 2] Checking for learning stage indicator...")
            learning_stage_text = page.locator('text="Считаем до 3"').first
            if learning_stage_text.is_visible():
                print("[OK] Learning stage indicator visible: 'Считаем до 3'")
            else:
                print("[WARN] Learning stage indicator not found")

            # Start a race
            print("\n[Test 3] Starting a race...")
            start_button = page.locator('button:has-text("▶️")').first
            start_button.click()
            page.wait_for_timeout(2000)

            # Check for number line
            print("\n[Test 4] Checking for number line visualization...")
            page.screenshot(path='test_screenshots/number_racing_with_numberline.png', full_page=True)
            print("[OK] Race screen screenshot saved")

            # Check if there are number circles (0-3 for stage 1)
            number_circles = page.locator('div').filter(has_text='0').all()
            if len(number_circles) > 0:
                print(f"[OK] Found number line with circles")

            # Wait a bit to see the game in action
            print("\n[Test 5] Observing game for 5 seconds...")
            page.wait_for_timeout(5000)

            print("\n" + "=" * 70)
            print("Testing completed! Check screenshots for visual confirmation.")
            print("=" * 70)

        except Exception as e:
            print(f"\n[ERROR] Error during testing: {str(e)}")
            try:
                page.screenshot(path='test_screenshots/number_racing_error.png', full_page=True)
                print("[OK] Error screenshot saved")
            except:
                pass
            raise

        finally:
            browser.close()

if __name__ == '__main__':
    import os
    os.makedirs('test_screenshots', exist_ok=True)
    test_number_racing_improvements()
