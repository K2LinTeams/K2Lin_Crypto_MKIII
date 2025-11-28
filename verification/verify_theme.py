from playwright.sync_api import sync_playwright

def verify_theme_persistence():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:8080")

        # Wait for app to load (skip splash/tutorial if needed)
        # Assuming tutorial might appear if not skipped
        try:
            page.wait_for_selector("text=Welcome to Crypto3!", timeout=5000)
            print("Tutorial found, skipping...")
            page.click("button[title='Skip Intro']")
        except:
            print("Tutorial not found or timed out, assuming main screen.")

        # 1. Check default theme (should be sakura)
        print("Checking default theme...")
        # We can check the data-theme attribute on html element
        theme_attr = page.get_attribute("html", "data-theme")
        print(f"Initial theme: {theme_attr}")

        # 2. Change theme to something else (e.g., cyberpunk)
        # Need to navigate to settings
        print("Navigating to Settings...")
        # Desktop sidebar button for Settings (Config)
        # Using the icon logic or text.
        # Based on code: { id: 'settings', icon: Settings, label: 'Config' }
        # Mobile label is 'config', desktop label is 'Config' in the code array
        # But wait, desktop sidebar buttons have no visible text?
        # "hidden md:flex" sidebar:
        # <button ...> <Settings size={22} ... /> </button>
        # The button has no text inside on desktop, only icon.
        # But we can find by index or maybe title? No title prop on the button itself in the loop?
        # Let's use the button index. Settings is the 4th item in the list (index 3).

        # Actually, let's use the click handler by finding the button that sets activeTab='settings'.
        # We can try to click the 4th button in the sidebar.

        # Wait, the sidebar code:
        # { id: 'settings', icon: Settings, label: 'Config' }
        # It's the 4th item.

        # Let's try locating by the icon svg class if possible, or just nth-child.
        # Or better, we can evaluate JS to click it or set the state? No, stick to UI interaction.

        # Trying to find the button with the Settings icon.
        # Since lucide-react renders SVGs, maybe we can find the SVG with distinct class? No distinct class.
        # Let's use `page.locator('nav >> button').nth(3)` - wait, first is shield logo div, then div with buttons.
        # The buttons are inside a div: `div.flex-1.flex.flex-col...`
        # Let's try to locate the nav button collection.

        # Easier: The mobile nav has text labels!
        # If we are in desktop view (1280px wide), we use desktop nav.
        # The desktop buttons have an aria-label? No.
        # They have a key `item.id`.

        # Let's try to find the button by the text "Config" if it exists?
        # <span className="hidden md:inline">{t('systemSecure')}</span>
        # The sidebar buttons:
        # {activeTab === item.id && ( ... indicator ... )}
        # No text content for buttons in desktop sidebar.

        # Let's look for the 4th button in the sidebar container.
        # Sidebar is `nav.hidden.md:flex`
        print("Clicking Settings button...")
        settings_btn = page.locator("nav.md:flex button").nth(3) # 0:vault, 1:mimic, 2:identity, 3:settings
        settings_btn.click()

        # Verify we are in settings
        # Look for "Theme Selection" or similar text
        page.wait_for_selector("text=Sakura") # Sakura is the current theme name likely displayed

        # 3. Select 'Cyberpunk' theme
        print("Selecting Cyberpunk theme...")
        # Assuming there are buttons or a dropdown for theme.
        # SettingsPanel code isn't fully visible but usually has buttons for themes.
        # Let's assume there's a button with text "Cyberpunk" or "Midnight" or similar.
        # Based on ThemeContext types: 'cyberpunk' | 'light' | 'midnight' | 'sakura'
        # Let's try clicking the text "Cyberpunk"
        page.click("text=Cyberpunk")

        # Verify theme changed
        new_theme = page.get_attribute("html", "data-theme")
        print(f"Theme changed to: {new_theme}")

        if new_theme != "cyberpunk":
             print("Failed to change theme!")
             # Try another strategy or debugging
             page.screenshot(path="verification/theme_change_fail.png")
             return

        # 4. Reload the page
        print("Reloading page...")
        page.reload()

        # Wait for load
        # page.wait_for_selector("text=Welcome to Crypto3!", timeout=5000) # Splash/Tutorial might show up again
        # Actually tutorial shows up if not skipped/completed.
        # We might need to skip splash again? Splash is auto-dismissed after 2.5s.
        print("Waiting for splash...")
        page.wait_for_timeout(3000)

        # 5. Verify theme persists
        print("Verifying theme persistence...")
        persisted_theme = page.get_attribute("html", "data-theme")
        print(f"Persisted theme after reload: {persisted_theme}")

        if persisted_theme == "cyberpunk":
            print("SUCCESS: Theme persisted correctly.")
            page.screenshot(path="verification/theme_success.png")
        else:
            print(f"FAILURE: Theme reset to {persisted_theme}")
            page.screenshot(path="verification/theme_fail.png")

        browser.close()

if __name__ == "__main__":
    verify_theme_persistence()
