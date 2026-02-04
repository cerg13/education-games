from playwright.sync_api import sync_playwright
import time
import sys

# Set UTF-8 encoding for console output
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_first_task():
    """Test completing the first task to reproduce white screen bug"""

    print("Testing First Task Completion Bug")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=1000)  # Visible and slow
        page = browser.new_page()

        # Listen for console errors
        errors = []
        page.on('console', lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == 'error' else None)
        page.on('pageerror', lambda err: errors.append(f"[PAGE ERROR] {err}"))

        try:
            # Load the game
            print("\n[Test 1] Loading Number Racing game...")
            page.goto('http://83.222.23.107:8081/games-number-racing.html', timeout=30000)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)
            print("[OK] Number Racing loaded")

            # Start race
            print("\n[Test 2] Starting race...")
            start_button = page.locator('button:has-text("▶️")').first
            start_button.click()
            page.wait_for_timeout(2000)
            print("[OK] Race started")

            # Take screenshot before answer
            page.screenshot(path='test_screenshots/before_answer.png', full_page=True)
            print("[OK] Screenshot before answer saved")

            # Answer first question (click first option button)
            print("\n[Test 3] Clicking first answer button...")
            # Find all buttons with gradient background (answer buttons in the grid)
            answer_buttons = page.locator('.grid.grid-cols-3 button').all()
            if len(answer_buttons) > 0:
                first_button = answer_buttons[0]
                button_text = first_button.text_content()
                print(f"   Clicking button: {button_text}")
                first_button.click(force=True)  # Force click даже если анимируется
                page.wait_for_timeout(3000)  # Wait for answer processing
                print("[OK] Answer clicked")
            else:
                print("[WARN] No answer buttons found")

            # Take screenshot after answer
            page.screenshot(path='test_screenshots/after_answer.png', full_page=True)
            print("[OK] Screenshot after answer saved")

            # Check for white screen
            body_text = page.locator('body').text_content()
            if not body_text or len(body_text.strip()) < 10:
                print("[FAIL] WHITE SCREEN DETECTED!")
            else:
                print(f"[OK] Page has content ({len(body_text)} characters)")

            # Check for errors
            if errors:
                print(f"\n[ERRORS DETECTED] Found {len(errors)} errors:")
                for error in errors:
                    print(f"   {error}")
            else:
                print("\n[OK] No JavaScript errors")

            # Wait to observe
            print("\n[Test 4] Waiting 5 seconds to observe...")
            page.wait_for_timeout(5000)

        except Exception as e:
            print(f"\n[ERROR] Exception: {str(e)}")
            page.screenshot(path='test_screenshots/exception.png', full_page=True)
            raise

        finally:
            print("\nClosing browser in 3 seconds...")
            time.sleep(3)
            browser.close()

if __name__ == '__main__':
    import os
    os.makedirs('test_screenshots', exist_ok=True)
    test_first_task()
