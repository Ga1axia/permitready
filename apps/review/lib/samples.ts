export type SampleId = 'office' | 'duplex' | 'clinic'

export interface Sample {
  id: SampleId
  label: string
  category: 'Commercial' | 'Residential' | 'Public facility'
  description: string
  /** Served from `public/models/` and committed so deploys ship ready to open. */
  file: string
  /** Upstream download used by `bun run samples` to refresh the local copy. */
  sourceUrl: string
  /** Page that describes the model and its license. */
  infoUrl: string
  license: string
  credit: string
}

export const samples: Sample[] = [
  {
    id: 'office',
    label: 'Office building',
    category: 'Commercial',
    description: 'Fictional multi-storey office, ArchiCAD 20 export (IFC4)',
    file: '/models/kit-office.ifc',
    sourceUrl: 'http://www.ifcwiki.org/images/9/98/AC20-Institute-Var-2.ifc',
    infoUrl: 'https://www.ifcwiki.org/index.php?title=KIT_IFC_Examples',
    license: 'Unrestricted use',
    credit:
      'Institute for Automation and Applied Informatics (IAI) / Karlsruhe Institute of Technology (KIT)',
  },
  {
    id: 'duplex',
    label: 'Duplex apartment',
    category: 'Residential',
    description: 'Two-storey duplex, the standard BIM test model (IFC2x3)',
    file: '/models/duplex.ifc',
    sourceUrl:
      'https://media.githubusercontent.com/media/buildingsmart-community/Community-Sample-Test-Files/main/IFC%202.3.0.1%20(IFC%202x3)/Duplex%20Apartment/Duplex_A_20110907.ifc',
    infoUrl:
      'https://github.com/buildingsmart-community/Community-Sample-Test-Files/tree/main/IFC%202.3.0.1%20(IFC%202x3)/Duplex%20Apartment',
    license: 'CC BY 4.0',
    credit: 'BSI (2020) "Duplex Apartment Test Files," buildingSMART International',
  },
  {
    id: 'clinic',
    label: 'Medical-dental clinic',
    category: 'Public facility',
    description: 'Real two-storey clinic, details redacted (IFC2x3)',
    file: '/models/clinic.ifc',
    sourceUrl:
      'https://media.githubusercontent.com/media/buildingsmart-community/Community-Sample-Test-Files/main/IFC%202.3.0.1%20(IFC%202x3)/Medical-Dental%20Clinic/Clinic_Architectural.ifc',
    infoUrl:
      'https://github.com/buildingsmart-community/Community-Sample-Test-Files/tree/main/IFC%202.3.0.1%20(IFC%202x3)/Medical-Dental%20Clinic',
    license: 'CC BY 4.0',
    credit: 'BSI (2020) "Medical-Dental Test Files," buildingSMART International',
  },
]

export const defaultSampleId: SampleId = 'duplex'

export function findSample(id: string | null | undefined): Sample | undefined {
  return samples.find((s) => s.id === id)
}
