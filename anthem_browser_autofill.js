/**
 * Anthem Claims Auto-Filler - Browser Console Script
 *
 * This script runs in your browser console while you're logged into Anthem.
 * It will automatically navigate to the claims form, inspect fields, and fill them
 * with data from your extracted claims.
 *
 * HOW TO USE:
 * 1. Make sure you're logged into Anthem and on the claims page
 * 2. Open DevTools (F12) and go to Console
 * 3. Paste this entire script
 * 4. The script will ask you which claim to file
 * 5. It will automatically navigate and fill the form
 */

(async function AnthemClaimsAutoFiller() {
    'use strict';

    // ============================================================================
    // CONFIGURATION - UPDATE THESE WITH YOUR CLAIM DATA
    // ============================================================================

    const CLAIMS_DATA = [
        {
            filename: "superbill_5033_swati_satija_20221031_111538.pdf",
            patient_name: "Swati Satija",
            patient_dob: "1983-11-12",
            invoice_number: "5033",
            provider_name: "Pooja Pal PT, DPT",
            clinic_name: "P3 Athletic & Physical Therapy",
            provider_address: "1673 S. Main St, Milpitas, CA, 95035",
            provider_phone: "4084953743",
            ein: "82-2731253",
            npi: "1215533351",
            service_date: "September 30, 2022",
            total_amount: 297.00,
            procedure_codes: ["97140", "97112", "97110"]
        },
        {
            filename: "superbill_5059_swati_satija_20221031_111539.pdf",
            patient_name: "Swati Satija",
            patient_dob: "1983-11-12",
            invoice_number: "5059",
            provider_name: "Pooja Pal PT, DPT",
            clinic_name: "P3 Athletic & Physical Therapy",
            provider_address: "1673 S. Main St, Milpitas, CA, 95035",
            provider_phone: "4084953743",
            ein: "82-2731253",
            npi: "1215533351",
            service_date: "October 7, 2022",
            total_amount: 297.00,
            procedure_codes: ["97140", "97112", "97110"]
        },
        {
            filename: "superbill_5171_swati_satija_20221031_111539.pdf",
            patient_name: "Swati Satija",
            patient_dob: "1983-11-12",
            invoice_number: "5171",
            provider_name: "Pooja Pal PT, DPT",
            clinic_name: "P3 Athletic & Physical Therapy",
            provider_address: "1673 S. Main St, Milpitas, CA, 95035",
            provider_phone: "4084953743",
            ein: "82-2731253",
            npi: "1215533351",
            service_date: "October 18, 2022",
            total_amount: 297.00,
            procedure_codes: ["97140", "97112", "97110"]
        }
    ];

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    function log(message, type = 'info') {
        const styles = {
            info: 'color: blue; font-weight: bold',
            success: 'color: green; font-weight: bold',
            error: 'color: red; font-weight: bold',
            warning: 'color: orange; font-weight: bold'
        };
        console.log(`%c[Anthem Agent] ${message}`, styles[type]);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function findElement(selectors) {
        for (let selector of selectors) {
            try {
                const el = document.querySelector(selector);
                if (el) return el;
            } catch (e) {
                // Invalid selector, continue
            }
        }
        return null;
    }

    function findAllElements(selectors) {
        for (let selector of selectors) {
            try {
                const els = document.querySelectorAll(selector);
                if (els.length > 0) return Array.from(els);
            } catch (e) {
                // Invalid selector, continue
            }
        }
        return [];
    }

    function fillField(element, value) {
        if (!element || !value) return false;

        // Try multiple methods to fill the field
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));

        log(`Filled field: ${element.name || element.id || 'unknown'} = ${value}`, 'success');
        return true;
    }

    async function clickButton(element) {
        if (!element) return false;

        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(500);
        element.click();
        log(`Clicked: ${element.textContent.trim() || element.id}`, 'success');
        return true;
    }

    // ============================================================================
    // STEP 1: SELECT CLAIM
    // ============================================================================

    log("=".repeat(70));
    log("ANTHEM CLAIMS AUTO-FILLER STARTED", 'success');
    log("=".repeat(70));

    console.log("\nAvailable claims:");
    CLAIMS_DATA.forEach((claim, i) => {
        console.log(`${i + 1}. ${claim.filename} - ${claim.service_date} - $${claim.total_amount}`);
    });

    const claimIndex = parseInt(prompt(`Which claim would you like to file? (Enter 1-${CLAIMS_DATA.length})`)) - 1;

    if (claimIndex < 0 || claimIndex >= CLAIMS_DATA.length) {
        log("Invalid claim selection!", 'error');
        return;
    }

    const selectedClaim = CLAIMS_DATA[claimIndex];
    log(`Selected: ${selectedClaim.filename}`, 'info');

    // ============================================================================
    // STEP 2: NAVIGATE TO CLAIMS FORM
    // ============================================================================

    log("\nLooking for 'Get Started' button...", 'info');

    const getStartedButton = findElement([
        'button.claim-card-btn',
        'button:contains("Get Started")',
        '.claim-card-btn',
        '[class*="claim"][class*="btn"]'
    ]);

    if (!getStartedButton) {
        log("Could not find 'Get Started' button. Are you on the claims page?", 'error');
        log("Please navigate to the claims page and run this script again.", 'warning');
        return;
    }

    log("Found 'Get Started' button! Clicking...", 'success');
    await clickButton(getStartedButton);
    await sleep(2000); // Wait for page to load

    // ============================================================================
    // STEP 3: INSPECT AND FILL THE FORM
    // ============================================================================

    log("\nInspecting form fields...", 'info');

    // Wait for form to appear
    let retries = 0;
    let formFound = false;
    while (retries < 10 && !formFound) {
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input, select, textarea');

        if (forms.length > 0 || inputs.length > 5) {
            formFound = true;
            log(`Found form with ${inputs.length} input fields!`, 'success');
        } else {
            await sleep(1000);
            retries++;
        }
    }

    if (!formFound) {
        log("Could not find claim submission form after clicking Get Started", 'error');
        log("The page might require additional navigation. Please check manually.", 'warning');
        return;
    }

    // ============================================================================
    // STEP 4: SMART FIELD DETECTION AND FILLING
    // ============================================================================

    log("\nAttempting to fill form fields...", 'info');

    const fieldMappings = {
        patient_name: {
            selectors: [
                'input[name*="patient"][name*="name"]',
                'input[id*="patient"][id*="name"]',
                'input[name*="firstName"]',
                'input[placeholder*="Patient Name"]',
                'input[aria-label*="Patient Name"]'
            ],
            value: selectedClaim.patient_name
        },
        patient_dob: {
            selectors: [
                'input[name*="dob"]',
                'input[name*="birthDate"]',
                'input[name*="dateOfBirth"]',
                'input[id*="dob"]',
                'input[type="date"]',
                'input[placeholder*="Date of Birth"]'
            ],
            value: selectedClaim.patient_dob
        },
        service_date: {
            selectors: [
                'input[name*="service"][name*="date"]',
                'input[name*="dos"]',
                'input[name*="dateOfService"]',
                'input[id*="serviceDate"]',
                'input[placeholder*="Service Date"]',
                'input[placeholder*="Date of Service"]'
            ],
            value: selectedClaim.service_date
        },
        provider_name: {
            selectors: [
                'input[name*="provider"][name*="name"]',
                'input[name*="physician"]',
                'input[name*="doctor"]',
                'input[id*="provider"]',
                'input[placeholder*="Provider"]'
            ],
            value: selectedClaim.provider_name || selectedClaim.clinic_name
        },
        provider_tax_id: {
            selectors: [
                'input[name*="tax"]',
                'input[name*="ein"]',
                'input[name*="tin"]',
                'input[id*="taxId"]',
                'input[id*="ein"]',
                'input[placeholder*="Tax ID"]',
                'input[placeholder*="EIN"]'
            ],
            value: selectedClaim.ein
        },
        provider_npi: {
            selectors: [
                'input[name*="npi"]',
                'input[id*="npi"]',
                'input[placeholder*="NPI"]'
            ],
            value: selectedClaim.npi
        },
        provider_phone: {
            selectors: [
                'input[name*="phone"]',
                'input[name*="telephone"]',
                'input[id*="phone"]',
                'input[type="tel"]',
                'input[placeholder*="Phone"]'
            ],
            value: selectedClaim.provider_phone
        },
        total_amount: {
            selectors: [
                'input[name*="amount"]',
                'input[name*="charge"]',
                'input[name*="total"]',
                'input[type="number"]',
                'input[id*="amount"]',
                'input[placeholder*="Amount"]'
            ],
            value: selectedClaim.total_amount.toString()
        }
    };

    let filledCount = 0;
    let totalFields = Object.keys(fieldMappings).length;

    for (let [fieldName, config] of Object.entries(fieldMappings)) {
        const element = findElement(config.selectors);
        if (element && config.value) {
            if (fillField(element, config.value)) {
                filledCount++;
            }
        } else {
            log(`Field not found: ${fieldName}`, 'warning');
        }
        await sleep(300); // Small delay between fields
    }

    log(`\nFilled ${filledCount}/${totalFields} fields`, 'info');

    // ============================================================================
    // STEP 5: HANDLE PROCEDURE CODES
    // ============================================================================

    log("\nLooking for procedure code fields...", 'info');

    const cptInputs = findAllElements([
        'input[name*="cpt"]',
        'input[name*="procedure"]',
        'input[id*="cpt"]',
        'input[id*="procedure"]',
        'input[placeholder*="CPT"]',
        'input[placeholder*="Procedure"]'
    ]);

    if (cptInputs.length > 0) {
        log(`Found ${cptInputs.length} procedure code field(s)`, 'success');
        selectedClaim.procedure_codes.forEach((code, i) => {
            if (i < cptInputs.length) {
                fillField(cptInputs[i], code);
            }
        });
    } else {
        log("No procedure code fields found", 'warning');
        log(`Your CPT codes are: ${selectedClaim.procedure_codes.join(', ')}`, 'info');
    }

    // ============================================================================
    // STEP 6: FILE UPLOAD
    // ============================================================================

    log("\nLooking for file upload field...", 'info');

    const fileInput = findElement([
        'input[type="file"]',
        'input[name*="upload"]',
        'input[name*="attachment"]',
        'input[name*="document"]'
    ]);

    if (fileInput) {
        log("Found file upload field!", 'success');
        log(`You need to upload: ${selectedClaim.filename}`, 'warning');
        log("File upload cannot be automated from console - you'll need to do this manually", 'warning');

        // Highlight the file input
        fileInput.style.border = "3px solid red";
        fileInput.style.backgroundColor = "yellow";
        fileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        log("No file upload field found yet", 'warning');
    }

    // ============================================================================
    // STEP 7: SUMMARY AND NEXT STEPS
    // ============================================================================

    log("\n" + "=".repeat(70), 'success');
    log("FORM FILLING COMPLETE!", 'success');
    log("=".repeat(70), 'success');

    console.log("\n📋 Summary:");
    console.log(`- Claim: ${selectedClaim.filename}`);
    console.log(`- Fields filled: ${filledCount}/${totalFields}`);
    console.log(`- Procedure codes: ${selectedClaim.procedure_codes.join(', ')}`);
    console.log(`- Amount: $${selectedClaim.total_amount}`);

    console.log("\n⚠️  Next Steps:");
    console.log("1. Review all filled fields for accuracy");
    console.log("2. Upload the PDF bill (highlighted in yellow if found)");
    console.log("3. Fill any missing fields manually");
    console.log("4. Click Submit when ready");

    log("\n✨ Tip: To see all fields that were filled, scroll through the form", 'info');

    // Store claim data in window for reference
    window.currentClaim = selectedClaim;
    log("\n💾 Claim data saved to: window.currentClaim", 'info');

})();
