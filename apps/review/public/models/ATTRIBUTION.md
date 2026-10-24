# Sample models

The IFC files in this folder are downloaded by `bun run samples` and are not
committed. Each keeps its own license.

| File | Model | License | Credit and source |
| --- | --- | --- | --- |
| `kit-office.ifc` | Office building (AC20-Institute-Var-2) | Unrestricted use | Institute for Automation and Applied Informatics (IAI) / Karlsruhe Institute of Technology (KIT). https://www.ifcwiki.org/index.php?title=KIT_IFC_Examples |
| `duplex.ifc` | Duplex Apartment, architectural model | CC BY 4.0 | BSI (2020) "Duplex Apartment Test Files," buildingSMART International. https://github.com/buildingsmart-community/Community-Sample-Test-Files |
| `clinic.ifc` | Medical-Dental Clinic, architectural model | CC BY 4.0 | BSI (2020) "Medical-Dental Test Files," buildingSMART International. https://github.com/buildingsmart-community/Community-Sample-Test-Files |

Changes made: none to the files themselves. They are converted to Pascal
scene graphs in the browser at load time, and the 2D floor plans in
`../reference/*/drawings/` are generated from them; the originals are not
modified. The documents published with these models are listed in
`../reference/README.md`.
