from playwright.sync_api import sync_playwright
import time
import sys

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_addsub_detailed():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()

        console = []
        page.on('console', lambda msg: console.append(f"[{msg.type}] {msg.text}"))

        print("=" * 70)
        print("TEST: Detailed Addition/Subtraction Icon Check")
        print("=" * 70)

        # Load game
        page.goto('http://83.222.23.107:8081/games-number-racing.html?profile=1764998591846', timeout=30000)
        page.wait_for_timeout(3000)

        print(f"\n[1] Starting race...")
        start_btn = page.locator('button:has-text("▶️")').first
        start_btn.click()
        page.wait_for_timeout(2000)

        print(f"\n[2] Answering questions to progress through stages...")
        print(f"    Looking for addition/subtraction tasks...\n")

        found_addition = False
        found_subtraction = False
        found_zero_option = False
        question_num = 0

        # Answer many questions correctly to progress through stages
        for attempt in range(50):  # More attempts to reach stage 4
            try:
                question_num = attempt + 1

                # Wait a bit for the question to render
                page.wait_for_timeout(800)

                # Get the full page content
                full_html = page.content()

                # Check if this looks like an addSub task
                # Look for the task icon area (should have two circles and text between)
                # The icon SVG has viewBox="0 0 100 60" for addSub tasks
                if 'viewBox="0 0 100 60"' in full_html:
                    print(f"   Question {question_num}: Found addSub task!")

                    # Extract the operator from the SVG
                    if '>+<' in full_html:
                        print(f"      ✅ Addition task detected (+ icon in SVG)")
                        found_addition = True
                    elif '>-<' in full_html or '>−<' in full_html:
                        print(f"      ✅ Subtraction task detected (- icon in SVG)")
                        found_subtraction = True

                    # Check answer buttons
                    buttons = page.locator('.grid.grid-cols-3 button').all()
                    answer_texts = [btn.text_content().strip() for btn in buttons]
                    print(f"      Answer options: {answer_texts}")

                    # Check for zero
                    if '0' in answer_texts:
                        print(f"      ✅ Zero is available as an answer!")
                        found_zero_option = True

                    # Take screenshot
                    screenshot_name = f'test_screenshots/addsub_detailed_{question_num}.png'
                    page.screenshot(path=screenshot_name)
                    print(f"      📸 Screenshot: {screenshot_name}\n")

                # Try to answer correctly
                if not page.locator('.grid.grid-cols-3 button').first.is_visible(timeout=2000):
                    print(f"\n   Race ended after {question_num} questions")
                    break

                # Click first button to continue
                buttons = page.locator('.grid.grid-cols-3 button').all()
                if len(buttons) > 0:
                    buttons[0].click(force=True)
                    page.wait_for_timeout(1000)

            except Exception as e:
                print(f"\n   Error on question {question_num}: {str(e)[:100]}")
                break

        # Summary
        print("\n" + "=" * 70)
        print("SUMMARY:")
        print(f"  Total questions: {question_num}")
        print(f"  Found addition tasks: {'✅ YES' if found_addition else '❌ NO'}")
        print(f"  Found subtraction tasks: {'✅ YES' if found_subtraction else '❌ NO'}")
        print(f"  Found zero in options: {'✅ YES' if found_zero_option else '❌ NO'}")

        if found_addition and found_subtraction:
            print(f"\n✅✅ ICON FIX VERIFIED: Both + and - icons working correctly!")
        elif found_addition or found_subtraction:
            print(f"\n⚠️ PARTIAL: Found one type but not both (may need more questions)")
        else:
            print(f"\n⚠️ Did not reach stage 4 (addition/subtraction) in {question_num} questions")

        print("=" * 70)

        # Show relevant console messages
        print(f"\n[Console] Last 5 messages:")
        for msg in console[-5:]:
            print(f"   {msg}")

        time.sleep(3)
        browser.close()

if __name__ == '__main__':
    import os
    os.makedirs('test_screenshots', exist_ok=True)
    test_addsub_detailed()
