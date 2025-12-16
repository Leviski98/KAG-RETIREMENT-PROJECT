# KAG Retirement Project

A multi-language project combining HTML, CSS, JavaScript, and Python for retirement planning and web development.

## Project Structure

```
KAG RETIREMENT PROJECT/
├── .github/
│   └── copilot-instructions.md    # Copilot configuration
├── src/
│   ├── styles.css                 # CSS styling
│   └── script.js                  # JavaScript functionality
├── scripts/
│   └── utils.py                   # Python utilities
├── index.html                     # Main HTML entry point
└── README.md                      # Project documentation
```

## Features

- **Frontend**: HTML5 semantic markup with responsive CSS and JavaScript interactivity
- **Backend**: Python utilities for retirement calculations and data management
- **Responsive Design**: Mobile-friendly layout that adapts to different screen sizes
- **Form Handling**: Contact form with validation and submission handling
- **Retirement Calculations**: Python-based retirement planning tools

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Responsive styling with gradients and transitions
- **JavaScript (ES6+)**: Modern JavaScript for interactivity
- **Python 3**: Backend utilities and calculations

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.6+ (for running Python scripts)

### Running the Web Application

1. Open `index.html` in your web browser, or
2. Use a local web server:
   ```bash
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000`

### Running Python Scripts

```bash
python scripts/utils.py
```

## Usage Examples

### Python Retirement Calculator

```python
from scripts.utils import RetirementCalculator, format_currency

# Create calculator with initial conditions
calc = RetirementCalculator(
    current_savings=100000,
    annual_contribution=10000,
    annual_return=0.07
)

# Project balance in 20 years
balance = calc.project_balance(20)
print(f"Projected balance: {format_currency(balance)}")
```

### JavaScript Form Handling

The contact form automatically handles submissions and logs the data to the browser console.

## Development

### Code Style

- Follow HTML5 semantic conventions
- Use CSS utility classes for reusable styles
- Write JavaScript with proper documentation and error handling
- Follow PEP 8 guidelines for Python code

### File Locations

- Frontend files: `src/`
- Backend scripts: `scripts/`
- Main entry point: `index.html`

## Features

- Smooth navigation with scroll behavior
- Responsive grid and flexbox layouts
- Form validation and submission handling
- Python-based retirement calculations
- Currency formatting utilities

## License

All rights reserved. © 2025 KAG Retirement Project

## Support

For questions or issues, please refer to the copilot-instructions.md file in the .github directory.
