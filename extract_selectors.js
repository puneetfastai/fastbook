/**
 * Anthem Form Selector Extractor
 *
 * HOW TO USE:
 * 1. Open Anthem's login or claims page in your browser
 * 2. Press F12 to open DevTools
 * 3. Go to the Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter
 * 6. Copy the output and share it
 */

(function() {
    console.log("=".repeat(70));
    console.log("ANTHEM FORM SELECTOR EXTRACTOR");
    console.log("=".repeat(70));
    console.log("");

    // Helper function to get best selector for an element
    function getBestSelector(element) {
        if (!element) return "NOT FOUND";

        const selectors = {};

        if (element.id) {
            selectors.id = element.id;
            selectors.by_id = `#${element.id}`;
        }

        if (element.name) {
            selectors.name = element.name;
            selectors.by_name = `[name="${element.name}"]`;
        }

        if (element.className) {
            selectors.class = element.className;
            selectors.by_class = `.${element.className.split(' ')[0]}`;
        }

        selectors.tag = element.tagName.toLowerCase();
        selectors.type = element.type || 'N/A';

        // Get data attributes
        const dataAttrs = {};
        for (let attr of element.attributes) {
            if (attr.name.startsWith('data-')) {
                dataAttrs[attr.name] = attr.value;
            }
        }
        if (Object.keys(dataAttrs).length > 0) {
            selectors.data_attributes = dataAttrs;
        }

        return selectors;
    }

    // Function to find form elements by various patterns
    function findElements() {
        const results = {};

        // Common login field patterns
        const loginPatterns = {
            username: [
                'input[type="text"][name*="user"]',
                'input[type="text"][id*="user"]',
                'input[type="email"]',
                'input[name*="login"]',
                'input[id*="login"]',
                'input[name="username"]',
                'input[id="userId"]'
            ],
            password: [
                'input[type="password"]',
                'input[name*="pass"]',
                'input[id*="pass"]'
            ],
            loginButton: [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Log In")',
                'button:contains("Sign In")',
                '[id*="login"][type="submit"]',
                '[id*="submit"]'
            ]
        };

        // Common claims form patterns
        const claimsPatterns = {
            patientName: [
                'input[name*="patient"][name*="name"]',
                'input[id*="patient"][id*="name"]',
                'input[name*="firstName"]',
                'input[name*="lastName"]'
            ],
            dateOfBirth: [
                'input[name*="dob"]',
                'input[name*="birthDate"]',
                'input[name*="dateOfBirth"]',
                'input[id*="dob"]',
                'input[type="date"]'
            ],
            memberId: [
                'input[name*="member"]',
                'input[name*="subscriber"]',
                'input[name*="policy"]',
                'input[id*="member"]'
            ],
            serviceDate: [
                'input[name*="service"][name*="date"]',
                'input[name*="dos"]',
                'input[name*="dateOfService"]',
                'input[id*="serviceDate"]'
            ],
            providerName: [
                'input[name*="provider"]',
                'input[name*="physician"]',
                'input[name*="doctor"]',
                'input[id*="provider"]'
            ],
            providerTaxId: [
                'input[name*="tax"]',
                'input[name*="ein"]',
                'input[name*="tin"]',
                'input[id*="taxId"]'
            ],
            totalAmount: [
                'input[name*="amount"]',
                'input[name*="charge"]',
                'input[name*="total"]',
                'input[type="number"]',
                'input[id*="amount"]'
            ],
            fileUpload: [
                'input[type="file"]',
                'input[name*="upload"]',
                'input[name*="attachment"]',
                'input[name*="document"]'
            ],
            submitButton: [
                'button[type="submit"]',
                'input[type="submit"]',
                'button:contains("Submit")',
                '[id*="submit"]'
            ]
        };

        console.log("SEARCHING FOR LOGIN ELEMENTS:");
        console.log("-".repeat(70));
        for (let [key, patterns] of Object.entries(loginPatterns)) {
            for (let pattern of patterns) {
                try {
                    const element = document.querySelector(pattern);
                    if (element) {
                        console.log(`\n✓ Found ${key}:`);
                        console.log(JSON.stringify(getBestSelector(element), null, 2));
                        results[key] = getBestSelector(element);
                        break;
                    }
                } catch (e) {
                    // Skip invalid selectors
                }
            }
            if (!results[key]) {
                console.log(`\n✗ ${key}: NOT FOUND`);
            }
        }

        console.log("\n\n" + "=".repeat(70));
        console.log("SEARCHING FOR CLAIMS FORM ELEMENTS:");
        console.log("-".repeat(70));
        for (let [key, patterns] of Object.entries(claimsPatterns)) {
            for (let pattern of patterns) {
                try {
                    const element = document.querySelector(pattern);
                    if (element) {
                        console.log(`\n✓ Found ${key}:`);
                        console.log(JSON.stringify(getBestSelector(element), null, 2));
                        results[key] = getBestSelector(element);
                        break;
                    }
                } catch (e) {
                    // Skip invalid selectors
                }
            }
            if (!results[key]) {
                console.log(`\n✗ ${key}: NOT FOUND`);
            }
        }

        // Find all forms
        console.log("\n\n" + "=".repeat(70));
        console.log("ALL FORMS ON PAGE:");
        console.log("-".repeat(70));
        const forms = document.querySelectorAll('form');
        forms.forEach((form, index) => {
            console.log(`\nForm ${index + 1}:`);
            console.log(JSON.stringify(getBestSelector(form), null, 2));
            console.log(`  Fields count: ${form.querySelectorAll('input, select, textarea').length}`);
        });

        // Find all input fields
        console.log("\n\n" + "=".repeat(70));
        console.log("ALL INPUT FIELDS:");
        console.log("-".repeat(70));
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach((input, index) => {
            const info = getBestSelector(input);
            console.log(`\n${index + 1}. ${info.tag} [type="${info.type}"]`);
            if (info.id) console.log(`   id="${info.id}"`);
            if (info.name) console.log(`   name="${info.name}"`);
            if (info.class) console.log(`   class="${info.class}"`);

            // Try to find the label
            const label = input.labels ? input.labels[0] :
                         document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                console.log(`   label="${label.textContent.trim()}"`);
            }
        });

        // Find all buttons
        console.log("\n\n" + "=".repeat(70));
        console.log("ALL BUTTONS:");
        console.log("-".repeat(70));
        const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
        buttons.forEach((btn, index) => {
            const info = getBestSelector(btn);
            console.log(`\n${index + 1}. ${btn.textContent || btn.value || 'Button'}`);
            if (info.id) console.log(`   id="${info.id}"`);
            if (info.name) console.log(`   name="${info.name}"`);
            if (info.class) console.log(`   class="${info.class}"`);
            console.log(`   type="${info.type}"`);
        });

        console.log("\n\n" + "=".repeat(70));
        console.log("EXTRACTION COMPLETE");
        console.log("=".repeat(70));
        console.log("\nCopy the output above and share it to update the automation script.");
        console.log("\nTIP: Right-click in the console → 'Save as...' to save this output");

        return results;
    }

    // Run the extraction
    const selectors = findElements();

    // Store in window for easy access
    window.anthemSelectors = selectors;
    console.log("\n\n💾 Selectors saved to: window.anthemSelectors");
    console.log("You can access them by typing: window.anthemSelectors");

})();
