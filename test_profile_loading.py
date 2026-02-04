from playwright.sync_api import sync_playwright
import time
import sys

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_profile_loading():
    """Test loading game with profile parameter"""

    print("Testing Profile Loading Bug")
    print("=" * 70)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()

        # Listen for all console messages
        console_messages = []
        page.on('console', lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: console_messages.append(f"[PAGE ERROR] {err}"))

        # Listen for network requests
        network_errors = []
        page.on('requestfailed', lambda request: network_errors.append(f"Failed: {request.url} - {request.failure}"))

        try:
            # Test with profile parameter
            profile_url = 'http://83.222.23.107:8081/games-number-racing.html?profile=1764998591846'
            print(f"\n[Test 1] Loading game with profile parameter...")
            print(f"   URL: {profile_url}")

            page.goto(profile_url, timeout=30000)
            page.wait_for_timeout(5000)  # Wait longer for async loading

            # Check for white screen
            body_text = page.locator('body').text_content()
            visible_text_length = len(body_text.strip()) if body_text else 0

            print(f"\n[Results]")
            print(f"   Body text length: {visible_text_length} characters")

            if visible_text_length < 100:
                print(f"   [FAIL] WHITE SCREEN DETECTED!")
                print(f"   Body content: '{body_text[:200] if body_text else 'EMPTY'}'")
            else:
                print(f"   [OK] Page has content")

            # Take screenshot
            page.screenshot(path='test_screenshots/profile_loading.png', full_page=True)
            print(f"   Screenshot saved: profile_loading.png")

            # Check for loading indicator
            loading_car = page.locator('text=🏎️').first
            if loading_car.is_visible():
                print(f"   [WARN] Loading indicator still visible - might be stuck!")

            # Check console messages
            print(f"\n[Console Messages] Found {len(console_messages)} messages:")
            for msg in console_messages[:10]:
                print(f"   {msg}")

            # Check network errors
            if network_errors:
                print(f"\n[Network Errors] Found {len(network_errors)} errors:")
                for err in network_errors[:5]:
                    print(f"   {err}")

            # Try to get profiles via API directly
            print(f"\n[Test 2] Checking API /api/profiles...")
            api_response = page.goto('http://83.222.23.107:8081/api/profiles')
            if api_response.ok:
                profiles = api_response.json()
                print(f"   [OK] API responded with {len(profiles)} profiles")

                # Find our profile
                target_profile = None
                for prof in profiles:
                    if str(prof.get('id')) == '1764998591846':
                        target_profile = prof
                        break

                if target_profile:
                    print(f"   [OK] Profile found: {target_profile.get('name', 'Unknown')}")
                    print(f"        Stars: {target_profile.get('stars', 0)}")
                    print(f"        Has numberRacingData: {bool(target_profile.get('numberRacingData'))}")

                    if target_profile.get('numberRacingData'):
                        nrd = target_profile['numberRacingData']
                        print(f"        Learning Stage: {nrd.get('learningStage', 'N/A')}")
                        print(f"        Difficulty: {nrd.get('difficulty', 'N/A')}")
                else:
                    print(f"   [WARN] Profile 1764998591846 NOT FOUND in profiles")
            else:
                print(f"   [FAIL] API error: {api_response.status}")

            print("\n" + "=" * 70)
            print("Waiting 5 seconds to observe...")
            page.wait_for_timeout(5000)

        except Exception as e:
            print(f"\n[ERROR] Exception: {str(e)}")
            page.screenshot(path='test_screenshots/profile_error.png', full_page=True)

            # Print console for debugging
            print(f"\n[Console at error]:")
            for msg in console_messages[-10:]:
                print(f"   {msg}")
            raise

        finally:
            print("\nClosing browser in 3 seconds...")
            time.sleep(3)
            browser.close()

if __name__ == '__main__':
    import os
    os.makedirs('test_screenshots', exist_ok=True)
    test_profile_loading()
