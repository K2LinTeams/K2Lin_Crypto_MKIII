from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Set a large viewport to ensure desktop view
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()

    # Navigate to app
    page.goto("http://localhost:3000")

    # Wait for app to load.
    # The splash screen might take time.
    # Wait for the "Skip Intro" button if tutorial appears, or the main UI.

    # Try to skip tutorial. It might not be there if already skipped, but local storage should be clean in new context?
    # Actually, Playwright starts with fresh profile unless specified.
    # So Splash Screen -> Tutorial -> App

    # Wait for Splash Screen to finish or be clickable?
    # Splash screen lasts ~2.5s.
    time.sleep(3)

    # Check for Tutorial "Skip Intro"
    # Using get_by_title because button has title="Skip Intro" (from t('skip'))
    skip_btn = page.locator("button[title='Skip Intro']")
    if skip_btn.is_visible():
        skip_btn.click()

    # Wait for Settings button.
    # In App.tsx:
    # { id: 'settings', icon: Settings, label: 'Config' } (or t('config'))
    # The button has title={item.label} and aria-label={item.label}
    # But t('config') might be "Config" or "Settings"?
    # In en.json: "settings": "Settings" (Wait, t('settings') used? No.)
    # App.tsx: { id: 'settings', icon: Settings, label: 'Config' } -> actually the code says `label: t('config')` in mobile nav, but desktop nav uses:
    # { id: 'settings', icon: Settings, label: 'Config' } -> Wait, desktop map is:
    # { id: 'settings', icon: Settings, label: 'Config' }  <-- Hardcoded string 'Config' in the array map?
    # Let me re-read App.tsx carefully.

    # Desktop nav:
    # [ { ... label: t('vault') }, ... { id: 'settings', icon: Settings, label: 'Config' } ]
    # Wait, 'Config' is hardcoded?
    # No, let's look at the file content again.
    # Line 103: { id: 'settings', icon: Settings, label: 'Config' }
    # Ah, it seems hardcoded to 'Config' in the desktop nav array?
    # But mobile nav uses t('config').

    # Let's try locating by aria-label="Config"

    settings_btn = page.locator("button[aria-label='Config']")
    settings_btn.click()

    # Wait for Settings Panel header
    expect(page.get_by_text("System Configuration")).to_be_visible()

    # 1. Verify "Destory All Data" (Danger Zone) dialog
    danger_zone = page.locator(".glass-panel", has_text="Danger Zone")
    execute_btn = danger_zone.get_by_role("button", name="Execute")

    execute_btn.click()

    # Verify Dialog appears
    expect(page.get_by_text("Are you sure you want to wipe all data?")).to_be_visible()

    # Take screenshot of the dialog
    page.screenshot(path="verification/confirmation_dialog.png")

    # Click Cancel
    page.get_by_role("button", name="Cancel").click()

    # Verify dialog closed
    expect(page.get_by_text("Are you sure you want to wipe all data?")).not_to_be_visible()

    # 2. Verify PIN UI Reset
    # Find "Configure" for Panic Mode Pin
    configure_btn = page.get_by_role("button", name="Configure")
    configure_btn.click()

    # Check if input is visible
    input_field = page.get_by_placeholder("Enter PIN...")
    expect(input_field).to_be_visible()

    # Take screenshot of open state
    page.screenshot(path="verification/pin_open.png")

    # Enter a pin
    input_field.fill("1234")

    # Click Confirm
    confirm_btn = page.locator("button[aria-label='Confirm']")
    confirm_btn.click()

    # Verify it went back to "Configure"
    expect(configure_btn).to_be_visible()
    expect(input_field).not_to_be_visible()

    # Take screenshot of closed state
    page.screenshot(path="verification/pin_closed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
