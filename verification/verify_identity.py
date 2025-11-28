from playwright.sync_api import sync_playwright

def verify_identity_and_fonts():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        page.goto("http://localhost:3000")
        page.wait_for_timeout(2000)

        # 1. Verify Font Loading (Comfortaa)
        header = page.locator("h1").first
        font_family = header.evaluate("el => window.getComputedStyle(el).fontFamily")
        print(f"Header Font Family: {font_family}")

        print("Clicking Identity Tab (index 2)...")
        # Try to click the button by index
        page.locator("nav.hidden button").nth(2).click()
        page.wait_for_timeout(2000)

        # Debug: Print what h2s are visible
        visible_h2s = page.locator("h2").all_inner_texts()
        print(f"Visible H2s: {visible_h2s}")

        if not any("Digital Identity" in text for text in visible_h2s):
             print("FAIL: Identity panel did not load. Trying to click again using icon selector logic...")
             # Maybe the index is wrong?
             # Vault (0), Mimic (1), Identity (2), Settings (3)
             # Let's try to find the button containing the User icon? Playwright can't easily see icons.
             # Let's try clicking all buttons in nav to see what happens? No that's chaotic.
             # Let's take a screenshot of current state
             page.screenshot(path="verification/debug_nav_failure.png")
             print("Saved debug_nav_failure.png")
        else:
             print("Identity Panel Loaded")
             page.screenshot(path="verification/identity_panel_empty.png")

             print("Generating Identity...")
             btn = page.locator("button", has_text="Generate Identity")
             if btn.is_visible():
                btn.click()
                page.locator("button", has_text="Download Card").wait_for(state="visible", timeout=15000)
                print("Identity Card Generated")
                page.screenshot(path="verification/identity_panel_generated.png")
             else:
                print("Generate button not visible")

        browser.close()

if __name__ == "__main__":
    verify_identity_and_fonts()
