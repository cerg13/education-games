from playwright.sync_api import sync_playwright
import time
import sys

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_finish_and_stage():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=300)
        page = browser.new_page()

        console = []
        page.on('console', lambda msg: console.append(f"[{msg.type}] {msg.text}"))

        print("=" * 70)
        print("TEST: Finish Screen & Learning Stage Fix")
        print("=" * 70)

        # Load with profile
        page.goto('http://83.222.23.107:8081/games-number-racing.html?profile=1764998591846', timeout=30000)
        page.wait_for_timeout(3000)

        # Check learning stage indicator
        print(f"\n[1] Checking learning stage on menu...")
        stage_text = page.locator('text="Считаем до 3"').first
        if stage_text.is_visible():
            print(f"   ✅ Learning Stage 1 displayed correctly!")
        else:
            # Try to find any stage text
            for stage_name in ['Считаем до 3', 'Сравниваем числа', 'Последовательности', 'Сложение и вычитание']:
                if page.locator(f'text="{stage_name}"').first.is_visible():
                    print(f"   ❌ WRONG! Showing: {stage_name}")
                    break
            else:
                print(f"   ⚠️ No stage indicator found")

        page.screenshot(path='test_screenshots/menu_stage1.png')

        # Start race
        print(f"\n[2] Starting race...")
        start_btn = page.locator('button:has-text("▶️")').first
        start_btn.click()
        page.wait_for_timeout(2000)

        # Answer questions correctly until finish (need 6 correct answers to reach 100%)
        print(f"\n[3] Answering questions to win...")
        for i in range(10):  # Try up to 10 answers
            try:
                # Check if we're still in race
                if not page.locator('.grid.grid-cols-3 button').first.is_visible(timeout=2000):
                    print(f"   Race ended after {i} answers")
                    break

                # Find correct answer by checking number line highlight
                # Or just click first button and hope for the best
                buttons = page.locator('.grid.grid-cols-3 button').all()
                if len(buttons) > 0:
                    # Try each button until we get correct
                    for btn in buttons:
                        btn.click(force=True)
                        page.wait_for_timeout(1200)

                        # Check if celebration emoji appeared (correct answer)
                        if page.locator('text=🎉').is_visible():
                            print(f"   ✅ Answer {i+1} correct!")
                            break
                        elif page.locator('text=🙈').is_visible():
                            # Wrong, already clicked, wait and continue
                            page.wait_for_timeout(800)
                            continue
                        break  # Move to next question
            except Exception as e:
                print(f"   Error on question {i+1}: {str(e)[:50]}")
                break

        page.wait_for_timeout(3000)

        # Check for finish screen
        print(f"\n[4] Checking for finish screen...")
        victory = page.locator('text=ПОБЕДА').first
        trophy = page.locator('text=🏆').first

        if victory.is_visible() or trophy.is_visible():
            print(f"   ✅ FINISH SCREEN DISPLAYED!")
            page.screenshot(path='test_screenshots/finish_screen.png')
        else:
            # Check what screen we're on
            body = page.locator('body').text_content()
            if len(body) < 100:
                print(f"   ❌ WHITE SCREEN! Only {len(body)} chars")
            else:
                print(f"   ⚠️ Different screen (not finish)")
                print(f"      Content preview: {body[:200]}")

        page.screenshot(path='test_screenshots/final_state.png')

        # Show console
        print(f"\n[Console] Last 5 messages:")
        for msg in console[-5:]:
            print(f"   {msg}")

        print("\n" + "=" * 70)
        time.sleep(3)
        browser.close()

if __name__ == '__main__':
    import os
    os.makedirs('test_screenshots', exist_ok=True)
    test_finish_and_stage()
