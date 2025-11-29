from playwright.sync_api import sync_playwright

def verify_mobile_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 667})
        page = context.new_page()

        try:
            page.goto("http://localhost:3000")

            # Wait for content to load
            page.wait_for_selector("nav.md\:hidden button", timeout=5000)

            # Give it a moment for translations to hydrate if needed
            page.wait_for_timeout(2000)

            # Check button aria-labels
            # We expect: 'Crypt', 'Stego', 'ID', 'Config', 'Panic' (based on en.json)
            # The code uses item.label or item.id.

            expected_labels = ["Crypt", "Stego", "ID", "Config", "Panic"]

            nav = page.locator("nav.md\:hidden")
            buttons = nav.locator("button")

            for i, expected in enumerate(expected_labels):
                btn = buttons.nth(i)
                label = btn.get_attribute("aria-label")
                print(f"Button {i} ({expected}): {label}")

                if not label:
                    print(f"FAILED: Button {i} missing aria-label")
                elif label != expected:
                    print(f"WARNING: Button {i} label mismatch. Expected '{expected}', got '{label}'")
                else:
                    print(f"SUCCESS: Button {i} matches '{expected}'")

            # Check for clear button in Vault Panel
            # The clear button in VaultPanel uses t('clear') -> "Clear"

            # We need to make sure we are on the Vault tab (default)
            # Find the textarea
            textarea = page.locator("textarea").first
            # Find the clear button near it (in the input card)
            # In mobile view, it is in a flex container below the textarea

            # Look for button with aria-label='Clear'
            clear_btn = page.locator("button[aria-label='Clear']").first
            if clear_btn.is_visible():
                print("SUCCESS: Clear button found with aria-label='Clear'")
            else:
                 print("FAILED: Clear button not found or not visible")
                 # Debug: print all buttons in main content
                 print("Buttons in main:")
                 for b in page.locator("main button").all():
                     print(f" - aria-label: {b.get_attribute('aria-label')}, text: {b.inner_text()}")

            page.screenshot(path="verification/mobile_layout.png")
            print("Screenshot saved")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_mobile_layout()
