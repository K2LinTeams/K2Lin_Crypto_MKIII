from playwright.sync_api import sync_playwright

def verify_crypto_migration():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        print("Navigating...")
        page.goto("http://localhost:3000")

        # Wait for potential Splash Screen
        page.wait_for_timeout(3000)

        # Handle Tutorial
        # Try to find the close button (X) in the modal
        # Or just click outside?
        # Let's try to find the modal and close it.
        # The modal likely has a Close button.
        try:
            # Look for the close button (usually top right X)
            # Assuming it might be a button with an X icon.
            # Or we can just click "Next" until finished? No, that takes too long.
            # Let's try to click the body to dismiss if it's not blocking?
            # Or look for a button with class that looks like close.
            # In GlassComponents, it might be just an icon.

            # Let's try pressing Escape.
            page.keyboard.press("Escape")
            print("Pressed Escape to close modal.")
            page.wait_for_timeout(1000)
        except:
            print("Error closing modal.")

        # Check if modal is gone.
        # If "Welcome to Crypto3" is still visible, try clicking the X button.
        if page.locator("text=Welcome to Crypto3").is_visible():
             print("Modal still visible. Trying to find close button...")
             # Try clicking the SVG close icon.
             # It's usually in absolute top right.
             # Let's try a generic locator for the close button.
             # Often it's the first button in the dialog or similar.
             # Let's try locator("button").first ?
             # Or click the backdrop?

             # Actually, let's just use localStorage to disable it!
             # Ideally we do this before loading the page, but we are already here.
             # We can inject javascript to set localStorage and reload.
             print("Setting localStorage to skip tutorial...")
             page.evaluate("localStorage.setItem('hasSeenTutorial', 'true')")
             page.reload()
             page.wait_for_timeout(2000)

        # 1. Verify Vault Panel Texts (ECC)
        print("Verifying Vault Panel texts...")
        # The switch should say "Asymmetric (ECC)"
        # Note: Text might be split or styled.
        # Using strict text match might fail if there's whitespace.
        expect_text = "Asymmetric (ECC)"

        try:
             page.wait_for_selector(f"text={expect_text}", timeout=5000)
             print(f"Found '{expect_text}'!")
        except:
             print(f"Could not find '{expect_text}'. Dumping content...")
             # print(page.content())

        page.screenshot(path="verification/vault_ecc.png")
        print("Vault ECC screenshot captured.")

        # 2. Verify Identity Panel
        print("Navigate to Identity Panel...")
        # Sidebar buttons.
        # 2nd button.
        page.evaluate("document.querySelectorAll('nav button')[1].click()")
        page.wait_for_timeout(1000)

        # Check text "Digital Identity"
        if page.locator("text=Digital Identity").is_visible():
            print("Identity Panel Loaded.")
        else:
            print("Identity Panel NOT loaded.")

        # Check "Generate Identity" button text or context
        # Generate Identity -> "Generate Secure X25519 keypair" in description
        # We updated "noIdentity" string: "Generate a secure X25519 keypair..."
        if page.locator("text=X25519").is_visible():
             print("Found X25519 reference in Identity Panel.")

        # Generate Identity
        print("Generating Identity...")
        page.get_by_text("Generate Identity").click()
        page.wait_for_timeout(2000) # Wait for generation

        # We should see the card now.
        # We can't easily verify the canvas text with playwright selectors (it's pixels).
        # But we can verify the text under it if any.
        # We can just take a screenshot.
        page.screenshot(path="verification/identity_ecc.png")
        print("Identity ECC screenshot captured.")

        # 3. Encyclopedia
        print("Navigate to Encyclopedia...")
        # Go to settings (4th button usually)
        page.evaluate("document.querySelectorAll('nav button')[3].click()")
        page.wait_for_timeout(1000)

        # Click Replay Tutorial
        if page.locator("text=Replay Tutorial").is_visible():
             page.get_by_text("Replay Tutorial").click()
             page.wait_for_timeout(1000)

             # Click Access PRTS Archives
             page.get_by_text("Access PRTS Archives").click()
             page.wait_for_timeout(1000)

             # Verify "ECC Protocols" tab
             if page.locator("text=ECC Protocols").is_visible():
                 print("Found 'ECC Protocols' tab.")
                 page.get_by_text("ECC Protocols").click()
                 page.wait_for_timeout(500)
                 page.screenshot(path="verification/encyclopedia_ecc.png")
             else:
                 print("'ECC Protocols' tab not found.")
        else:
             print("Replay Tutorial button not found.")

        browser.close()

if __name__ == "__main__":
    verify_crypto_migration()
