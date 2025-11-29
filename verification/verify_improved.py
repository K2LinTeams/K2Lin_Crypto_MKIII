from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Set a large viewport
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()

    print("Navigating to app...")
    page.goto("http://localhost:3000")

    # Give it a moment to load
    time.sleep(3)

    # Try to skip tutorial
    print("Checking for tutorial...")
    try:
        skip_btn = page.locator("button[title='Skip Intro']")
        if skip_btn.is_visible(timeout=2000):
            skip_btn.click()
            print("Skipped tutorial.")
        else:
            print("No tutorial skip button found (maybe already hidden).")
    except Exception as e:
        print(f"Error checking tutorial: {e}")

    # Open Settings
    print("Opening Settings...")
    try:
        # Try finding by text "Config" if aria-label fails, or check the DOM
        # In desktop nav: { label: 'Config' }
        settings_btn = page.locator("button[aria-label='Config']")
        if not settings_btn.is_visible():
             # Fallback to text
             settings_btn = page.get_by_text("Config")

        settings_btn.click()
        print("Settings button clicked.")
    except Exception as e:
        print(f"Failed to click Settings: {e}")
        page.screenshot(path="verification/failed_settings_click.png")
        browser.close()
        return

    # Wait for Settings Panel
    try:
        expect(page.get_by_text("System Configuration")).to_be_visible()
        print("Settings Panel visible.")
    except:
        print("Settings Panel not visible.")
        page.screenshot(path="verification/failed_settings_open.png")
        browser.close()
        return

    # 1. Verify "Execute" (Wipe Data) Dialog
    print("Testing Wipe Data Dialog...")
    try:
        danger_zone = page.locator(".glass-panel", has_text="Danger Zone")
        execute_btn = danger_zone.get_by_role("button", name="Execute")
        execute_btn.scroll_into_view_if_needed()
        execute_btn.click()

        # Verify Dialog appears
        # Now searching for "Are you sure you want to wipe all data?"
        # It should be in a fixed overlay (Portal)
        dialog_text = page.get_by_text("Are you sure you want to wipe all data?")
        expect(dialog_text).to_be_visible()
        print("Confirmation Dialog appeared.")

        # Screenshot
        page.screenshot(path="verification/confirmation_dialog_success.png")

        # Click Cancel
        page.get_by_role("button", name="Cancel").click()
        expect(dialog_text).not_to_be_visible()
        print("Confirmation Dialog closed.")

    except Exception as e:
        print(f"Wipe Data Dialog failed: {e}")
        page.screenshot(path="verification/failed_wipe_dialog.png")

    # 2. Verify PIN UI Reset
    print("Testing PIN UI Reset...")
    try:
        configure_btn = page.get_by_role("button", name="Configure")
        if not configure_btn.is_visible():
             # Scroll to it?
             configure_btn.scroll_into_view_if_needed()

        configure_btn.click()
        print("Clicked Configure.")

        # Check input
        input_field = page.get_by_placeholder("Enter PIN...")
        expect(input_field).to_be_visible()

        # Screenshot open
        page.screenshot(path="verification/pin_ui_open.png")

        # Enter PIN
        input_field.fill("1234")

        # Click Confirm
        confirm_btn = page.locator("button[aria-label='Confirm']")
        confirm_btn.click()
        print("Clicked Confirm.")

        # Verify reset
        # Expect "Configure" button to be visible again
        # Expect input to be hidden
        # Wait a bit for animation
        time.sleep(1)
        expect(configure_btn).to_be_visible()
        expect(input_field).not_to_be_visible()
        print("PIN UI reset successfully.")

        # Screenshot closed
        page.screenshot(path="verification/pin_ui_closed.png")

    except Exception as e:
        print(f"PIN UI Reset failed: {e}")
        page.screenshot(path="verification/failed_pin_reset.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
