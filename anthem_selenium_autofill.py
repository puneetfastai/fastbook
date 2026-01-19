#!/usr/bin/env python3
"""
Anthem Claims Auto-Filler - Selenium Version

This script uses Selenium to automatically navigate and fill Anthem claims forms
using your existing logged-in browser session.

SETUP:
1. Make sure Chrome is installed
2. Install dependencies: pip install selenium webdriver-manager
3. Log into Anthem manually in Chrome
4. Run this script

USAGE:
    python3 anthem_selenium_autofill.py
"""

import json
import time
import sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# ============================================================================
# CONFIGURATION
# ============================================================================

CLAIMS_OUTPUT_DIR = Path("./claims_output")
PT_BILLS_DIR = Path("./pt_bills")

# Load extracted claim data
def load_claims():
    """Load all extracted claims from JSON files"""
    claims = []
    json_files = list(CLAIMS_OUTPUT_DIR.glob("*_extracted.json"))

    for json_file in json_files:
        with open(json_file) as f:
            claim = json.load(f)
            claims.append(claim)

    return claims

# ============================================================================
# ANTHEM AUTO-FILLER CLASS
# ============================================================================

class AnthemAutoFiller:
    def __init__(self, use_existing_session=False):
        self.driver = None
        self.wait = None
        self.use_existing_session = use_existing_session

    def start_browser(self):
        """Start Chrome browser"""
        print("🌐 Starting Chrome browser...")

        options = Options()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')

        # Keep browser open after script ends
        options.add_experimental_option("detach", True)

        # If you want to use your existing Chrome profile (with saved login):
        # options.add_argument("user-data-dir=/path/to/your/Chrome/Profile")

        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.wait = WebDriverWait(self.driver, 10)

        print("✓ Browser started")

    def navigate_to_claims(self):
        """Navigate to Anthem claims page"""
        print("\n📍 Navigating to Anthem claims page...")

        claims_url = "https://membersecure.anthem.com/member/claims"
        self.driver.get(claims_url)

        print("⚠️  Please log in to Anthem if you're not already logged in")
        input("Press Enter after you're logged in and on the claims page...")

    def find_element_flexible(self, selectors, timeout=5):
        """Try multiple selectors to find an element"""
        for selector in selectors:
            try:
                element = WebDriverWait(self.driver, timeout).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                return element
            except TimeoutException:
                continue
        return None

    def find_elements_flexible(self, selectors):
        """Try multiple selectors to find elements"""
        for selector in selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    return elements
            except:
                continue
        return []

    def click_get_started(self):
        """Click the 'Get Started' button to begin filing a claim"""
        print("\n🔍 Looking for 'Get Started' button...")

        button = self.find_element_flexible([
            'button.claim-card-btn',
            '.claim-card-btn',
            'button[class*="claim"][class*="btn"]',
            'button:contains("Get Started")'
        ])

        if not button:
            # Try finding by text
            buttons = self.driver.find_elements(By.TAG_NAME, 'button')
            for btn in buttons:
                if 'Get Started' in btn.text or 'File a Claim' in btn.text:
                    button = btn
                    break

        if not button:
            print("❌ Could not find 'Get Started' button")
            print("Please click the button manually to start filing a claim")
            input("Press Enter after clicking 'Get Started'...")
            return

        print(f"✓ Found button: {button.text}")
        button.click()
        time.sleep(2)  # Wait for form to load
        print("✓ Clicked 'Get Started'")

    def fill_field(self, element, value, field_name=""):
        """Fill a form field with value"""
        try:
            # Scroll element into view
            self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
            time.sleep(0.3)

            # Clear existing value
            element.clear()

            # Fill with new value
            element.send_keys(str(value))

            print(f"  ✓ Filled {field_name}: {value}")
            return True
        except Exception as e:
            print(f"  ❌ Failed to fill {field_name}: {e}")
            return False

    def fill_claim_form(self, claim):
        """Fill the claims form with extracted data"""
        print(f"\n📝 Filling claim form...")
        print(f"   Invoice: {claim.get('invoice_number', 'N/A')}")
        print(f"   Patient: {claim.get('patient_name', 'N/A')}")
        print(f"   Service Date: {claim.get('service_date', 'N/A')}")
        print(f"   Amount: ${claim.get('total_amount', 0)}")

        # Wait for form to fully load
        time.sleep(2)

        filled_count = 0
        total_fields = 0

        # Field mappings with multiple possible selectors
        field_mappings = {
            'patient_name': {
                'selectors': [
                    'input[name*="patient"][name*="name" i]',
                    'input[id*="patient"][id*="name" i]',
                    'input[name*="firstName"]',
                    'input[placeholder*="Patient Name" i]'
                ],
                'value': claim.get('patient_name')
            },
            'patient_dob': {
                'selectors': [
                    'input[name*="dob" i]',
                    'input[name*="birthDate" i]',
                    'input[name*="dateOfBirth" i]',
                    'input[type="date"]',
                    'input[id*="dob" i]'
                ],
                'value': claim.get('patient_dob')
            },
            'service_date': {
                'selectors': [
                    'input[name*="service"][name*="date" i]',
                    'input[name*="dos" i]',
                    'input[name*="dateOfService" i]',
                    'input[id*="serviceDate" i]'
                ],
                'value': claim.get('service_date')
            },
            'provider_name': {
                'selectors': [
                    'input[name*="provider" i]',
                    'input[name*="physician" i]',
                    'input[id*="provider" i]'
                ],
                'value': claim.get('provider_name')
            },
            'provider_tax_id': {
                'selectors': [
                    'input[name*="tax" i]',
                    'input[name*="ein" i]',
                    'input[name*="tin" i]',
                    'input[id*="taxId" i]'
                ],
                'value': claim.get('provider_tax_id')
            },
            'total_amount': {
                'selectors': [
                    'input[name*="amount" i]',
                    'input[name*="charge" i]',
                    'input[name*="total" i]',
                    'input[type="number"]'
                ],
                'value': claim.get('total_amount')
            }
        }

        # Try to fill each field
        for field_name, config in field_mappings.items():
            total_fields += 1
            value = config['value']

            if not value:
                print(f"  ⚠️  {field_name}: No data available")
                continue

            element = self.find_element_flexible(config['selectors'], timeout=2)

            if element:
                if self.fill_field(element, value, field_name):
                    filled_count += 1
            else:
                print(f"  ⚠️  {field_name}: Field not found on page")

        # Handle procedure codes
        procedure_codes = claim.get('procedure_codes', [])
        if procedure_codes:
            print(f"\n  🔍 Looking for CPT/procedure code fields...")
            cpt_inputs = self.find_elements_flexible([
                'input[name*="cpt" i]',
                'input[name*="procedure" i]',
                'input[id*="cpt" i]'
            ])

            if cpt_inputs:
                print(f"  ✓ Found {len(cpt_inputs)} CPT code field(s)")
                for i, code in enumerate(procedure_codes):
                    if i < len(cpt_inputs):
                        self.fill_field(cpt_inputs[i], code, f"CPT Code {i+1}")
                        filled_count += 1
            else:
                print(f"  ⚠️  No CPT code fields found. Codes: {', '.join(procedure_codes)}")

        print(f"\n✓ Form filling complete: {filled_count} fields filled")
        return filled_count

    def upload_file(self, pdf_path):
        """Upload PDF file to the form"""
        print(f"\n📎 Looking for file upload field...")

        file_input = self.find_element_flexible([
            'input[type="file"]',
            'input[name*="upload" i]',
            'input[name*="attachment" i]',
            'input[name*="document" i]'
        ])

        if file_input:
            print(f"  ✓ Found file upload field")
            print(f"  📁 Uploading: {pdf_path}")

            try:
                file_input.send_keys(str(pdf_path.absolute()))
                print(f"  ✓ File uploaded successfully")
                return True
            except Exception as e:
                print(f"  ❌ File upload failed: {e}")
                return False
        else:
            print("  ⚠️  File upload field not found")
            print("  💡 You may need to upload the file manually")
            return False

    def review_and_submit(self):
        """Allow user to review before submission"""
        print("\n" + "="*70)
        print("📋 REVIEW THE FORM")
        print("="*70)
        print("\nPlease review all the filled information in the browser.")
        print("Make sure everything is correct before submitting.")

        choice = input("\nWould you like to submit the claim? (yes/no): ").strip().lower()

        if choice in ['yes', 'y']:
            print("\n🔍 Looking for Submit button...")

            submit_btn = self.find_element_flexible([
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Submit")',
                'button[id*="submit" i]'
            ])

            if not submit_btn:
                # Try finding by text
                buttons = self.driver.find_elements(By.TAG_NAME, 'button')
                for btn in buttons:
                    if 'Submit' in btn.text or 'File Claim' in btn.text:
                        submit_btn = btn
                        break

            if submit_btn:
                print(f"  ✓ Found button: {submit_btn.text}")
                confirmation = input("  ⚠️  FINAL CONFIRMATION - Submit this claim? (YES to confirm): ")

                if confirmation == "YES":
                    submit_btn.click()
                    print("  ✓ Claim submitted!")
                    time.sleep(3)
                    return True
                else:
                    print("  ⏸️  Submission cancelled")
                    return False
            else:
                print("  ❌ Could not find Submit button")
                print("  💡 Please click Submit manually when ready")
                return False
        else:
            print("⏸️  Submission skipped. You can submit manually.")
            return False

    def close(self):
        """Close the browser"""
        if self.driver:
            choice = input("\nClose the browser? (yes/no): ").strip().lower()
            if choice in ['yes', 'y']:
                self.driver.quit()
                print("✓ Browser closed")

# ============================================================================
# MAIN FUNCTION
# ============================================================================

def main():
    print("="*70)
    print("🏥 ANTHEM CLAIMS AUTO-FILLER")
    print("="*70)

    # Load claims
    print("\n📂 Loading extracted claims...")
    claims = load_claims()

    if not claims:
        print("❌ No extracted claims found in claims_output/")
        print("💡 Run the PDF extraction first in the Jupyter notebook")
        return

    print(f"✓ Found {len(claims)} claim(s):\n")
    for i, claim in enumerate(claims, 1):
        print(f"{i}. Invoice #{claim.get('invoice_number', 'N/A')} - "
              f"{claim.get('service_date', 'N/A')} - "
              f"${claim.get('total_amount', 0)}")

    # Select claim
    try:
        choice = int(input(f"\nWhich claim would you like to file? (1-{len(claims)}): "))
        if choice < 1 or choice > len(claims):
            print("❌ Invalid choice")
            return

        selected_claim = claims[choice - 1]
    except ValueError:
        print("❌ Invalid input")
        return

    print(f"\n✓ Selected claim for {selected_claim.get('service_date', 'N/A')}")

    # Find corresponding PDF
    invoice_num = selected_claim.get('invoice_number', '')
    pdf_files = list(PT_BILLS_DIR.glob(f"*{invoice_num}*.pdf"))

    if not pdf_files:
        pdf_files = list(PT_BILLS_DIR.glob("*.pdf"))

    pdf_path = pdf_files[0] if pdf_files else None

    if pdf_path:
        print(f"✓ Found PDF: {pdf_path.name}")
    else:
        print("⚠️  PDF file not found - you'll need to upload manually")

    # Start automation
    agent = AnthemAutoFiller()

    try:
        # Start browser
        agent.start_browser()

        # Navigate to claims page
        agent.navigate_to_claims()

        # Click "Get Started"
        agent.click_get_started()

        # Fill the form
        agent.fill_claim_form(selected_claim)

        # Upload PDF
        if pdf_path:
            agent.upload_file(pdf_path)

        # Review and submit
        agent.review_and_submit()

        print("\n" + "="*70)
        print("✅ PROCESS COMPLETE!")
        print("="*70)
        print("\nThe browser will stay open so you can verify the submission.")

    except KeyboardInterrupt:
        print("\n\n⏸️  Process interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        agent.close()

if __name__ == "__main__":
    main()
