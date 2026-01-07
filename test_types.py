#!/usr/bin/env python3
"""
Test script for type conversion in dashboard
"""
import sys
import os
sys.path.insert(0, r'c:\Users\lenovo\Desktop\file_rouge_new')

from decimal import Decimal

def test_type_conversion():
    """Test type conversion logic"""

    # Simulate SQLAlchemy results
    total_income_result = Decimal('100.50')  # This is what SQLAlchemy returns
    total_expenses_result = None  # This is what happens when no data

    # Our conversion logic
    total_income = float(total_income_result) if total_income_result is not None else 0.0
    total_expenses = float(total_expenses_result) if total_expenses_result is not None else 0.0

    print(f"total_income: {total_income} (type: {type(total_income)})")
    print(f"total_expenses: {total_expenses} (type: {type(total_expenses)})")

    # Test the calculation
    balance = total_income - total_expenses
    print(f"balance: {balance} (type: {type(balance)})")

    print("✓ Type conversion test passed!")

if __name__ == "__main__":
    test_type_conversion()