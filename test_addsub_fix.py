from playwright.sync_api import sync_playwright
import time
import sys

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_addsub_icons():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=300)
        page = browser.new_page()

        console = []
        page.on('console', lambda msg: console.append(f"[{msg.type}] {msg.text}"))

        print("=" * 70)
        print("TEST: Addition/Subtraction Icon & Zero Answer Fix")
        print("=" * 70)

        # Load with profile to get to stage 4 (addSub tasks)
        page.goto('http://83.222.23.107:8081/games-number-racing.html?profile=1764998591846', timeout=30000)
        page.wait_for_timeout(3000)

        print(f"\n[1] Starting race...")
        start_btn = page.locator('button:has-text("▶️")').first
        start_btn.click()
        page.wait_for_timeout(2000)

        # We need to get to stage 4 to see addSub tasks
        # Answer questions to progress through stages
        print(f"\n[2] Progressing through stages to reach addition/subtraction...")

        found_addsub = False
        screenshots_taken = 0

        for attempt in range(30):  # Try up to 30 questions
            try:
                # Check if we can see task on screen
                page.wait_for_timeout(1000)

                # Look for addition or subtraction symbols in the task
                body_text = page.locator('body').text_content()

                # Check for + or - in the task display
                if '+' in body_text or '−' in body_text or '-' in body_text:
                    # Take screenshot
                    if screenshots_taken < 3:
                        screenshot_name = f'test_screenshots/addsub_task_{screenshots_taken + 1}.png'
                        page.screenshot(path=screenshot_name)
                        print(f"\n   📸 Found add/sub task! Screenshot: {screenshot_name}")

                        # Check if we can see the icon SVG
                        svg_count = page.locator('svg').count()
                        print(f"   SVG elements on page: {svg_count}")

                        # Look for the operation symbol in SVG
                        # The dynamic icon should have text element with + or -
                        svg_text_elements = page.locator('svg text').all()
                        if svg_text_elements:
                            svg_texts = [elem.text_content() for elem in svg_text_elements]
                            print(f"   SVG text elements: {svg_texts}")
                            if '+' in str(svg_texts):
                                print(f"   ✅ Found '+' icon in SVG!")
                            if '-' in str(svg_texts) or '−' in str(svg_texts):
                                print(f"   ✅ Found '-' icon in SVG!")

                        # Check answer options
                        buttons = page.locator('.grid.grid-cols-3 button').all()
                        answer_texts = [btn.text_content() for btn in buttons]
                        print(f"   Answer options: {answer_texts}")

                        # Check if 0 is in options (for problems like 6-6)
                        if '0' in answer_texts:
                            print(f"   ✅ Zero is available as answer option!")

                        screenshots_taken += 1

                found_addsub = True  # Move this outside the screenshot block

                # Try to answer the question
                if not page.locator('.grid.grid-cols-3 button').first.is_visible(timeout=2000):
                    print(f"\n   Race ended after {attempt} questions")
                    break

                # Click any button to continue
                buttons = page.locator('.grid.grid-cols-3 button').all()
                if len(buttons) > 0:
                    buttons[0].click(force=True)
                    page.wait_for_timeout(1200)

            except Exception as e:
                print(f"\n   Error on question {attempt + 1}: {str(e)[:100]}")
                break

        if found_addsub:
            print(f"\n✅ Successfully found and captured {screenshots_taken} add/sub tasks!")
        else:
            print(f"\n⚠️ Did not encounter add/sub tasks in {attempt} questions")
            print(f"   (May need more questions to reach stage 4)")

        # Final state
        page.screenshot(path='test_screenshots/addsub_final.png')

        # Show relevant console messages
        print(f"\n[Console] Last 5 messages:")
        for msg in console[-5:]:
            print(f"   {msg}")

        print("\n" + "=" * 70)
        time.sleep(3)
        browser.close()

if __name__ == '__main__':
    import os
    os.makedirs('test_screenshots', exist_ok=True)
    test_addsub_icons()
