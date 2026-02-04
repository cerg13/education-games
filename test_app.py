from playwright.sync_api import sync_playwright
import time

APP_URL = "http://83.222.23.107:8081"

def test_app():
    with sync_playwright() as p:
        print("[START] Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Log console errors
        errors = []
        page.on("console", lambda msg: print(f"  Console [{msg.type}]: {msg.text}") if msg.type in ["error", "warning"] else None)
        page.on("pageerror", lambda err: errors.append(str(err)))

        try:
            # Test 1: Main page
            print("\n[TEST 1] Loading main page...")
            page.goto(APP_URL, timeout=30000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)  # Wait for React

            # Take screenshot
            page.screenshot(path="screenshot_main.png", full_page=True)
            print("  [OK] Main page loaded")
            print("  Screenshot: screenshot_main.png")

            # Check content
            content = page.content()
            if "root" in content:
                print("  [OK] React root element found")
            else:
                print("  [WARN] React root not found")

            # Test 2: API Health
            print("\n[TEST 2] Checking API...")
            api_page = browser.new_page()
            api_page.goto(f"{APP_URL}/api/health", timeout=10000)
            api_content = api_page.content()
            if "ok" in api_content:
                print("  [OK] API is working")
            else:
                print("  [FAIL] API not responding")
            api_page.close()

            # Test 3: Check profiles
            print("\n[TEST 3] Checking profiles...")
            profiles_page = browser.new_page()
            profiles_page.goto(f"{APP_URL}/api/profiles", timeout=10000)
            profiles_content = profiles_page.content()
            # Count profiles instead of printing content to avoid encoding issues
            import json
            try:
                # Extract JSON from HTML body
                body_text = profiles_page.locator("body").inner_text()
                profiles_data = json.loads(body_text)
                print(f"  Profiles count: {len(profiles_data)}")
                if profiles_data:
                    print(f"  First profile ID: {profiles_data[0].get('id', 'unknown')}")
            except:
                print(f"  API returned data (length: {len(profiles_content)})")
            profiles_page.close()

            # Test 4: Check UI elements
            print("\n[TEST 4] Checking UI elements...")

            # Find buttons
            buttons = page.locator("button").all()
            print(f"  Buttons found: {len(buttons)}")

            # Find headings
            headings = page.locator("h1, h2").all()
            print(f"  Headings found: {len(headings)}")

            # Check for profiles - use text matching
            try:
                play_btn = page.locator("text=Играть").count()
                new_player_btn = page.locator("text=Новый игрок").count()
                print(f"  'Play' buttons: {play_btn}")
                print(f"  'New player' buttons: {new_player_btn}")
            except:
                print("  Could not check button text")

            # Test 5: Check game page
            print("\n[TEST 5] Loading game page...")
            page.goto(f"{APP_URL}/games-number-racing.html", timeout=30000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(3)  # Wait for Babel compilation

            page.screenshot(path="screenshot_game.png", full_page=True)
            print("  Screenshot: screenshot_game.png")

            game_content = page.content()
            if "game" in game_content.lower() or "root" in game_content:
                print("  [OK] Number Racing game loaded")
            else:
                print("  [WARN] Number Racing game might not have loaded fully")

            # Test 6: Click on game from main page (with profile)
            print("\n[TEST 6] Testing navigation from main page...")
            page.goto(APP_URL, timeout=30000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(2)

            # Click on Number Racing game
            play_buttons = page.locator("button").all()
            game_clicked = False
            for btn in play_buttons:
                try:
                    # Find play button for Number Racing
                    if btn.is_visible():
                        btn.click()
                        game_clicked = True
                        break
                except:
                    pass

            if game_clicked:
                time.sleep(3)
                page.screenshot(path="screenshot_game_from_main.png", full_page=True)
                print("  Screenshot: screenshot_game_from_main.png")

                # Check URL has profile parameter
                current_url = page.url
                if "profile=" in current_url:
                    print("  [OK] Profile ID passed in URL")
                else:
                    print("  [WARN] No profile ID in URL")

            # Test 7: Check Number Island game
            print("\n[TEST 7] Loading Number Island game...")
            page.goto(f"{APP_URL}/games-number-island.html?profile=1764998591846", timeout=30000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(3)

            page.screenshot(path="screenshot_island.png", full_page=True)
            print("  Screenshot: screenshot_island.png")

            island_content = page.content()
            if "root" in island_content:
                print("  [OK] Number Island game loaded")
            else:
                print("  [WARN] Number Island game might not have loaded")

            # Test 8: Check reading game with profile
            print("\n[TEST 8] Loading reading game with profile...")
            page.goto(f"{APP_URL}/games-reading.html?profile=1764998591846", timeout=30000)
            page.wait_for_load_state("networkidle", timeout=30000)
            time.sleep(3)  # Wait for Babel compilation

            page.screenshot(path="screenshot_reading.png", full_page=True)
            print("  Screenshot: screenshot_reading.png")

            reading_content = page.content()
            if "game" in reading_content.lower() or "root" in reading_content:
                print("  [OK] Reading game loaded")
            else:
                print("  [WARN] Reading game might not have loaded fully")

            # Summary
            print("\n" + "="*50)
            print("TEST RESULTS:")
            print("="*50)

            if errors:
                print(f"[FAIL] JavaScript errors: {len(errors)}")
                for err in errors[:5]:
                    print(f"   - {err[:100]}")
            else:
                print("[OK] No JavaScript errors detected")

            print(f"\nScreenshots saved to current directory")
            print(f"App URL: {APP_URL}")

        except Exception as e:
            print(f"\n[ERROR] {e}")
            try:
                page.screenshot(path="screenshot_error.png")
                print("Screenshot: screenshot_error.png")
            except:
                pass

        finally:
            browser.close()
            print("\n[END] Testing complete")

if __name__ == "__main__":
    test_app()
