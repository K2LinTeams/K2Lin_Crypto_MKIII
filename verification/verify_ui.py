from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:8080")

        # 1. Verify Title
        title = page.title()
        print(f"Page Title: {title}")
        if title != "Crypto3":
            print("FAILURE: Title not updated!")
        else:
            print("SUCCESS: Title is Crypto3")

        # 2. Verify Favicon
        # Check for link tag
        favicon_link = page.locator("link[rel='icon']")
        if favicon_link.count() > 0:
            href = favicon_link.get_attribute("href")
            print(f"Favicon href: {href}")
            if href == "/src/assets/electron.svg":
                print("SUCCESS: Favicon link found.")
            else:
                print("WARNING: Favicon href mismatch.")
        else:
            print("FAILURE: No favicon link found.")

        # 3. Verify Theme Persistence (Quick Check)
        # Assuming we are default 'sakura' now.
        theme = page.get_attribute("html", "data-theme")
        print(f"Current theme: {theme}")

        # Take screenshot
        page.screenshot(path="verification/ui_check.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
