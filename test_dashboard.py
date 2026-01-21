#!/usr/bin/env python3
"""
Test script for dashboard endpoints
"""
import sys
import os
sys.path.insert(0, r'c:\Users\lenovo\Desktop\file_rouge_new')

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_dashboard_routes():
    """Test that dashboard routes are accessible (will fail on auth but should not 404)"""

    # Test dashboard summary endpoint
    response = client.get("/api/v1/api/dashboard/summary")
    print(f"Dashboard summary: {response.status_code}")
    if response.status_code == 401:
        print("✓ Authentication required (expected)")
    elif response.status_code == 404:
        print("✗ Route not found")
    else:
        print(f"Response: {response.json()}")

    # Test budgets status endpoint
    response = client.get("/api/v1/api/budgets/status")
    print(f"Budgets status: {response.status_code}")
    if response.status_code == 401:
        print("✓ Authentication required (expected)")
    elif response.status_code == 404:
        print("✗ Route not found")
    else:
        print(f"Response: {response.json()}")

    # Test categories analysis endpoint
    response = client.get("/api/v1/api/categories/analysis")
    print(f"Categories analysis: {response.status_code}")
    if response.status_code == 401:
        print("✓ Authentication required (expected)")
    elif response.status_code == 404:
        print("✗ Route not found")
    else:
        print(f"Response: {response.json()}")

if __name__ == "__main__":
    print("Testing dashboard endpoints...")
    test_dashboard_routes()
    print("Test completed!")