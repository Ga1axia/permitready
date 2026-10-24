# Duplex Apartment: reference documents

Index generated 2026-10-24 by `scripts/index_references.py` from the files in this folder. Sizes and counts are read from the files themselves.

| What | Count | Where |
| --- | --- | --- |
| Drawing set (generated) | 6 sheets + combined PDF | `drawings/` |
| Schedules (generated) | 3 CSV files | `schedules/` |
| Architectural model | 1 IFC file | `../../models/duplex.ifc` |
| Other discipline models | 4 IFC files | `models/` |
| COBie workbooks | 2 spreadsheets | `cobie/` |
| Overview images | 4 images | `images/` |
| Manufacturer documents | 47 files | `product-data/` |

## 1. Drawing set

Generated from the architectural model by `bun run drawings` (`scripts/make_drawings.py`). Every sheet exists as SVG and PDF; `duplex-drawing-set.pdf` has them all in order.

| Sheet | Title | Files |
| --- | --- | --- |
| G-001 | Cover sheet and sheet index | `duplex-G-001-cover-sheet-and-sheet-index.svg` / `.pdf` |
| A-101 | Level 1 floor plan | `duplex-A-101-level-1-floor-plan.svg` / `.pdf` |
| A-102 | Level 2 floor plan | `duplex-A-102-level-2-floor-plan.svg` / `.pdf` |
| A-601 | Room schedule | `duplex-A-601-room-schedule.svg` / `.pdf` |
| A-611 | Door schedule | `duplex-A-611-door-schedule.svg` / `.pdf` |
| A-621 | Window schedule | `duplex-A-621-window-schedule.svg` / `.pdf` |

What the sheets contain:

- **G-001 cover:** sheet index, storeys and elevations, room counts and net areas per floor, door and window counts, source model details, and a key plan.
- **A-1xx floor plans:** walls and columns cut 1.2 m above each floor, door swings, rooms with number, name and area, door tags (mark in a box) and window tags (mark in a hexagon) that match the schedules, overall dimensions, north arrow, scale bar, and level data in the title block.
- **A-60x room schedule:** number, name, level, area, perimeter, height, volume, category, occupancy zone.
- **A-61x door schedule:** mark, level, rooms on each side, type, type mark, width, height, leaf thickness, operation, external, fire rating.
- **A-62x window schedule:** mark, level, room, type, type mark, width, height, sill and head heights, external.

Linked to the 3D model: `duplex-drawing-set.links.json` (and a `.links.json` beside each sheet) maps every room, door and window on the plans, and every schedule row, to its IFC GlobalId and its rectangle on the page. `index.json` lists the sheets, their pages in the set and the storey each plan shows. The app reads both: open the PDF pane on a sample building and the set opens beside the model, with clicks on either side selecting the same element.

## 2. Schedules (CSV)

| File | Rows | Contents |
| --- | ---: | --- |
| `duplex-doors.csv` | 14 | Same columns as the schedule sheet |
| `duplex-rooms.csv` | 21 | Same columns as the schedule sheet |
| `duplex-windows.csv` | 24 | Same columns as the schedule sheet |

## 3. 3D models

| File | Discipline | Schema | Size | Exported | Elements | Rooms (IfcSpace) |
| --- | --- | --- | ---: | --- | ---: | ---: |
| `duplex.ifc` | Architectural (opened by the app) | IFC2X3 | 2.4 MB | 2011-09-07 | 218 | 21 |
| `Duplex_Electrical_20121207.ifc` | Electrical | IFC2X3 | 1.6 MB | 2012-12-18 | 103 | 1 |
| `Duplex_MEP_20110907.ifc` | Mechanical, electrical and plumbing | IFC2X3 | 17.9 MB | 2011-09-07 | 926 | 42 |
| `Duplex_M_20111024_ROOMS_AND_SPACES.ifc` | Mechanical: rooms and spaces | IFC2X3 | 8.8 MB | 2011-10-24 | 487 | 37 |
| `Duplex_Plumbing_20121113.ifc` | Plumbing | IFC2X3 | 31.6 MB | 2012-12-18 | 1468 | 1 |

### duplex.ifc

- Discipline: Architectural (opened by the app)
- Authoring tool: 20100326_1700 Autodesk Revit Architecture 2011 - 1.0
- Storeys: T/FDN (-1.25 m), Level 1 (+0.00 m), Level 2 (+3.10 m), Roof (+6.00 m)

| IFC class | Count |
| --- | ---: |
| IfcFurnishingElement | 61 |
| IfcWallStandardCase | 56 |
| IfcWindow | 24 |
| IfcSlab | 21 |
| IfcDoor | 14 |
| IfcCovering | 13 |
| IfcBeam | 8 |
| IfcFooting | 7 |
| IfcMember | 4 |
| IfcRailing | 4 |
| IfcStair | 2 |
| IfcStairFlight | 2 |
| IfcRoof | 1 |
| IfcWall | 1 |

### Duplex_Electrical_20121207.ifc

- Discipline: Electrical
- Authoring tool: 20121003_2115(x64) Autodesk Revit 2013
- Storeys: Level 1 (+0.00 m), Level 2 (+10.17 m), Roof (+19.69 m)

| IFC class | Count |
| --- | ---: |
| IfcFlowTerminal | 82 |
| IfcFlowController | 8 |
| IfcBuildingElementProxy | 4 |
| IfcFlowMovingDevice | 4 |
| IfcDistributionControlElement | 3 |
| IfcEnergyConversionDevice | 2 |

### Duplex_MEP_20110907.ifc

- Discipline: Mechanical, electrical and plumbing
- Authoring tool: 20100326_1700 Autodesk Revit MEP 2011 - 1.0
- Storeys: Level 1 (+0.00 m), Level 2 (+3.10 m), Roof (+6.00 m)

| IFC class | Count |
| --- | ---: |
| IfcFlowSegment | 427 |
| IfcFlowFitting | 358 |
| IfcFlowTerminal | 105 |
| IfcEnergyConversionDevice | 16 |
| IfcFlowController | 14 |
| IfcFlowMovingDevice | 4 |
| IfcDistributionControlElement | 2 |

### Duplex_M_20111024_ROOMS_AND_SPACES.ifc

- Discipline: Mechanical: rooms and spaces
- Authoring tool: 20100903_2115(x64) Autodesk Revit MEP 2011 - 1.0
- Storeys: Level 1 (+0.00 m), Level 2 (+3.10 m), Roof (+6.00 m)

| IFC class | Count |
| --- | ---: |
| IfcFlowSegment | 246 |
| IfcFlowFitting | 207 |
| IfcEnergyConversionDevice | 22 |
| IfcFlowController | 8 |
| IfcFlowMovingDevice | 4 |

### Duplex_Plumbing_20121113.ifc

- Discipline: Plumbing
- Authoring tool: 20121003_2115(x64) Autodesk Revit 2013
- Storeys: Level 1 (+0.00 m), Level 2 (+3100.00 m), Roof (+6000.00 m)

| IFC class | Count |
| --- | ---: |
| IfcDistributionPort | 970 |
| IfcFlowSegment | 231 |
| IfcFlowFitting | 227 |
| IfcFlowController | 20 |
| IfcFlowTerminal | 16 |
| IfcEnergyConversionDevice | 2 |
| IfcFlowMovingDevice | 2 |

## 4. COBie workbooks

### 2012-03-23-Duplex-Design.xlsx

COBie spreadsheet, design version, 198 KB.

| Facility field | Value |
| --- | --- |
| Facility | DuplexApartment |
| Category | 11-16 21 11: Duplex |
| Project | 1 |
| Site | Duplex Apartment |
| Units | meters, squaremeters, cubicmeters |
| Area measurement | See Autodesk Documentation |
| Authoring system | Autodesk Revit Architecture 2011 |
| Phase | Handover |

| Sheet | Rows | What it holds |
| --- | ---: | --- |
| Instruction | 44 | How the workbook is organised; colour key for required and optional columns |
| Contact | 4 | People and companies referenced elsewhere: designers, contractors, manufacturers |
| Facility | 1 | The project, site and building, with the units every other sheet uses |
| Floor | 4 | Storeys with elevation and height |
| Space | 22 | Rooms: number, name, floor, category, areas |
| Zone | 20 | Groupings of rooms: occupancy, fire alarm, lighting, ventilation and circulation zones |
| Type | 43 | Product types: manufacturer, model number, warranty, expected life, nominal sizes |
| Component | 232 | Every installed instance of a type, with the room it is in and its IFC GlobalId |
| System | 36 | Building systems (HVAC, plumbing, electrical, fire) and the components in each |
| Assembly | 0 | Assemblies of components or types |
| Spare | 0 | Spare parts per type and who supplies them |
| Resource | 0 | Materials, tools and training needed for maintenance |
| Job | 0 | Maintenance, inspection and safety tasks per type, with frequency and duration |
| Impact | 0 | Environmental and cost impacts |
| Document | 0 | Every handover document and the type, system or space it belongs to |
| Attribute | 88 | Extra properties on any row of any other sheet |
| Coordinate | 42 | Locations and bounding boxes of floors, spaces and components |
| Connection | 0 | Physical connections between components |
| Issue | 0 | Known issues and risks |
| PickLists | 3262 | Allowed values for category and status columns |

Floors: Level 1 (0), Level 2 (3.1), Roof (6), T/FDN (-1.25).

### 2012-03-23-Duplex-Handover.xlsx

COBie spreadsheet, handover (as built) version, 233 KB.

| Facility field | Value |
| --- | --- |
| Facility | DuplexApartment |
| Category | 11-16 21 11: Duplex |
| Project | 1 |
| Site | Duplex Apartment |
| Units | meters, squaremeters, cubicmeters |
| Area measurement | See Autodesk Documentation |
| Authoring system | Autodesk Revit Architecture 2011 |
| Phase | Handover |

| Sheet | Rows | What it holds |
| --- | ---: | --- |
| Instruction | 44 | How the workbook is organised; colour key for required and optional columns |
| Contact | 58 | People and companies referenced elsewhere: designers, contractors, manufacturers |
| Facility | 1 | The project, site and building, with the units every other sheet uses |
| Floor | 4 | Storeys with elevation and height |
| Space | 22 | Rooms: number, name, floor, category, areas |
| Zone | 20 | Groupings of rooms: occupancy, fire alarm, lighting, ventilation and circulation zones |
| Type | 43 | Product types: manufacturer, model number, warranty, expected life, nominal sizes |
| Component | 232 | Every installed instance of a type, with the room it is in and its IFC GlobalId |
| System | 36 | Building systems (HVAC, plumbing, electrical, fire) and the components in each |
| Assembly | 0 | Assemblies of components or types |
| Spare | 3 | Spare parts per type and who supplies them |
| Resource | 10 | Materials, tools and training needed for maintenance |
| Job | 94 | Maintenance, inspection and safety tasks per type, with frequency and duration |
| Impact | 0 | Environmental and cost impacts |
| Document | 48 | Every handover document and the type, system or space it belongs to |
| Attribute | 94 | Extra properties on any row of any other sheet |
| Coordinate | 42 | Locations and bounding boxes of floors, spaces and components |
| Connection | 0 | Physical connections between components |
| Issue | 0 | Known issues and risks |
| PickLists | 3262 | Allowed values for category and status columns |

Floors: Level 1 (0), Level 2 (3.1), Roof (6), T/FDN (-1.25).

### Cross-check: COBie handover against the architectural model

| Item | In COBie | In model |
| --- | --- | --- |
| Floors | 4 | 4 |
| Rooms | 22 | 21 |
| Doors (IfcDoor) | 14 matched by GlobalId | 14 |
| Windows (IfcWindow) | 24 matched by GlobalId | 24 |
| Components, all disciplines | 232 |  |

COBie Component rows carry the IFC GlobalId in `ExtIdentifier`, so every door and window in the schedules can be joined to its COBie type, warranty and documents.

## 5. Manufacturer and O&M documents

48 documents are listed in the COBie handover, attached to 43 product types and 0 systems or other items. 7 of the listed files are present in this folder. The full list, one row per document, is in `index/duplex-documents.csv`.

### Product types

| Item | Category | Manufacturer | Model | Warranty (parts) | Installed | Document kinds | Files here |
| --- | --- | --- | --- | --- | ---: | --- | ---: |
| Appliance - Microwave | Food Cooking Equipment | sales@samsung.com | SMH9187B | 1 year | 2 | Operation and Maintenance, Product Data | 0/2 |
| Appliance - Range | Ranges | sales@samsung.com | FTQ387LWGZ | 5 year | 2 | Operation and Maintenance, Product Data | 0/2 |
| Appliance - Refrigerator | Refrigerators | salesrep@whirlpool.com | ED5DHEXWQ | 1 year | 2 | Operation and Maintenance, Product Data | 0/3 |
| Bath/Shower | Bath/Shower Units | sales@kholer.com | K1121 | 1 year | 2 | Product Data | 2/2 |
| Boiler | Hot Water Heat Generators | service@vokera.co.uk | 28HE | 2 year | 2 | Product Data | 0/1 |
| Cabinet Type A | Kitchen Casework | info@merillatbusiness.com | SB 36 | 10 year | 16 | Product Data | 1/1 |
| Cabinet Type B | Kitchen Casework | info@merillatbusiness.com | Standard Merillat | 1 year | 8 | Product Data | 0/1 |
| Cabinet Type C | Bathroom Casework | sales@kholer.com | K-2413 | 10 year | 1 | Product Data | 0/1 |
| Cabinet Type D | Bathroom Casework | sales@kholer.com | K-2413 | 10 year | 4 | Product Data | 0/1 |
| Cabinet Type E | Kitchen Casework | info@merillatbusiness.com | SB 36 | 10 year | 8 | Product Data | 1/1 |
| Counter Top | Kitchen Casework | customercare@lowes.com | 472452114 | 1 year | 6 | Product Data | 0/1 |
| Door Type A | Doors | sales@jeldwen.com | Atherton 6'8" Smooth | 10 year | 4 | Product Data | 0/1 |
| Door Type B | Doors | info@marvinwindowsdoors.com | Clad Sliding Patio Door | 10 year | 2 | Product Data | 0/1 |
| Door Type C | Doors | sales@jeldwen.com | Design-Pro Flush | 10 year | 6 | Product Data | 0/1 |
| Door Type D | Doors | sales@anderson.com | Standard G01 | 10 year | 2 | Product Data | 0/1 |
| Duplex Receptacle Product Data |  |  |  |  |  | Product Data | 0/1 |
| Exhaust Fan | Centrifugal Fans | sales@twincity.com | PCLP | 1 year | 2 | Product Data | 0/1 |
| Fire Alarm | Alarm Panels | sales@sears.com | 6001020 | 1 year | 1 | Product Data | 0/1 |
| Furniture -  King Bed | Beds | sales@simmons.com | Beautyrest Classic | 10 year | 2 | Product Data | 0/1 |
| Furniture - Coffee Table | Coffee Tables | info@ef.com | LEGARE-OTEM-110 | 1 year | 2 | Product Data | 0/1 |
| Furniture - Queen Bed | Beds | sales@simmons.com | Beautyrest Classic | 10 year | 2 | Product Data | 0/1 |
| Furniture - Side Table | Coffee Tables | sales@ikea.com | Hemnes | 1 year | 8 | Product Data | 0/1 |
| Furniture - Sofa | Settees: Sofas | info@ef.com | HANDY-LPZ3-S1-AAA82 | 1 year | 4 | Product Data | 0/1 |
| Inline Pump | Pumps | sales@made-in-china.com | GDL4 | 5 year | 2 | Product Data | 1/1 |
| Intercom | Intercommunication Equipment | sales@aspire.com | 9545-4WS | 1 year | 4 | Product Data | 0/1 |
| Light Fixture Type A | Luminaries for Internal Lighting | info@thehomedepot.com | Y32012-42 | 2 year | 6 | Product Data | 0/1 |
| Light Fixture Type B | General Luminaries: Non Directional | info@corbettlighting.com | Arabesque 5601 | 5 year | 8 | Product Data | 0/1 |
| Panelboard | Distribution Boards and Control Panels | sales@schneiderelectric.com | NQ | 5 year | 2 | Product Data | 1/1 |
| Radiator | Radiators | sales@stelrad.com | Stelrad Planar 400x1200 K1 | 5 year | 14 | Product Data | 0/1 |
| Shower |  |  |  |  |  | Product Data | 0/1 |
| Sing Type C |  |  |  |  |  | Product Data | 0/1 |
| Single Pole Switch | Switches | salesrep@hubbell.com | DS120I | 0 year | 14 | Product Data | 0/1 |
| Sink Type A | Sinks/Lavatories | sales@kholer.com | K2952 | 15 year | 2 | Product Data | 0/1 |
| Sink Type B | Sinks/Lavatories | sales@kholer.com | K2209 | 15 year | 2 | Product Data | 0/1 |
| Skylight | Roof Windows | sales@wascoproducts.com | EV3046 | 25 year | 2 | Product Data | 0/1 |
| Smoke Detector | Smoke Detectors | sales@firex.com | 4480 | 5 year | 6 | Product Data | 0/1 |
| Telophone Outlet | Telephone and Intercommunication Equipment | info@sourcingmap.com | a11102000ux0062 |  | 1 | Product Data | 1/1 |
| Thermostat | Environmental Controls | sales@grainger.com | 6WU96 | 1 year | 2 | Product Data | 0/1 |
| Toilet | Water Operated Water Closets | contact@vb.com | 7687 10 XX | 20 year | 4 | Product Data | 0/1 |
| Window Type A | Fixed Windows | sales@anderson.com | CTN30-2 | 20 year | 4 | Product Data | 0/1 |
| Window Type B | Fixed Windows | sales@anderson.com | ET8 | 20 year | 2 | Product Data | 0/1 |
| Window Type C | Fixed Windows | sales@anderson.com | P3060 | 20 year | 4 | Product Data | 0/1 |
| Window Type D | Casement Windows | sales@anderson.com | Series A | 10 year | 12 | Product Data | 0/1 |

## 6. Overview images

| File | Shows | Size |
| --- | --- | ---: |
| `2020-11-11-DuplexArc.jpg` | Architectural | 127 KB |
| `2020-11-11-DuplexEle.jpg` | Electrical | 32 KB |
| `2020-11-11-DuplexMec.jpg` | Mechanical, electrical and plumbing | 74 KB |
| `2020-11-11-DuplexPlu.jpg` | Plumbing | 57 KB |

## Licenses

The buildingSMART sample files are published under CC BY 4.0. Manufacturer product data, O&M manuals and warranties are third-party literature: use them for internal checks, not in public demos. Generated drawings and schedules carry the model credit on every sheet. See `../README.md`.
