#!/usr/bin/env python3
"""
Script to copy bills from Windows to the pt_bills directory.
Run this from the location where you have access to both filesystems.
"""
import shutil
from pathlib import Path
import sys

# Source directory (Windows)
SOURCE_DIR = r"C:\Users\punee\Downloads\batch_superbill_export_20221031181538"

# Target directory (Linux/WSL)
TARGET_DIR = Path(__file__).parent / "pt_bills"

def copy_bills():
    source = Path(SOURCE_DIR)

    if not source.exists():
        print(f"❌ Source directory not found: {source}")
        print("Please update SOURCE_DIR in this script to the correct path.")
        return False

    # Find all PDF files
    pdf_files = list(source.glob("*.pdf"))

    if not pdf_files:
        print(f"⚠️  No PDF files found in {source}")
        return False

    print(f"Found {len(pdf_files)} PDF file(s)")
    TARGET_DIR.mkdir(exist_ok=True)

    # Copy files
    for pdf in pdf_files:
        target = TARGET_DIR / pdf.name
        print(f"Copying: {pdf.name}")
        shutil.copy2(pdf, target)
        print(f"  ✓ Copied to {target}")

    print(f"\n✓ Successfully copied {len(pdf_files)} files to {TARGET_DIR}")
    return True

if __name__ == "__main__":
    try:
        success = copy_bills()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
