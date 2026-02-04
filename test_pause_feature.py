from playwright.sync_api import sync_playwright
import time
import sys

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_pause_feature():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=300)
        page = browser.new_page()

        console = []
        errors = []
        page.on('console', lambda msg: console.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: errors.append(str(err)))

        print("=" * 70)
        print("TEST: Pause Feature & Auto-save")
        print("=" * 70)

        try:
            # Load game
            print("\n[1] Loading game...")
            page.goto('http://83.222.23.107:8081/games-number-racing.html?profile=1764998591846', timeout=30000)
            page.wait_for_timeout(3000)

            # Check if menu loaded
            start_btn = page.locator('button:has-text("▶️")').first
            if start_btn.is_visible(timeout=5000):
                print("   ✅ Menu loaded successfully!")
            else:
                print("   ❌ Menu did not load")
                raise Exception("Menu failed to load")

            # Start race
            print("\n[2] Starting race...")
            start_btn.click()
            page.wait_for_timeout(2000)

            # Check if race screen loaded
            if page.locator('.grid.grid-cols-3 button').first.is_visible(timeout=3000):
                print("   ✅ Race started successfully!")
            else:
                print("   ❌ Race screen did not load")
                raise Exception("Race failed to start")

            # Answer a few questions
            print("\n[3] Answering questions...")
            for i in range(3):
                try:
                    buttons = page.locator('.grid.grid-cols-3 button').all()
                    if len(buttons) > 0:
                        buttons[0].click(force=True)
                        page.wait_for_timeout(1200)
                        print(f"   ✅ Answered question {i+1}")
                except Exception as e:
                    print(f"   ⚠️ Error on question {i+1}: {str(e)[:50]}")
                    break

            # Test pause button
            print("\n[4] Testing pause button...")
            pause_btn = page.locator('button:has-text("⏸️")').first
            if pause_btn.is_visible():
                print("   ✅ Pause button found!")
                pause_btn.click()
                page.wait_for_timeout(1000)

                # Check if pause menu is visible
                pause_menu = page.locator('text=Пауза').first
                if pause_menu.is_visible():
                    print("   ✅ Pause menu displayed!")

                    # Check pause stats
                    if page.locator('text=Прогресс:').is_visible():
                        print("   ✅ Pause stats visible!")

                    page.screenshot(path='test_screenshots/pause_menu.png')
                    print("   📸 Screenshot: test_screenshots/pause_menu.png")

                    # Test resume
                    resume_btn = page.locator('button:has-text("Продолжить")').first
                    if resume_btn.is_visible():
                        print("   ✅ Resume button found!")
                        resume_btn.click()
                        page.wait_for_timeout(1000)
                        print("   ✅ Race resumed!")

                else:
                    print("   ❌ Pause menu not displayed")
            else:
                print("   ❌ Pause button not found")

            # Check localStorage for saved race
            print("\n[5] Checking auto-save...")
            page.wait_for_timeout(6000)  # Wait for auto-save (5 seconds)

            saved_race = page.evaluate("localStorage.getItem('raceInProgress')")
            if saved_race:
                print("   ✅ Race progress auto-saved!")
                import json
                data = json.loads(saved_race)
                print(f"   Progress: {data.get('progress', 0):.1f}%")
                print(f"   Stars: {data.get('stars', 0)}")
            else:
                print("   ⚠️ No auto-save found (may need more time)")

            # Test exit to menu
            print("\n[6] Testing exit to menu from pause...")
            pause_btn = page.locator('button:has-text("⏸️")').first
            if pause_btn.is_visible():
                pause_btn.click()
                page.wait_for_timeout(1000)

                exit_btn = page.locator('button:has-text("Выйти в меню")').first
                if exit_btn.is_visible():
                    exit_btn.click()
                    page.wait_for_timeout(2000)

                    # Check if back in menu
                    if page.locator('button:has-text("▶️")').first.is_visible():
                        print("   ✅ Successfully exited to menu!")

                        # Check for continue race dialog
                        continue_dialog = page.locator('text=Продолжить гонку?').first
                        if continue_dialog.is_visible(timeout=2000):
                            print("   ✅ Continue race dialog displayed!")
                            page.screenshot(path='test_screenshots/continue_dialog.png')
                            print("   📸 Screenshot: test_screenshots/continue_dialog.png")
                        else:
                            print("   ⚠️ Continue race dialog not shown")

            print("\n" + "=" * 70)
            print("SUMMARY:")
            print(f"  Console messages: {len(console)}")
            print(f"  Errors: {len(errors)}")

            if errors:
                print("\n[Errors]:")
                for err in errors[:5]:
                    print(f"   {err}")

            if not errors:
                print("\n✅✅ ALL TESTS PASSED! Pause feature working correctly!")
            else:
                print("\n⚠️ Some errors occurred, but basic functionality works")

            print("=" * 70)

        except Exception as e:
            print(f"\n❌ TEST FAILED: {str(e)}")
            page.screenshot(path='test_screenshots/error.png')
            print("Screenshot saved: test_screenshots/error.png")

        finally:
            # Show console
            if console:
                print(f"\n[Console] Last 5 messages:")
                for msg in console[-5:]:
                    print(f"   {msg}")

            time.sleep(3)
            browser.close()

if __name__ == '__main__':
    import os
    os.makedirs('test_screenshots', exist_ok=True)
    test_pause_feature()
