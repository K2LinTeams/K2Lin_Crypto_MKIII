from playwright.sync_api import sync_playwright, expect
import time

def verify_headers():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a desktop viewport to ensure side nav is visible
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # 1. Load the app
        print("Loading app...")
        page.goto("http://localhost:3000")

        # 2. Wait for Splash Screen (approx 2.5s)
        print("Waiting for Splash Screen...")
        time.sleep(3)

        # 3. Skip Tutorial if present
        try:
            skip_button = page.get_by_text("Skip Intro")
            if skip_button.is_visible():
                skip_button.click()
                print("Clicked Skip Intro")
        except Exception as e:
            print("Tutorial modal skipped or not found:", e)

        time.sleep(1) # Wait for animation

        # 4. Verify Vault Panel Header
        print("Verifying Vault Panel...")
        # Vault is usually the default active tab.
        # Title: "Cryptographic Vault"
        expect(page.get_by_role("heading", name="Cryptographic Vault")).to_be_visible()
        expect(page.get_by_text("Securely encrypt and decrypt messages using AES-256-GCM or ECC-X25519.")).to_be_visible()
        page.screenshot(path="verification/vault_panel.png")
        print("Vault Panel Verified.")

        # 5. Verify Identity Panel Header
        print("Verifying Identity Panel...")
        # Nav Button: "ID" (from en.json common.identity)
        page.get_by_role("button", name="ID").click()
        time.sleep(0.5)

        # Title: "Digital Identity"
        expect(page.get_by_role("heading", name="Digital Identity")).to_be_visible()
        expect(page.get_by_text("Manage your cryptographic identity and verified contacts.")).to_be_visible()
        page.screenshot(path="verification/identity_panel.png")
        print("Identity Panel Verified.")

        # 6. Verify Mimic Panel Header
        print("Verifying Mimic Panel...")
        # Nav Button: "Stego" (from en.json common.mimic)
        page.get_by_role("button", name="Stego").click()
        time.sleep(0.5)

        # Title: "LSB Steganography Lab"
        expect(page.get_by_role("heading", name="LSB Steganography Lab")).to_be_visible()
        expect(page.get_by_text("Hide encrypted payloads inside innocuous images.")).to_be_visible()
        page.screenshot(path="verification/mimic_panel.png")
        print("Mimic Panel Verified.")

        # 7. Verify Settings Panel Header
        print("Verifying Settings Panel...")
        # Nav Button: "Config" (from en.json common.config)
        page.get_by_role("button", name="Config").click()
        time.sleep(0.5)

        # Title: "System Configuration"
        expect(page.get_by_role("heading", name="System Configuration")).to_be_visible()
        expect(page.get_by_text("Customize your interface, manage data, and view achievements.")).to_be_visible()
        page.screenshot(path="verification/settings_panel.png")
        print("Settings Panel Verified.")

        browser.close()

if __name__ == "__main__":
    verify_headers()
