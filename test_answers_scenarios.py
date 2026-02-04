from playwright.sync_api import sync_playwright
import time
import sys

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_scenarios():
    """Test different answer scenarios"""

    print("Testing Different Answer Scenarios")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()

        errors = []
        page.on('console', lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == 'error' else None)
        page.on('pageerror', lambda err: errors.append(f"[PAGE ERROR] {err}"))

        try:
            # Load game
            page.goto('http://83.222.23.107:8081/games-number-racing.html', timeout=30000)
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)
            print("[OK] Game loaded\n")

            # Start race
            start_button = page.locator('button:has-text("▶️")').first
            start_button.click()
            page.wait_for_timeout(2000)
            print("[OK] Race started\n")

            # Scenario 1: Wrong answer 3 times, then right answer
            print("=" * 70)
            print("SCENARIO 1: Multiple wrong answers, then correct")
            print("=" * 70)

            for attempt in range(3):
                print(f"\n  Attempt {attempt + 1}: Clicking WRONG answer (first button)...")
                buttons = page.locator('.grid.grid-cols-3 button').all()
                if len(buttons) > 0:
                    # Click first button (might be wrong)
                    buttons[0].click(force=True)
                    page.wait_for_timeout(1500)

                    # Check screen
                    body = page.locator('body').text_content()
                    if not body or len(body) < 100:
                        print(f"  [FAIL] WHITE SCREEN after wrong attempt {attempt + 1}!")
                        page.screenshot(path=f'test_screenshots/white_screen_attempt_{attempt+1}.png')
                        break
                    else:
                        print(f"  [OK] Screen OK after attempt {attempt + 1}")

            # Now try correct answer (try different buttons)
            print(f"\n  Trying correct answer (second button)...")
            buttons = page.locator('.grid.grid-cols-3 button').all()
            if len(buttons) > 1:
                buttons[1].click(force=True)
                page.wait_for_timeout(2000)

                # Check screen
                body = page.locator('body').text_content()
                if not body or len(body) < 100:
                    print(f"  [FAIL] WHITE SCREEN after correct answer!")
                    page.screenshot(path=f'test_screenshots/white_screen_after_correct.png')
                else:
                    print(f"  [OK] Screen OK after correct answer ({len(body)} chars)")

            page.screenshot(path='test_screenshots/scenario1_end.png')

            # Check errors
            if errors:
                print(f"\n[ERRORS] Found {len(errors)} errors:")
                for error in errors[:5]:
                    print(f"  {error}")

            print("\n" + "=" * 70)
            print("Test completed!")
            print("=" * 70)

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
    test_scenarios()
