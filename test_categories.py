#!/usr/bin/env python3
"""
Test script for categories endpoint
"""
import sys
import os
sys.path.insert(0, r'c:\Users\lenovo\Desktop\file_rouge_new')

from fastapi.testclient import TestClient
from projects.app.main import app

client = TestClient(app)

def test_categories_endpoint():
    """Test the categories endpoint"""

    response = client.get("/api/v1/api/categories")
    print(f"Categories endpoint: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print("✓ Categories endpoint working!")
        print(f"Expense categories: {len(data['expense'])} items")
        print(f"Income categories: {len(data['income'])} items")

        # Show first few categories
        print(f"Sample expense categories: {data['expense'][:5]}")
        print(f"Sample income categories: {data['income'][:5]}")
    else:
        print(f"✗ Error: {response.text}")

if __name__ == "__main__":
    test_categories_endpoint()