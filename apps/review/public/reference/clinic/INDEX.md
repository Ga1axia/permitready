# Medical-Dental Clinic: reference documents

Index generated 2026-10-24 by `scripts/index_references.py` from the files in this folder. Sizes and counts are read from the files themselves.

| What | Count | Where |
| --- | --- | --- |
| Drawing set (generated) | 8 sheets + combined PDF | `drawings/` |
| Schedules (generated) | 3 CSV files | `schedules/` |
| Architectural model | 1 IFC file | `../../models/clinic.ifc` |
| Other discipline models | 4 IFC files | `models/` |
| COBie workbooks | 2 spreadsheets | `cobie/` |
| O&M documents | 497 files in 2013-10-09-ClinicOM.zip | `om/` |

## 1. Drawing set

Generated from the architectural model by `bun run drawings` (`scripts/make_drawings.py`). Every sheet exists as SVG and PDF; `clinic-drawing-set.pdf` has them all in order.

| Sheet | Title | Files |
| --- | --- | --- |
| G-001 | Cover sheet and sheet index | `clinic-G-001-cover-sheet-and-sheet-index.svg` / `.pdf` |
| A-101 | First Floor floor plan | `clinic-A-101-first-floor-floor-plan.svg` / `.pdf` |
| A-102 | Second Floor floor plan | `clinic-A-102-second-floor-floor-plan.svg` / `.pdf` |
| A-601.1 | Room schedule (page 1 of 2) | `clinic-A-601.1-room-schedule-page-1-of-2.svg` / `.pdf` |
| A-601.2 | Room schedule (page 2 of 2) | `clinic-A-601.2-room-schedule-page-2-of-2.svg` / `.pdf` |
| A-611.1 | Door schedule (page 1 of 2) | `clinic-A-611.1-door-schedule-page-1-of-2.svg` / `.pdf` |
| A-611.2 | Door schedule (page 2 of 2) | `clinic-A-611.2-door-schedule-page-2-of-2.svg` / `.pdf` |
| A-621 | Window schedule | `clinic-A-621-window-schedule.svg` / `.pdf` |

What the sheets contain:

- **G-001 cover:** sheet index, storeys and elevations, room counts and net areas per floor, door and window counts, source model details, and a key plan.
- **A-1xx floor plans:** walls and columns cut 1.2 m above each floor, door swings, rooms with number, name and area, door tags (mark in a box) and window tags (mark in a hexagon) that match the schedules, overall dimensions, north arrow, scale bar, and level data in the title block.
- **A-60x room schedule:** number, name, level, area, perimeter, height, volume, category, occupancy zone.
- **A-61x door schedule:** mark, level, rooms on each side, type, type mark, width, height, leaf thickness, operation, external, fire rating.
- **A-62x window schedule:** mark, level, room, type, type mark, width, height, sill and head heights, external.

Linked to the 3D model: `clinic-drawing-set.links.json` (and a `.links.json` beside each sheet) maps every room, door and window on the plans, and every schedule row, to its IFC GlobalId and its rectangle on the page. `index.json` lists the sheets, their pages in the set and the storey each plan shows. The app reads both: open the PDF pane on a sample building and the set opens beside the model, with clicks on either side selecting the same element.

## 2. Schedules (CSV)

| File | Rows | Contents |
| --- | ---: | --- |
| `clinic-doors.csv` | 254 | Same columns as the schedule sheet |
| `clinic-rooms.csv` | 269 | Same columns as the schedule sheet |
| `clinic-windows.csv` | 58 | Same columns as the schedule sheet |

## 3. 3D models

| File | Discipline | Schema | Size | Exported | Elements | Rooms (IfcSpace) |
| --- | --- | --- | ---: | --- | ---: | ---: |
| `clinic.ifc` | Architectural (opened by the app) | IFC2X3 | 13.0 MB | 2011-09-06 | 2620 | 269 |
| `Clinic_Electrical.ifc` | Electrical | IFC2X3 | 6.8 MB | 2012-12-18 | 2118 | 266 |
| `Clinic_HVAC.ifc` | Mechanical (HVAC) | IFC2X3 | 26.9 MB | 2012-03-29 | 11094 | 263 |
| `Clinic_Plumbing.ifc` | Plumbing | IFC2X3 | 55.8 MB | 2012-12-18 | 19645 | 0 |
| `Clinic_Structural.ifc` | Structural | IFC2X3 | 19.1 MB | 2011-07-11 | 1087 | 0 |

### clinic.ifc

- Discipline: Architectural (opened by the app)
- Authoring tool: 20100326_1700 (Solibri IFC Optimizer) Autodesk Revit Architecture 2011 - 1.0
- Storeys: TOF Footing (-1.00 m), First Floor (-0.00 m), Second Floor (+4.57 m), Roof - Main (+9.25 m)

| IFC class | Count |
| --- | ---: |
| IfcWallStandardCase | 1065 |
| IfcMember | 534 |
| IfcDoor | 254 |
| IfcCovering | 250 |
| IfcPlate | 172 |
| IfcFurnishingElement | 118 |
| IfcFlowTerminal | 102 |
| IfcWindow | 58 |
| IfcCurtainWall | 31 |
| IfcWall | 15 |
| IfcRailing | 9 |
| IfcStairFlight | 6 |
| IfcSlab | 3 |
| IfcStair | 3 |

### Clinic_Electrical.ifc

- Discipline: Electrical
- Authoring tool: 20121003_2115(x64) (Solibri IFC Optimizer) Autodesk Revit 2013
- Storeys: Level 1 (-0.00 m), Level 2 (+4.57 m), Roof - Main (+9.25 m)

| IFC class | Count |
| --- | ---: |
| IfcFlowTerminal | 2081 |
| IfcBuildingElementProxy | 29 |
| IfcFlowMovingDevice | 4 |
| IfcEnergyConversionDevice | 3 |
| IfcFlowStorageDevice | 1 |

### Clinic_HVAC.ifc

- Discipline: Mechanical (HVAC)
- Authoring tool: 20120224_1515 (Solibri IFC Optimizer) Autodesk Revit MEP 2013
- Storeys: TOF Footing (-1000.00 m), First Floor (+0.00 m), Second Floor (+4570.00 m), Roof - Mech (+9250.00 m)

| IFC class | Count |
| --- | ---: |
| IfcDistributionPort | 7390 |
| IfcFlowFitting | 1590 |
| IfcFlowSegment | 1548 |
| IfcFlowTerminal | 440 |
| IfcFlowController | 115 |
| IfcFlowMovingDevice | 8 |
| IfcEnergyConversionDevice | 3 |

### Clinic_Plumbing.ifc

- Discipline: Plumbing
- Authoring tool: 20121003_2115(x64) (Solibri IFC Optimizer) Autodesk Revit 2013
- Storeys: TOF Footing (-1000.00 m), Level 1 (-0.00 m), Level 2 (+4570.00 m)

| IFC class | Count |
| --- | ---: |
| IfcDistributionPort | 13058 |
| IfcFlowFitting | 3318 |
| IfcFlowSegment | 2893 |
| IfcFlowController | 254 |
| IfcFlowTerminal | 119 |
| IfcFlowMovingDevice | 2 |
| IfcFlowStorageDevice | 1 |

### Clinic_Structural.ifc

- Discipline: Structural
- Authoring tool: (Solibri IFC Optimizer) Autodesk Revit Architecture 2011 - 1.0
- Storeys: TOF Footing (-1.00 m), First Floor (-0.00 m), Second Floor (+4.57 m), Roof - Main (+9.25 m)

| IFC class | Count |
| --- | ---: |
| IfcBeam | 738 |
| IfcColumn | 195 |
| IfcFooting | 96 |
| IfcWallStandardCase | 26 |
| IfcSlab | 13 |
| IfcRoof | 12 |
| IfcRailing | 3 |
| IfcRamp | 1 |
| IfcRampFlight | 1 |
| IfcStair | 1 |
| IfcStairFlight | 1 |

## 4. COBie workbooks

### 2013-10-09-Clinic-Design-v14-WORKING-01.xlsx

COBie spreadsheet, design version, 1.4 MB.

| Facility field | Value |
| --- | --- |
| Facility | PN 0001 |
| Category | 11-13 24 14: Clinic |
| Project | Medical-Dental Clinic |
| Site | Default |
| Units | meters, squaremeters, cubicmeters |
| Area measurement | Autodesk Revit Architecture 2011 BIM Area |
| Authoring system | Autodesk Revit Architecture 2011 |
| Phase | Design |

| Sheet | Rows | What it holds |
| --- | ---: | --- |
| Instruction | 44 | How the workbook is organised; colour key for required and optional columns |
| Contact | 6 | People and companies referenced elsewhere: designers, contractors, manufacturers |
| Facility | 1 | The project, site and building, with the units every other sheet uses |
| Floor | 5 | Storeys with elevation and height |
| Space | 269 | Rooms: number, name, floor, category, areas |
| Zone | 260 | Groupings of rooms: occupancy, fire alarm, lighting, ventilation and circulation zones |
| Type | 366 | Product types: manufacturer, model number, warranty, expected life, nominal sizes |
| Component | 5071 | Every installed instance of a type, with the room it is in and its IFC GlobalId |
| System | 596 | Building systems (HVAC, plumbing, electrical, fire) and the components in each |
| Assembly | 0 | Assemblies of components or types |
| Connection | 0 | Physical connections between components |
| Spare | 0 | Spare parts per type and who supplies them |
| Resource | 0 | Materials, tools and training needed for maintenance |
| Job | 0 | Maintenance, inspection and safety tasks per type, with frequency and duration |
| Impact | 0 | Environmental and cost impacts |
| Document | 0 | Every handover document and the type, system or space it belongs to |
| Attribute | 7300 | Extra properties on any row of any other sheet |
| Coordinate | 1982 | Locations and bounding boxes of floors, spaces and components |
| Issue | 0 | Known issues and risks |
| PickLists | 3262 | Allowed values for category and status columns |

Floors: First Floor (0), Roof - Main (9.25), Second Floor (4.57), Site (0), TOF Footing (-1).

### 2013-10-09-Clinic-Handover-v14.xlsx

COBie spreadsheet, handover (as built) version, 1.5 MB.

| Facility field | Value |
| --- | --- |
| Facility | PN 0001 |
| Category | 11-13 24 14: Clinic |
| Project | Medical-Dental Clinic |
| Site | Default |
| Units | millimeters, squaremeters, cubicmeters |
| Area measurement | Autodesk Revit Architecture 2011 BIM Area |
| Authoring system | Autodesk Revit Architecture 2011 |
| Phase | Handover |

| Sheet | Rows | What it holds |
| --- | ---: | --- |
| Instruction | 44 | How the workbook is organised; colour key for required and optional columns |
| Contact | 59 | People and companies referenced elsewhere: designers, contractors, manufacturers |
| Facility | 1 | The project, site and building, with the units every other sheet uses |
| Floor | 5 | Storeys with elevation and height |
| Space | 269 | Rooms: number, name, floor, category, areas |
| Zone | 260 | Groupings of rooms: occupancy, fire alarm, lighting, ventilation and circulation zones |
| Type | 366 | Product types: manufacturer, model number, warranty, expected life, nominal sizes |
| Component | 5071 | Every installed instance of a type, with the room it is in and its IFC GlobalId |
| System | 596 | Building systems (HVAC, plumbing, electrical, fire) and the components in each |
| Assembly | 0 | Assemblies of components or types |
| Connection | 0 | Physical connections between components |
| Spare | 13 | Spare parts per type and who supplies them |
| Resource | 19 | Materials, tools and training needed for maintenance |
| Job | 36 | Maintenance, inspection and safety tasks per type, with frequency and duration |
| Impact | 0 | Environmental and cost impacts |
| Document | 675 | Every handover document and the type, system or space it belongs to |
| Attribute | 9542 | Extra properties on any row of any other sheet |
| Coordinate | 1982 | Locations and bounding boxes of floors, spaces and components |
| Issue | 0 | Known issues and risks |
| PickLists | 3262 | Allowed values for category and status columns |

Floors: First Floor (0), Roof - Main (9.25), Second Floor (4.57), Site (0), TOF Footing (-1).

### Cross-check: COBie handover against the architectural model

| Item | In COBie | In model |
| --- | --- | --- |
| Floors | 5 | 4 |
| Rooms | 269 | 269 |
| Doors (IfcDoor) | 248 matched by GlobalId | 254 |
| Windows (IfcWindow) | 58 matched by GlobalId | 58 |
| Components, all disciplines | 5071 |  |

COBie Component rows carry the IFC GlobalId in `ExtIdentifier`, so every door and window in the schedules can be joined to its COBie type, warranty and documents.

## 5. Manufacturer and O&M documents

The O&M archive holds 497 files (493 PDF, 4 DOC).

675 documents are listed in the COBie handover, attached to 152 product types and 33 systems or other items. 532 of the listed files are present in this folder. The full list, one row per document, is in `index/clinic-documents.csv`.

### Product types

| Item | Category | Manufacturer | Model | Warranty (parts) | Installed | Document kinds | Files here |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| AC Unit Type 1 | Unitary Air Conditioning Equipment | sales@mitsubishielectric.com | PC24EK1 | 1 year | 4 | Operation and Maintenance, Product Data | 4/5 |
| AC Unit Type 2 | Unitary Air Conditioning Equipment | sales@dataaire.com | DAPA-2.5 | 1 year | 1 | Operation and Maintenance, Product Data | 4/5 |
| AHU | Modular Indoor Air Handling Units | sales@York.com | AP-500 | 1 year | 2 | Closeout Submittals, Manufacturer Instructions, Operation and Maintenance, Product Data, Test Reports | 11/12 |
| Air Cooled Chiller | Rotary-Screw Water Chillers | sales@York.com | YCAS0150EC46Y | 1 year | 1 | Closeout Submittals, Operation and Maintenance, Product Data, Test Reports | 8/9 |
| Air Cooled Condensing Unit- Large | Cooling and Freeze Components | sales@dataaire.com | DRCU-0312 | 1 year | 1 | Operation and Maintenance, Product Data, Test Reports | 9/10 |
| Air Cooled Condensing Unit- Small | Cooling and Freeze Components | sales@mitsubishielectric.com | PUG24BKB | 1 year | 4 | Operation and Maintenance, Product Data, Test Reports | 9/10 |
| Air Separator | Supply Air Treatment | info@amtrol.com | 6-AS | 1 year | 2 | Product Data | 0/1 |
| BLOOD GAS ANALYZER | Medical Equipment | sales@radiometeramerica.com | ABL800 | 1 year | 1 | Product Data | 0/1 |
| Backflow Preventer | Non-Return Valves for Liquid Services | sales@apollovalves.com | RP40 | 5 year | 1 | Product Data | 0/1 |
| Ball Valve 100 mm | Adjusting/Controlling Valves for Liquid Services | sales@apollovalves.com | 64-10A | 2 year | 1 | Product Data | 0/1 |
| Ball Valve 150 mm | Adjusting/Controlling Valves for Liquid Services | sales@apollovalves.com | SS-P76 | 2 year | 1 | Product Data | 0/1 |
| Ball Valve 50 mm | Adjusting/Controlling Valves for Liquid Services | sales@apollovalves.com | 64-108 | 2 year | 167 | Product Data | 0/1 |
| Ball Valve 65 mm | Adjusting/Controlling Valves for Liquid Services | sales@apollovalves.com | 64-109 | 2 year | 2 | Product Data | 0/1 |
| Ball Valve 80 mm | Adjusting/Controlling Valves for Liquid Services | sales@apollovalves.com | 64-100 | 2 year | 1 | Product Data | 0/1 |
| Boiler | Hot Water Heat Generators | sales@lochinvar.com | CBN1435 | 1 year | 1 | Closeout Submittals, Operation and Maintenance, Product Data, Test Reports, Warranty Certificate | 12/13 |
| Cabinet Type A | Kitchen Casework | sales@goodtime.com | 2-Door 2-drawer Base Cabinet | 5 year | 52 | Product Data | 0/1 |
| Cabinet Type B | Kitchen Casework | sales@goodtime.com | 2-Door wall Cabinet | 5 year | 13 | Product Data | 0/1 |
| Cabinet Type C | Kitchen Casework | sales@goodtime.com | 1-Door wall Cabinet | 5 year | 2 | Product Data | 0/1 |
| Counter Top | Kitchen Casework | sales@marble.com | African Beige 522 | 3 year | 50 | Product Data | 0/1 |
| Defibrillator | Patient Care Equipment | sales@zoll.com | M-SERIES | 1 year | 2 | Product Data | 0/1 |
| Door Type A | Doors | fibrdor@fibrdor.com | Standard Fib-R-Dor | 2 year | 178 | Operation and Maintenance, Product Data, Specifications | 0/4 |
| Door Type B | Doors | fibrdor@fibrdor.com | Standard Fib-R-Dor w/Window | 2 year | 47 | Operation and Maintenance, Product Data, Specifications | 0/5 |
| Door Type C | Doors | quickquote@doorcomponents.com | L Series | 2 year | 4 | Manufacturer Instructions, Product Data | 0/5 |
| Door Type D | Doors | sales@panelfold.com | Sonicwal/66 | 1 year | 2 | Manufacturer Instructions, Product Data | 2/3 |
| Door Type E | Doors | contact@securalldoors.com | HD36x84 | 10 year | 7 | Manufacturer Instructions, Product Data, Specifications | 5/5 |
| Door Type F | Doors | sales@marvin.com | CCD3070 | 10 year | 5 | Manufacturer Instructions, Product Data, Specifications | 7/7 |
| Door Type G | Doors | quickquote@doorcomponents.com | S Series-FLI | 5 year | 2 | Product Data | 3/3 |
| Door Type H | Doors | info@crossaluminum.com | WS-500-HD-VL6 | 10 year | 1 | Manufacturer Instructions, Product Data | 4/4 |
| Drinking Fountain R-2201 | Drinking Fountains/Coolers | sales@kohler.com | K-5264 | 1 year | 4 | Product Data | 0/1 |
| Duplex Receptacle | Ground Fault Receptacles | salesrep@legrand.com | 8200HI | 1 year | 958 | Product Data | 0/1 |
| Duplex Receptacle- GFCI | Ground Fault Receptacles | salesrep@legrand.com | 2095W | 1 year | 3 | Product Data | 0/1 |
| Elevator-Hydraulic | Elevators | sales@us.kone.com | EcoSpace MRL | 1 year | 1 | Closeout Submittals, Design Data, Installation Instructions, Manufacturer's Field Reports, Manufacturer's Instructions, Operation and Maintenance, Shop Drawings | 29/29 |
| Expansion Tank | Tanks, Reservoirs | info@amtrol.com | WX-453-C | 1 year | 2 | Product Data | 0/1 |
| Fan- Centrifugal Air Foil | Centrifugal Fans | sales@York.com | AP-500-FR | 1 year | 2 | Operation and Maintenance, Product Data | 2/3 |
| Fan- In Line Type 1 | Centrifugal Fans | sales@greenheck.com | TCB-1-18-7 | 1 year | 1 | Operation and Maintenance, Product Data | 2/3 |
| Fan- In Line Type 2 | Centrifugal Fans | sales@greenheck.com | TCB-2-22-7 | 1 year | 1 | Operation and Maintenance, Product Data | 2/3 |
| Fan- In Line Type 3 | Centrifugal Fans | sales@greenheck.com | TCB-2-10-3 | 1 year | 1 | Operation and Maintenance, Product Data | 2/3 |
| Fan- Roof Mounted Type 1 | Centrifugal Fans | sales@greenheck.com | GB-200HP-5 | 1 year | 1 | Operation and Maintenance, Product Data | 2/3 |
| Fan- Roof Mounted Type 2 | Centrifugal Fans | sales@greenheck.com | GB-180-5 | 1 year | 1 | Operation and Maintenance, Product Data | 2/3 |
| Fan- Roof Mounted Type 3 | Centrifugal Fans | sales@greenheck.com | GB-200-10 | 1 year | 1 | Operation and Maintenance, Product Data | 2/3 |
| Fan- Roof Mounted Type 4 | Centrifugal Fans | sales@greenheck.com | GB-080D | 1 year | 1 | Operation and Maintenance, Product Data | 2/3 |
| Fan- Sidewall Type 1 | Fans | sales@greenheck.com | SS1-20-432-A15 | 1 year | 1 | Operation and Maintenance, Product Data | 2/3 |
| Fan- Sidewall Type 2 | Fans | sales@greenheck.com | SE1-12-432-A4 | 1 year | 1 | Operation and Maintenance, Product Data | 2/3 |
| Fan- Sidewall Type 3 | Fans | sales@greenheck.com | SE1-10-428-P-1 | 1 year | 4 | Operation and Maintenance, Product Data | 2/3 |
| Fire Extinguisher Cabinet | Fire Fighting Terminal Components | sales@spycor.com | 2712-R | 0 year | 10 | Product Data | 1/1 |
| Fire Sprinkler | Fire Fighting Sprinkler Heads | sales@pacificfiresafety.com | GB 5.6 K-Factor | 1 year | 418 | Closeout Submittals, Operation and Maintenance, Product Data | 17/18 |
| Grab Bar Type A | Bath Grab Bars | sales@bradleycorp.com | 8370-001300 | 1 year | 22 | Product Data | 1/1 |
| Grab Bar Type B | Bath Grab Bars | sales@bradleycorp.com | 8370-001420 | 1 year | 22 | Product Data | 1/1 |
| Lavatory P-3070 | Sinks/Lavatories | sales@kohler.com | K-2035 | 1 year | 4 | Product Data | 0/1 |
| Lavatory P-3100 | Sinks/Lavatories | sales@kohler.com | K-2211 | 1 year | 26 | Product Data | 0/1 |
| Light Fixture A2 | Downlights | sales@lithonia.com | GT4 MV | 2 year | 26 | Product Data | 0/1 |
| Light Fixture A28 | Downlights | sales@lithonia.com | 2GT8 4 32 A12 MVOLT 1/4 | 1 year | 5 | Product Data | 0/1 |
| Light Fixture A2B | Downlights | sales@lithonia.com | GT4 MV-PS1400QD M12 | 2 year | 5 | Product Data | 0/1 |
| Light Fixture A3 | Downlights | sales@lithonia.com | 2GT8 4 32 A12 MVOLT 1/4 EL14 | 1 year | 40 | Product Data | 0/1 |
| Light Fixture B1 | Downlights | sales@lithonia.com | GT2 MV | 2 year | 249 | Product Data | 0/1 |
| Light Fixture B18 | Downlights | sales@cooperindustries.com | CFD FA 4 32 A125 277 EB81 | 1 year | 10 | Product Data | 0/1 |
| Light Fixture B1B | Downlights | sales@lithonia.com | GT2 MV-PSQ500QD M24 | 2 year | 23 | Product Data | 0/1 |
| Light Fixture B1D | Downlights | sales@lithonia.com | 2ES8P 232 277 BSNP L835HT8 | 1 year | 4 | Product Data | 0/1 |
| Light Fixture B3 | Downlights | sales@lithonia.com | 2ES8P 2U31 BILP L835HT8 | 1 year | 95 | Product Data | 0/1 |
| Light Fixture B3B | Downlights | sales@lithonia.com | 2ES8P 2U31 BILP L835HT8 EL | 1 year | 55 | Product Data | 0/1 |
| Light Fixture B3D | Downlights | sales@lithonia.com | 2ES8P 2U31 BSNP L835HT8 | 1 year | 6 | Product Data | 0/1 |
| Light Fixture B3DB | Downlights | sales@lithonia.com | 2ES8P 2U31 BSNP L835HT8 EL | 1 year | 2 | Product Data | 0/1 |
| Light Fixture C1 | General Luminaries, Non Directional | sales@lithonia.com | 2VT8 3 32 ADP MVOLT 1/3 GEB10IS LP830 | 1 year | 25 | Product Data | 0/1 |
| Light Fixture C18 | General Luminaries, Non Directional | sales@cooperindustries.com | CFD FA 3 32 A125 277 EB81 | 1 year | 37 | Product Data | 0/1 |
| Light Fixture C18B | General Luminaries, Non Directional | sales@cooperindustries.com | CFD FA 3 32 A125 277 EL4 EB81 | 1 year | 4 | Product Data | 0/1 |
| Light Fixture C1B | General Luminaries, Non Directional | sales@lithonia.com | 2VT8 3 32 ADP MVOLT 1/3 GEB10IS LP830 EL14 | 1 year | 2 | Product Data | 0/1 |
| Light Fixture C1D | General Luminaries, Non Directional | sales@cooperindustries.com | 2GC8 332A 277V HR8_DIM | 1 year | 3 | Product Data | 0/1 |
| Light Fixture D18 | General Luminaries, Non Directional | sales@lumaxlighting.com | RG 3 32 14 CO 9 FA RS PRS | 1 year | 6 | Product Data | 0/1 |
| Light Fixture E1 | General Luminaries, Non Directional | sales@lithonia.com | DMW 2 96T8HO 277 GEB10PS EL14DW | 1 year | 2 | Product Data | 0/1 |
| Light Fixture E2 | General Luminaries, Non Directional | sales@lithonia.com | LB 2 17 MVOLT GEB10IS | 1 year | 2 | Product Data | 0/1 |
| Light Fixture LV | Downlights | info@contrastlighting.com | R3450D | 1 year | 16 | Product Data | 0/1 |
| Light Fixture M175 | Downlights | sales@lithonia.com | TXD 175MP A23 TB SCWA LPI | 2 year | 1 | Product Data | 0/1 |
| Light Fixture M250 | Downlights | sales@lithonia.com | TXD 250MP A23 TB SCWA LPI | 2 year | 5 | Product Data | 0/1 |
| Light Fixture M400 | Downlights | sales@lithonia.com | TXD 400MP A23 TB SCWA LPI | 2 year | 4 | Product Data | 0/1 |
| Light Fixture P1 | General Luminaries, Non Directional | sales@cooperindustries.com | A04 SI N 3 LF 032 277 W P2I24 | 1 year | 13 | Product Data | 0/1 |
| Light Fixture Q1 | General Luminaries, Non Directional | sales@lithonia.com | AF 1 32 277 GEB10IS | 1 year | 6 | Product Data | 0/1 |
| Light Fixture Q4 | General Luminaries, Non Directional | sales@lithonia.com | AF 2 32 277 GEB10IS | 1 year | 38 | Product Data | 0/1 |
| Light Fixture Q4B | General Luminaries, Non Directional | sales@lithonia.com | AF 2 32 277 GEB10IS- PSQ500QD M24 | 1 year | 13 | Product Data | 0/1 |
| Light Fixture R1 | General Luminaries, Non Directional | sales@lithonia.com | ES8P 232 277 BILP L835HT8 | 1 year | 4 | Product Data | 0/1 |
| Light Fixture S | Downlights | sales@lithonia.com | LP6N 609A | 1 year | 9 | Product Data | 0/1 |
| Light Fixture SA | General Luminaries, Non Directional | sales@lithonia.com | 6LD1 | 1 year | 3 | Product Data | 0/1 |
| Light Fixture SB | Downlights | sales@lithonia.com | LP3V 277 3Vo1AZ | 1 year | 39 | Product Data | 0/1 |
| Light Fixture SBB | Downlights | sales@cooperindustries.com | H471RICAT | 2 year | 12 | Product Data | 0/1 |
| Light Fixture SC | Downlights | sales@lithonia.com | LF8N 2/32TRT F8B4W 277 | 1 year | 25 | Product Data | 0/1 |
| Light Fixture SCB | Downlights | sales@lithonia.com | LF8N 2/32TRT F8B4W 277 EL | 1 year | 5 | Product Data | 0/1 |
| Light Fixture SD | Downlights | sales@lithonia.com | LF8N 2/26TRT F8B4W 277 | 1 year | 20 | Product Data | 0/1 |
| Light Fixture SDB | Downlights | sales@lithonia.com | LF8N 2/26TRT F8B4W 277 EL | 1 year | 7 | Product Data | 0/1 |
| Light Fixture SE | Downlights | sales@cooperindustries.com | MEX AHC 226E UNV | 1 year | 5 | Product Data | 0/1 |
| Light Fixture T1 | General Luminaries, Non Directional | sales@allightingltd.com | AL8350 F32T8 277 UL | 1 year | 8 | Product Data | 0/1 |
| Light Fixture X1 | Illuminated Signs/Boards | sales@lithonia.com | LE EL N | 5 year | 1 | Product Data | 0/1 |
| Light Fixture Y1 | Specialized Lighting by Location or Use | info@wolfxray.com | 19110-DR | 1 year | 1 | Product Data | 0/1 |
| Light Fixture Y2 | Specialized Lighting by Location or Use | DayBrite.Marketing@Philips.com | 548S-1DR-1 | 1 year | 1 | Product Data | 0/1 |
| Light Switch | Switches | salesrep@legrand.com | PS15AC1CSL | 1 year | 232 | Product Data | 0/1 |
| Light Switch- Three Way | Switches | salesrep@legrand.com | PS15AC3CSL | 1 year | 4 | Product Data | 0/1 |
| Lighting and Appliance Panelboard | Distribution Boards and Control Panels | sales@eaton.com | PRL4 | 1 year | 28 | Product Data | 0/1 |
| Mop Basin P-4700 | Sinks/Lavatories | sales@elkayusa.com | EFS2523C | 5 year | 7 | Product Data | 0/1 |
| PH MONITOR | Medical Equipment | info@coleparmer.com | R-56717-32 | 1 year | 1 | Product Data | 0/1 |
| PH Meter | Medical Equipment | sales@4oakton.com | WD-35419-03 | 1 year | 1 | Product Data | 0/1 |
| Pump- Cold Water | Pumps | sales@taco-hvac.com | VI3008 | 1 year | 2 | Closeout Submittals, Operation and Maintenance, Product Data | 2/3 |
| Pump- Hot Water | Pumps | sales@taco-hvac.com | VI2008 | 1 year | 2 | Closeout Submittals, Operation and Maintenance, Product Data | 2/3 |
| Return Diffuser 150 Face | Diffusers, Registers, and Grilles | info@truaire.com | 560M | 1 year | 17 | Product Data | 0/1 |
| Return Diffuser 200 Face | Diffusers, Registers, and Grilles | info@truaire.com | 560M | 1 year | 64 | Product Data | 0/1 |
| Return Diffuser 300 Face | Diffusers, Registers, and Grilles | info@truaire.com | 560M | 1 year | 17 | Product Data | 0/1 |
| Return Diffuser 350 Face | Diffusers, Registers, and Grilles | info@truaire.com | 560M | 1 year | 21 | Product Data | 0/1 |
| Return Diffuser 400 Face | Diffusers, Registers, and Grilles | info@truaire.com | 560M | 1 year | 14 | Product Data | 0/1 |
| Return Diffuser 450 Face | Diffusers, Registers, and Grilles | info@truaire.com | 560M | 1 year | 5 | Product Data | 0/1 |
| Return Diffuser 500 Face | Diffusers, Registers, and Grilles | info@hartcool.com | REN4 | 1 year | 5 | Product Data | 0/1 |
| Shower P-5040 | Bath/Shower Units | sales@kohler.com | K-12113-C | 1 year | 3 | Product Data | 0/1 |
| Shower Seat | Shower/Bath Seats | sales@inprocorp.com | DSGBFSTADA-WHT | 5 year | 3 | Product Data | 2/2 |
| Sink CS-090M | Sinks/Lavatories | sales@elkayusa.com | ELUH1316 | 5 year | 1 | Product Data | 0/1 |
| Sink CS-150 | Sinks/Lavatories | sales@elkayusa.com | LRQ1316 | 5 year | 12 | Product Data | 0/1 |
| Sink CS-180A | Sinks/Lavatories | sales@elkayusa.com | DLRQ1722 | 5 year | 3 | Product Data | 0/1 |
| Sink CS-180M | Sinks/Lavatories | sales@elkayusa.com | CR1721 | 5 year | 13 | Product Data | 0/1 |
| Sink D-0795 | Sinks/Lavatories | sales@elkayusa.com | BPSH15C | 5 year | 13 | Product Data | 0/1 |
| Sink D-0800 | Sinks/Lavatories | sales@elkayusa.com | ELUH1418 | 5 year | 3 | Product Data | 0/1 |
| Sink P-6500 | Sinks/Lavatories | sales@elkayusa.com | LH1720C | 5 year | 1 | Product Data | 0/1 |
| Supply Diffuser 600 Face | Diffusers, Registers, and Grilles | info@truaire.com | 1020 MAS (SUPPLY) | 1 year | 283 | Product Data | 0/1 |
| Supply Diffuser Sidewall 200mm | Diffusers, Registers, and Grilles | info@truaire.com | 403M | 1 year | 1 | Product Data | 0/1 |
| Supply Diffuser Sidewall 400mm | Diffusers, Registers, and Grilles | info@truaire.com | 403M | 1 year | 3 | Product Data | 0/1 |
| Supply Diffuser Sidewall 800 mm | Diffusers, Registers, and Grilles | sales@leader-ventilation.com | VSD | 1 year | 18 | Product Data | 0/1 |
| Supply Diffuser Sidewall Standard | Diffusers, Registers, and Grilles | info@truaire.com | 403M | 1 year | 6 | Product Data | 0/1 |
| Toilet Door | Doors | sales@grainger.com | 40-9263561 | 1 year | 8 | Product Data | 3/3 |
| Transformer Switchboard | Distribution Boards and Control Panels | sales@eaton.com | Generator Quick Connect Switchboard | 1 year | 2 | Product Data | 0/1 |
| Urinal P-8150 | Urinals | sales@kohler.com | K-4904-ET | 1 year | 3 | Product Data | 0/1 |
| VAV 100 mm | Variable Volume Air Terminal Units | sales@krueger-hvac.com | LMHS-4 | 1 year | 3 | Closeout Submittals, Product Data | 1/2 |
| VAV 125 mm | Variable Volume Air Terminal Units | sales@krueger-hvac.com | LMHS-5 | 1 year | 10 | Closeout Submittals, Product Data | 1/2 |
| VAV 150 mm | Variable Volume Air Terminal Units | sales@krueger-hvac.com | LMHS-6 | 1 year | 12 | Closeout Submittals, Product Data | 1/2 |
| VAV 175 mm | Variable Volume Air Terminal Units | sales@krueger-hvac.com | LMHS-7 | 1 year | 20 | Closeout Submittals, Product Data | 1/2 |
| VAV 200 mm | Variable Volume Air Terminal Units | sales@krueger-hvac.com | LMHS-8 | 1 year | 43 | Closeout Submittals, Product Data | 1/2 |
| VAV 225 mm | Variable Volume Air Terminal Units | sales@krueger-hvac.com | LMHS-9 | 1 year | 23 | Closeout Submittals, Product Data | 1/2 |
| VAV 250 mm | Variable Volume Air Terminal Units | sales@krueger-hvac.com | LMHS-10 | 1 year | 11 | Closeout Submittals, Product Data | 1/2 |
| VAV 300 mm | Variable Volume Air Terminal Units | sales@krueger-hvac.com | LMHS-12 | 1 year | 6 | Closeout Submittals, Product Data | 1/2 |
| VAV 350 mm | Variable Volume Air Terminal Units | sales@krueger-hvac.com | LMHS-14 | 1 year | 4 | Closeout Submittals, Product Data | 1/2 |
| VAV 400 mm | Variable Volume Air Terminal Units | sales@krueger-hvac.com | LMHS-16 | 1 year | 1 | Closeout Submittals, Product Data | 1/2 |
| Water Closet P-9050 | Water Operated Water Closets | sales@americanstandard-us.com | 3461.528 | 1 year | 21 | Product Data | 0/1 |
| Water Closet P-9050M | Water Operated Water Closets | sales@americanstandard-us.com | 3451.528 | 1 year | 3 | Product Data | 0/1 |
| Water Heater | Storage Water Heaters | sales@PVI.com | 4OP 250 AMXLSN 106292 | 5 year | 1 | Operation and Maintenance, Product Data, Warranty Certificate | 3/4 |
| Window Type W1 | Fixed Windows | sales@fleetwoodusa.com | KONA 3800 | 3 year | 58 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 6/6 |
| Window Type W10 | Fixed Windows | sales@fleetwoodusa.com | KONA 3800 | 3 year | 1 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 6/6 |
| Window Type W11 | Fixed Windows | sales@fleetwoodusa.com | KONA 3800 | 3 year | 1 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 6/6 |
| Window Type W12 | Fixed Windows | sales@fleetwoodusa.com | KONA 3800 | 3 year | 1 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 6/6 |
| Window Type W13 | Fixed Windows | sales@fleetwoodusa.com | KONA 3800 | 3 year | 1 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 6/6 |
| Window Type W3 | Fixed Windows | sales@fleetwoodusa.com | KONA 3800 | 3 year | 2 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 6/6 |
| Window Type W4 | Fixed Windows | sales@fleetwoodusa.com | KONA 3800 | 3 year | 2 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 6/6 |
| Window Type W5 | Fixed Windows | sales@efcocorp.com | Series 406 | 3 year | 1 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 5/5 |
| Window Type W6 | Fixed Windows | sales@efcocorp.com | Series 406 | 3 year | 1 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 5/5 |
| Window Type W7 | Fixed Windows | sales@efcocorp.com | Series 406 | 3 year | 1 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 5/5 |
| Window Type W8 | Fixed Windows | sales@efcocorp.com | Series 406 | 3 year | 1 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 5/5 |
| Window Type W9 | Fixed Windows | sales@efcocorp.com | Series 416 | 3 year | 1 | Manufacturer Instructions, Product Data, Shop Drawings, Specifications | 5/5 |
| Workstation D-0935M | Plaster Sinks | sales@elkayusa.com | LR1716SC | 5 year | 1 | Product Data | 0/1 |
| Workstation D-0985 | Clinic Sinks | sales@elkayusa.com | LR1716C | 5 year | 1 | Product Data | 0/1 |
| X-Ray | Radiology Equipment | sales@siemens.com | Axiom Multix M | 5 year | 1 | Product Data | 0/1 |

### Component documents

| Item | Category | Manufacturer | Model | Warranty (parts) | Installed | Document kinds | Files here |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| AC Unit Type 1 AC-1 |  |  |  |  |  | Test Reports | 2/2 |
| ACC-1 |  |  |  |  |  | Test Reports | 2/2 |
| AHU-1 |  |  |  |  |  | Test Reports | 2/2 |
| AHU-2 |  |  |  |  |  | Test Reports | 2/2 |
| Boiler B-1 |  |  |  |  |  | Test Reports | 1/1 |
| Fan- EF-3 |  |  |  |  |  | Test Reports | 1/1 |
| Fan- EF-5 |  |  |  |  |  | Test Reports | 1/1 |
| Fan- EF-6 |  |  |  |  |  | Test Reports | 1/1 |
| Fan- EF-7 |  |  |  |  |  | Test Reports | 1/1 |
| Fan- EF1-1 |  |  |  |  |  | Test Reports | 2/2 |
| Fan- EF1-2 |  |  |  |  |  | Test Reports | 2/2 |
| Fan- EF1-3 |  |  |  |  |  | Test Reports | 1/1 |
| Fan- EF1-4 |  |  |  |  |  | Test Reports | 1/1 |
| Fan- EF2-1 |  |  |  |  |  | Test Reports | 1/1 |
| Fan- EF2-2 |  |  |  |  |  | Test Reports | 1/1 |
| Fan- EF2-3 |  |  |  |  |  | Test Reports | 1/1 |
| Fan- SF-1 |  |  |  |  |  | Manufacturer's Field Reports, Test Reports | 2/2 |
| Fan- SF-4 |  |  |  |  |  | Test Reports | 1/1 |
| Pump CWP-1 |  |  |  |  |  | Test Reports | 1/1 |
| Pump CWP-2 |  |  |  |  |  | Test Reports | 1/1 |
| Pump HWP-1 |  |  |  |  |  | Test Reports | 1/1 |
| Pump HWP-2 |  |  |  |  |  | Test Reports | 1/1 |

### Facility documents

| Item | Category | Manufacturer | Model | Warranty (parts) | Installed | Document kinds | Files here |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| PN 0001 |  |  |  |  |  | Certificates, Closeout Submittals, Design Data, Manufacturer Instructions, Manufacturer's Instructions, Operation and Maintenance, Product Data, Test Reports, Warranty Certificate | 177/178 |

### Floor documents

| Item | Category | Manufacturer | Model | Warranty (parts) | Installed | Document kinds | Files here |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| First Floor |  |  |  |  |  | Closeout Submittals | 1/1 |
| Roof - Main |  |  |  |  |  | Closeout Submittals, Warranty Certificate | 3/3 |
| Second Floor |  |  |  |  |  | Closeout Submittals | 1/1 |

### Space documents

| Item | Category | Manufacturer | Model | Warranty (parts) | Installed | Document kinds | Files here |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| 1E15 |  |  |  |  |  | Closeout Submittals | 2/2 |
| 2D05 |  |  |  |  |  | Closeout Submittals | 2/2 |

### Spare documents

| Item | Category | Manufacturer | Model | Warranty (parts) | Installed | Document kinds | Files here |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| PF-1 |  |  |  |  |  | Operation and Maintenance | 1/1 |

### System documents

| Item | Category | Manufacturer | Model | Warranty (parts) | Installed | Document kinds | Files here |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| Direct Digital Control System |  |  |  |  |  | Closeout Submittals, Design Data, Operation and Maintenance, Product Data | 25/25 |
| Fire Protection |  |  |  |  |  | Design Data, Operation and Maintenance, Product Data | 17/18 |
| HVAC System |  |  |  |  |  | Closeout Submittals, Operation and Maintenance | 11/11 |
| Medical Gas |  |  |  |  |  | Closeout Submittals, Design Data, Operation and Maintenance, Product Data | 22/22 |

## Licenses

The buildingSMART sample files are published under CC BY 4.0. Manufacturer product data, O&M manuals and warranties are third-party literature: use them for internal checks, not in public demos. Generated drawings and schedules carry the model credit on every sheet. See `../README.md`.
