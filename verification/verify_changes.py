from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to a typical desktop size to ensure sidebar is visible
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        # 1. Navigate to the app (served by http-server)
        page.goto("http://localhost:5000")
        page.wait_for_timeout(2000) # Wait for initial load

        # 2. Verify Theme (Sakura default)
        # Check if the body or root has data-theme="sakura"
        theme = page.evaluate("document.documentElement.getAttribute('data-theme')")
        print(f"Current theme: {theme}")

        # Take screenshot of Vault (default view)
        page.screenshot(path="verification/1_vault_sakura.png")

        # 3. Verify Mimic Panel i18n
        # Click the Mimic button using the icon locator or position since text is hidden on desktop
        # In App.tsx, the Mimic button is the second one in the list.
        # Icons are: Vault (Lock), Mimic (ImageIcon), Settings (Settings)
        # We can find button that contains the icon.

        # Or just use the nth button in the nav.
        # The nav has 4 buttons (Vault, Mimic, Config, Panic)
        # nth(1) should be Mimic

        # Wait for the nav to be visible
        page.locator("nav.hidden.md\\:flex button").nth(1).click()
        page.wait_for_timeout(1000)

        # Check for localized texts in Mimic Panel
        # "Configuration" -> "Configuration" (key: config)
        # "Extraction" -> "Extraction" (key: extraction)
        # "Manual Embed" -> "Manual Embed" (key: manualEmbed)
        # "Secret Payload" -> "Secret Payload" (key: secretPayload)

        # We can assert these texts are present.
        # Taking a screenshot is also good.
        page.screenshot(path="verification/2_mimic_panel.png")

        # 4. Verify Panic Mode PIN Settings
        # Click Settings (3rd button)
        page.locator("nav.hidden.md\\:flex button").nth(2).click()
        page.wait_for_timeout(1000)

        page.screenshot(path="verification/3_settings_panel.png")

        # Open PIN config
        # Find the "Configure" button. There might be multiple?
        # In SettingsPanel, there is one for Clipboard Monitor (toggle?) and one for Panic Mode Pin (button).
        # Actually Clipboard monitor uses a toggle div. Panic Mode Pin uses GlassButton with "Configure".
        # So "Configure" text should be unique to Panic Pin (or themes, but themes use buttons with theme names).
        # Wait, theme buttons have theme names.

        page.get_by_role("button", name="Configure").click()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/4_pin_config_open.png")

        # Enter PIN
        # Note: I changed the key to "enterKeyShort" which translates to "Enter PIN..." in settings namespace.
        # So the placeholder is now "Enter PIN..."
        page.get_by_placeholder("Enter PIN...").fill("1234")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/5_pin_entered.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
