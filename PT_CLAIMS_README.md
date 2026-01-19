# Physical Therapy Claims Filing Agent

An automated agent for filing physical therapy claims to Anthem insurance using Jupyter notebooks.

## Overview

This agent automates the process of:
1. **Extracting information** from PDF bills (patient info, provider details, amounts, procedure codes)
2. **Navigating** Anthem's web portal
3. **Filling and submitting** claim forms

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

The agent requires:
- `pdfplumber` - PDF text extraction
- `selenium` - Web automation
- `webdriver-manager` - Automatic ChromeDriver management
- `python-dotenv` - Environment variable management

### 2. Prepare Your Bills

1. Create a directory for your bills:
   ```bash
   mkdir pt_bills
   ```

2. Add your physical therapy bills (PDF format) to the `pt_bills/` directory

### 3. Chrome Browser

Ensure Google Chrome is installed on your system (required for Selenium automation).

## Usage

### Quick Start

1. Open the notebook:
   ```bash
   jupyter notebook pt_claims_agent.ipynb
   ```

2. Run the cells in order:
   - **Setup cells**: Import libraries and configure paths
   - **Step 1**: Extract information from PDFs
   - **Review extracted data**: Verify and edit if needed
   - **Step 2**: Automated submission (requires customization)

### Extracted Data

The agent saves extracted claim information to `claims_output/` as JSON files. Example:

```json
{
  "patient_name": "John Doe",
  "service_date": "12/15/2024",
  "provider_name": "ABC Physical Therapy",
  "total_amount": 150.00,
  "procedure_codes": ["97110", "97140"]
}
```

## Important Notes

### ⚠️ Customization Required

The web automation code includes **template selectors** that need to be updated based on Anthem's actual website:

1. **Inspect Anthem's login page**:
   - Right-click on form fields → "Inspect"
   - Find element IDs, names, or classes
   - Update selectors in the `AnthemClaimsAgent` class

2. **Inspect the claims submission form**:
   - Navigate to the claims page
   - Inspect each form field
   - Update the `fill_claim_form()` method

### 🔒 Security

**Never hardcode credentials!** Use one of these approaches:

#### Option 1: Environment Variables (Recommended)
```bash
# Create a .env file
echo "ANTHEM_USERNAME=your_username" >> .env
echo "ANTHEM_PASSWORD=your_password" >> .env
```

```python
# In the notebook
from dotenv import load_dotenv
load_dotenv()

anthem_username = os.getenv("ANTHEM_USERNAME")
anthem_password = os.getenv("ANTHEM_PASSWORD")
```

#### Option 2: Interactive Input (Current Default)
The notebook uses `getpass()` for secure password input.

### 📝 PDF Parsing Accuracy

The regex patterns for extracting information may need adjustment based on your bill format:

- Open `pt_claims_agent.ipynb`
- Find the `extract_claim_info()` function
- Modify regex patterns to match your specific bills
- Test with sample bills and review extracted data

## Workflow

```
┌─────────────────┐
│  PDF Bills in   │
│   pt_bills/     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Info    │
│ (PDF Parser)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Save to JSON    │
│ claims_output/  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Review & Edit   │
│ (Manual Check)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Web Automation  │
│ (Selenium)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Submit to       │
│ Anthem Portal   │
└─────────────────┘
```

## Troubleshooting

### "No PDF files found"
- Ensure PDFs are in the `pt_bills/` directory
- Check file extensions are `.pdf` (lowercase)

### "Login timeout - elements not found"
- Anthem's website structure has changed
- Update element selectors in `AnthemClaimsAgent.login()`
- Use browser DevTools to inspect the current login form

### "Form element not found"
- Update selectors in `fill_claim_form()`
- Check if Anthem requires additional steps or captcha
- Consider manual verification

### Extraction Missing Data
- Review the original PDF
- Check if the bill format differs from expected patterns
- Update regex patterns in `extract_claim_info()`
- Manually edit the extracted JSON files

## Advanced Features

### Batch Processing
The notebook processes all PDFs in `pt_bills/` automatically. To process specific files:

```python
# Filter specific bills
pdf_files = [f for f in BILLS_DIR.glob("*.pdf") if "2024" in f.name]
```

### Headless Mode
Run without a visible browser window:

```python
agent = AnthemClaimsAgent(headless=True)
```

### Custom Output Directory
```python
OUTPUT_DIR = Path("./my_custom_output")
OUTPUT_DIR.mkdir(exist_ok=True)
```

## Extending the Agent

### Add OCR Support
For scanned/image-based PDFs:

```python
import pytesseract
from pdf2image import convert_from_path

def extract_text_with_ocr(pdf_path):
    images = convert_from_path(pdf_path)
    text = ""
    for image in images:
        text += pytesseract.image_to_string(image)
    return text
```

### Add Email Notifications
```python
import smtplib
from email.message import EmailMessage

def send_notification(claim_status):
    msg = EmailMessage()
    msg['Subject'] = f'Claim Submission: {claim_status}'
    msg['From'] = 'your@email.com'
    msg['To'] = 'your@email.com'
    msg.set_content(f'Claim status: {claim_status}')

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
        smtp.login('your@email.com', 'password')
        smtp.send_message(msg)
```

### Support Multiple Insurance Providers
Create a base class and extend for different providers:

```python
class InsuranceAgent(ABC):
    @abstractmethod
    def login(self, username, password):
        pass

    @abstractmethod
    def fill_claim_form(self, claim):
        pass

class AnthemAgent(InsuranceAgent):
    # Current implementation
    pass

class BlueCrossAgent(InsuranceAgent):
    # Implement for Blue Cross
    pass
```

## Contributing

To improve the agent:
1. Test with different bill formats
2. Update regex patterns for better extraction
3. Add error handling and retry logic
4. Implement logging for debugging
5. Add unit tests

## Disclaimer

This tool is for **personal use** and **educational purposes**. Always:
- Verify extracted information before submission
- Test thoroughly with non-production data first
- Comply with Anthem's terms of service
- Keep your credentials secure
- Review submitted claims for accuracy

The author is not responsible for incorrect submissions, data loss, or terms of service violations.

## License

This project follows the same license as the fastbook repository (GPL v3).

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review extracted JSON files for data accuracy
3. Inspect Anthem's website for structural changes
4. Open an issue with error logs and details
