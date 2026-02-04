from playwright.sync_api import sync_playwright
import time
import sys

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def test_profile():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()

        console = []
        page.on('console', lambda msg: console.append(f"[{msg.type}] {msg.text}"))

        print("=" * 70)
        print("FINAL TEST: Profile Loading")
        print("=" * 70)

        # Load with profile
        page.goto('http://83.222.23.107:8081/games-number-racing.html?profile=1764998591846', timeout=30000)
        page.wait_for_timeout(5000)

        # Check for menu buttons
        start_btn = page.locator('button:has-text("▶️")')
        garage_btn = page.locator('button:has-text("🚗")')
        stats_btn = page.locator('button:has-text("📊")')

        print(f"\n[Screen Check]")
        print(f"   Start button visible: {start_btn.is_visible()}")
        print(f"   Garage button visible: {garage_btn.is_visible()}")
        print(f"   Stats button visible: {stats_btn.is_visible()}")

        # Count total buttons
        total_buttons = page.locator('button').count()
        print(f"   Total buttons: {total_buttons}")

        if start_btn.is_visible() and total_buttons >= 3:
            print(f"\n✅ SUCCESS: Menu screen loaded correctly!")
        else:
            print(f"\n❌ FAIL: Screen not loaded correctly")

        # Screenshot
        page.screenshot(path='test_screenshots/profile_final.png', full_page=True)

        # Show console
        print(f"\n[Console] {len(console)} messages:")
        for msg in console[-5:]:
            print(f"   {msg}")

        print("\n" + "=" * 70)
        time.sleep(3)
        browser.close()

if __name__ == '__main__':
    import os
    os.makedirs('test_screenshots', exist_ok=True)
    test_profile()
