#!/usr/bin/env python3
"""
Test script to extract claim information from PT bills.
Run this in your WSL terminal with the path to your bills.

Usage:
    python3 test_extraction_local.py /mnt/c/Users/punee/Downloads/batch_superbill_export_20221031181538
"""

import sys
from pathlib import Path
import re
import json

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF (requires pdfplumber)"""
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
        return text
    except ImportError:
        print("ERROR: pdfplumber not installed. Run: pip3 install pdfplumber")
        return None
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None

def extract_claim_info(text, filename):
    """Extract claim information from bill text - customized for P3 Athletic superbills"""
    info = {"filename": filename}

    # Patient name - appears after "Patient Information" header
    match = re.search(r'Name.*?\n([A-Z][a-z]+\s+[A-Z][a-z]+)', text, re.IGNORECASE)
    if not match:
        match = re.search(r'Patient.*?\n.*?([A-Z][a-z]+\s+[A-Z][a-z]+)\s+\d{4}-\d{2}-\d{2}', text)
    info["patient_name"] = match.group(1).strip() if match else "Not found"

    # Date of birth - in format YYYY-MM-DD
    match = re.search(r'(\d{4}-\d{2}-\d{2})', text)
    info["patient_dob"] = match.group(1) if match else "Not found"

    # Invoice number
    match = re.search(r'Invoice\s*#\s*(\d+)', text, re.IGNORECASE)
    info["invoice_number"] = match.group(1) if match else "Not found"

    # Provider name - after "Provider" in Session Information
    match = re.search(r'(?:Provider|Invoice #\d+)\s+([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z]+,?\s*[A-Z]+)?)', text)
    info["provider_name"] = match.group(1).strip() if match else "Not found"

    # Clinic/Practice name - first line
    match = re.search(r'^([A-Z][A-Za-z0-9\s&]+(?:Therapy|Clinic|Practice|Health|Medical))', text, re.MULTILINE)
    info["clinic_name"] = match.group(1).strip() if match else "Not found"

    # EIN
    match = re.search(r'EIN\s*#?\s*(\d{2}-\d{7})', text, re.IGNORECASE)
    info["ein"] = match.group(1) if match else "Not found"

    # NPI
    match = re.search(r'NPI\s*#?\s*(\d+)', text, re.IGNORECASE)
    info["npi"] = match.group(1) if match else "Not found"

    # Service date - "Date of Visit" field
    match = re.search(r'Date of Visit.*?\n([A-Z][a-z]+\s+\d{1,2},\s+\d{4})', text, re.IGNORECASE)
    if not match:
        match = re.search(r'(\d{1,2}/\d{1,2}/\d{2,4})', text)
    info["service_date"] = match.group(1) if match else "Not found"

    # Total amount - look for various patterns
    match = re.search(r'(?:Total|Amount Due|Balance)[\s:]+\$?([0-9,]+\.\d{2})', text, re.IGNORECASE)
    info["total_amount"] = match.group(1) if match else "Not found"

    # Procedure codes (CPT) - PT codes typically start with 97
    codes = re.findall(r'\b(\d{5})\b', text)
    pt_codes = [code for code in codes if code.startswith('97')]
    info["procedure_codes"] = pt_codes if pt_codes else "Not found"

    return info

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 test_extraction_local.py <path_to_bills_directory>")
        print("Example: python3 test_extraction_local.py /mnt/c/Users/punee/Downloads/batch_superbill_export_20221031181538")
        sys.exit(1)

    bills_dir = Path(sys.argv[1])

    if not bills_dir.exists():
        print(f"ERROR: Directory not found: {bills_dir}")
        sys.exit(1)

    pdf_files = list(bills_dir.glob("*.pdf"))

    if not pdf_files:
        print(f"No PDF files found in {bills_dir}")
        sys.exit(1)

    print(f"Found {len(pdf_files)} PDF file(s)\n")
    print("="*70)

    for pdf_path in pdf_files[:3]:  # Process first 3 files
        print(f"\nFile: {pdf_path.name}")
        print("-"*70)

        text = extract_text_from_pdf(pdf_path)
        if not text:
            continue

        # Show first 500 chars of extracted text
        print(f"\nExtracted text preview:")
        print(text[:500])
        print("...\n")

        # Extract structured info
        info = extract_claim_info(text, pdf_path.name)

        print("Extracted Information:")
        for key, value in info.items():
            if key != "filename":
                print(f"  {key:20s}: {value}")

        print("="*70)

if __name__ == "__main__":
    main()
