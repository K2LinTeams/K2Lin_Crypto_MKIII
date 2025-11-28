from playwright.sync_api import sync_playwright

def verify_crypto_debug():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        print("Navigating...")
        page.goto("http://localhost:3000")

        print("Waiting 5s...")
        page.wait_for_timeout(5000)

        # Take a screenshot to see what's happening
        page.screenshot(path="verification/debug_screen.png")
        print("Debug screenshot captured.")

        # Print page content
        content = page.content()
        # print(content[:1000]) # First 1000 chars

        browser.close()

if __name__ == "__main__":
    verify_crypto_debug()
