"""
KAG Retirement Project - Python Utilities

This module contains utility functions for the KAG Retirement Project.
"""

import json
from datetime import datetime
from typing import Any, Dict, List


def get_current_timestamp() -> str:
    """
    Get the current timestamp in ISO format.
    
    Returns:
        str: The current timestamp in ISO 8601 format
    """
    return datetime.now().isoformat()


def load_json_file(filepath: str) -> Dict[str, Any]:
    """
    Load and parse a JSON file.
    
    Args:
        filepath (str): Path to the JSON file
        
    Returns:
        Dict[str, Any]: Parsed JSON data
        
    Raises:
        FileNotFoundError: If the file does not exist
        json.JSONDecodeError: If the file is not valid JSON
    """
    with open(filepath, 'r') as f:
        return json.load(f)


def save_json_file(filepath: str, data: Dict[str, Any]) -> None:
    """
    Save data to a JSON file.
    
    Args:
        filepath (str): Path where the JSON file will be saved
        data (Dict[str, Any]): Data to save
    """
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)


def format_currency(amount: float, currency: str = 'USD') -> str:
    """
    Format a number as currency.
    
    Args:
        amount (float): The amount to format
        currency (str): The currency code (default: 'USD')
        
    Returns:
        str: Formatted currency string
    """
    return f"{currency} {amount:,.2f}"


def calculate_retirement_years(current_age: int, retirement_age: int) -> int:
    """
    Calculate years until retirement.
    
    Args:
        current_age (int): Current age in years
        retirement_age (int): Desired retirement age
        
    Returns:
        int: Number of years until retirement
    """
    return max(0, retirement_age - current_age)


class RetirementCalculator:
    """Calculator for retirement planning scenarios."""
    
    def __init__(self, current_savings: float, annual_contribution: float, 
                 annual_return: float = 0.07):
        """
        Initialize the retirement calculator.
        
        Args:
            current_savings (float): Current retirement savings
            annual_contribution (float): Annual contribution amount
            annual_return (float): Expected annual return rate (default: 7%)
        """
        self.current_savings = current_savings
        self.annual_contribution = annual_contribution
        self.annual_return = annual_return
    
    def project_balance(self, years: int) -> float:
        """
        Project retirement account balance after specified years.
        
        Args:
            years (int): Number of years to project
            
        Returns:
            float: Projected balance
        """
        balance = self.current_savings
        for _ in range(years):
            balance = balance * (1 + self.annual_return) + self.annual_contribution
        return balance


if __name__ == '__main__':
    print("KAG Retirement Project - Python Utilities")
    print(f"Current timestamp: {get_current_timestamp()}")
    
    # Example usage
    calculator = RetirementCalculator(
        current_savings=100000,
        annual_contribution=10000,
        annual_return=0.07
    )
    
    projected_balance = calculator.project_balance(20)
    print(f"Projected balance in 20 years: {format_currency(projected_balance)}")
