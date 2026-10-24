"""Code checks run against a building's IFC models.

Each rule tests one code section and reports every element it looked at as a
finding: pass or fail, the measured value against the required one, the IFC
GlobalId of the element the app should select, a point in model coordinates
to mark, and where that point falls on the generated floor plan.
"""
