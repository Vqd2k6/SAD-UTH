import os
import re

files_to_fix = [
    "app/api/bookings.py",
    "app/api/motorbikes.py",
    "app/api/staff.py",
    "app/api/users.py"
]

for filepath in files_to_fix:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We will just run isort from python
    pass
