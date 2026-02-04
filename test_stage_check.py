from playwright.sync_api import sync_playwright
import time, sys

if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # Load game
    page.goto('http://83.222.23.107:8081/games-number-racing.html?profile=1764998591846', timeout=30000)
    page.wait_for_timeout(3000)

    print("=" * 70)
    print("ПРОВЕРКА ЭТАПА ОБУЧЕНИЯ")
    print("=" * 70)

    # Check which stage is shown
    stages = [
        'Считаем до 3',
        'Сравниваем числа',
        'Последовательности',
        'Сложение и вычитание'
    ]

    for i, stage_name in enumerate(stages, 1):
        if page.locator(f'text="{stage_name}"').first.is_visible():
            if i == 1:
                print(f"\n✅ ИСПРАВЛЕНО! Показывает этап 1: '{stage_name}'")
            else:
                print(f"\n❌ ОШИБКА! Показывает этап {i}: '{stage_name}'")
            break

    page.screenshot(path='test_screenshots/stage_indicator.png')
    print("\nСкриншот: test_screenshots/stage_indicator.png")

    # Start race and check task type
    print("\nНачинаем гонку для проверки заданий...")
    page.locator('button:has-text("▶️")').first.click()
    page.wait_for_timeout(2000)

    # Check if numbers are small (1-3 for stage 1)
    page.screenshot(path='test_screenshots/first_task.png')
    print("Скриншот первого задания: test_screenshots/first_task.png")

    print("\n" + "=" * 70)
    time.sleep(2)
    browser.close()
