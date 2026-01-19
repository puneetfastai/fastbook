# Anthem Website Inspection Guide

This guide will help you find the correct selectors for Anthem's login and claims submission forms.

## Step 1: Inspect the Login Page

1. **Open Chrome/Firefox** and go to: https://www.anthem.com/account-login/

2. **Right-click on the Username field** → Select "Inspect" (or press F12)

3. **In the DevTools**, look for the highlighted `<input>` element

4. **Copy these attributes**:
   ```
   - id="..."
   - name="..."
   - class="..."
   ```

5. **Repeat for the Password field** and **Login button**

### What to Look For:

```html
<!-- Example of what you might see: -->
<input type="text" id="userId" name="username" class="form-control">
<input type="password" id="password" name="password" class="form-control">
<button type="submit" id="loginBtn" class="btn-primary">Log In</button>
```

### Record the selectors:
- Username field ID: _________________
- Username field name: _________________
- Password field ID: _________________
- Password field name: _________________
- Login button ID: _________________
- Login button class: _________________

---

## Step 2: Inspect the Claims Submission Form

1. **Log into your Anthem account**

2. **Navigate to**: https://membersecure.anthem.com/member/claims/submission-questionnaire

3. **For each form field**, inspect and record:

### Patient Information Section:
- Patient Name field:
  - ID: _________________
  - Name: _________________

- Date of Birth field:
  - ID: _________________
  - Name: _________________
  - Type: _________________ (text/date)

- Member ID field:
  - ID: _________________
  - Name: _________________

### Service Information Section:
- Service Date field:
  - ID: _________________
  - Name: _________________
  - Type: _________________ (text/date)

- Provider Name field:
  - ID: _________________
  - Name: _________________

- Provider Tax ID/EIN field:
  - ID: _________________
  - Name: _________________

### Financial Information Section:
- Total Amount/Charges field:
  - ID: _________________
  - Name: _________________

- Amount Paid field:
  - ID: _________________
  - Name: _________________

### Document Upload Section:
- File upload field:
  - ID: _________________
  - Name: _________________
  - Type: _________________ (should be "file")
  - Accept: _________________ (file types accepted)

### Procedure Codes Section:
- CPT Code fields (there may be multiple):
  - ID pattern: _________________
  - Name pattern: _________________

### Submit Button:
- Submit button:
  - ID: _________________
  - Class: _________________
  - Type: _________________ (submit/button)

---

## Step 3: Check for Dynamic Elements

Some forms use JavaScript to show/hide fields. Check if:

1. **Multi-step form**: Does the form have multiple pages/steps?
   - If yes, note the "Next" button selectors for each step

2. **Dropdowns**: Are there any dropdown menus (like "Type of Service")?
   - Record the `<select>` element IDs and option values

3. **Radio buttons/Checkboxes**: Any yes/no questions?
   - Record their IDs and values

4. **Terms and Conditions**: Is there a checkbox to accept terms?
   - Record its ID and name

---

## Step 4: Test Selectors

Once you have the selectors, you can test them using the browser console:

1. **Press F12** to open DevTools
2. **Go to the Console tab**
3. **Test each selector**:

```javascript
// Test by ID
document.getElementById('userId')

// Test by name
document.querySelector('[name="username"]')

// Test by class
document.querySelector('.btn-primary')

// Test by CSS selector
document.querySelector('input[type="file"]')
```

If the command returns an element (not `null`), the selector is correct!

---

## Step 5: Share the Information

Once you have all the selectors, share them in this format:

```
LOGIN PAGE:
- Username: id="xxx" name="yyy"
- Password: id="xxx" name="yyy"
- Login button: id="xxx" class="yyy"

CLAIMS FORM:
- Patient name: id="xxx" name="yyy"
- Service date: id="xxx" name="yyy"
- Provider name: id="xxx" name="yyy"
- Total amount: id="xxx" name="yyy"
- File upload: id="xxx" name="yyy"
- Submit button: id="xxx" class="yyy"
```

---

## Tips

1. **ID is best**: If an element has an `id`, use that (most reliable)
2. **Name is good**: If no ID, use the `name` attribute
3. **Class is last resort**: Classes can change, use only if necessary
4. **Be specific**: Use combinations like `input[name="username"]` if needed

5. **Watch for iframes**: Some forms load in iframes. If you can't find elements, check if the form is in an iframe:
   ```javascript
   // In console, check for iframes
   document.querySelectorAll('iframe')
   ```

6. **Dynamic IDs**: Some sites generate random IDs. Look for:
   - `data-*` attributes
   - Consistent class names
   - XPath selectors as fallback

---

## Common Anthem Patterns

Based on typical healthcare portals, you might see:

- Member ID might be called: `memberId`, `subscriberId`, `policyNumber`
- Provider might be: `providerName`, `physicianName`, `practitioner`
- Amounts might be: `chargedAmount`, `totalCharge`, `billAmount`
- File upload might be: `documentUpload`, `attachments`, `fileInput`

---

## What to Do Next

After gathering the selectors:
1. Share them with me
2. I'll update the `AnthemClaimsAgent` class in the notebook
3. We'll test the automation with your account

**Important**: Never share your actual credentials. We only need the HTML selectors!
