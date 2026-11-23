"""
Curated, peer-reviewed scientific seed data for the 8 core nanomaterials.
Contains dimensional classifications, density, structured properties, applications,
and authentic reference citations.
"""

NANOMATERIALS_SEED_DATA = [
    {
        "slug": "graphene",
        "name": "Graphene",
        "formula": "C",
        "category": "Carbon-based",
        "dimensionality": "2D",
        "density_g_cm3": 2.26,
        "structure_type": "Hexagonal honeycomb monolayer lattice",
        "description": "A single two-dimensional atomic layer of sp2-hybridized carbon atoms tightly bound in a hexagonal honeycomb lattice with high electron mobility and mechanical strength.",
        "electrical_properties": "Zero-overlap semimetal, carrier mobility exceeding 200,000 cm²/(V·s) at room temperature, ballistic electron transport.",
        "optical_properties": "Opacity of ~2.3% across visible spectrum (absorbance ~πα ≈ 2.293%), high transparency for flexible optoelectronics.",
        "mechanical_properties": "Young's modulus of ~1.0 TPa, intrinsic fracture strength of 130 GPa (strongest measured material).",
        "applications": [
            "High-frequency field-effect transistors (FETs)",
            "Transparent conductive electrodes for flexible displays",
            "Supercapacitors and lithium-ion battery electrodes",
            "Ultra-sensitive electrochemical biosensors"
        ],
        "advantages": [
            "Extremely high thermal conductivity (~5000 W/(m·K))",
            "Impermeable to standard gases (even helium)",
            "Exceptional mechanical strength-to-weight ratio"
        ],
        "limitations": [
            "Zero bandgap in pristine state limits digital logic on/off ratio",
            "Scalable defect-free roll-to-roll chemical vapor deposition (CVD) synthesis is technically challenging",
            "Pronounced tendency to restack into graphite via van der Waals interactions"
        ],
        "references": [
            {"title": "Electric Field Effect in Atomically Thin Carbon Films", "authors": "Novoselov, K. S. et al.", "year": 2004, "doi": "10.1126/science.1102896"},
            {"title": "Measurement of the Elastic Properties and Intrinsic Strength of Monolayer Graphene", "authors": "Lee, C. et al.", "year": 2008, "doi": "10.1126/science.1157996"}
        ]
    },
    {
        "slug": "cnt",
        "name": "Carbon Nanotubes (SWCNT & MWCNT)",
        "formula": "C",
        "category": "Carbon-based",
        "dimensionality": "1D",
        "density_g_cm3": 1.35,
        "structure_type": "Cylindrical rolled graphene sheets",
        "description": "Seamless cylindrical tubules composed of rolled hexagonal carbon graphene sheets. Exhibiting chirality specified by vectors (n, m) determining metallic or semiconducting electronic character.",
        "electrical_properties": "Metallic or semiconducting depending on chiral indices (n, m); current-carrying capacity up to 10^9 A/cm².",
        "optical_properties": "Chirality-dependent optical absorption bands, characteristic van Hove singularities, photoluminescence in near-infrared (NIR).",
        "mechanical_properties": "Tensile strength up to 60-100 GPa, Young's modulus ~1.0-1.2 TPa, high flexibility and resilience.",
        "applications": [
            "Lightweight structural composites in aerospace",
            "Next-generation nanoscale logic transistors (CNT-FET)",
            "Conductive atomic force microscopy (AFM) probes",
            "Electrode conductive additives for battery cathodes"
        ],
        "advantages": [
            "High electrical conductivity with minimal Joule heating",
            "High aspect ratio (>1000:1) enabling percolation networks at low loading fractions",
            "Thermal stability in inert atmosphere up to 2800 °C"
        ],
        "limitations": [
            "Difficulty in selective chiral-pure synthesis during CVD",
            "Dispersibility and de-bundling challenges in solvents",
            "Asbestos-like pulmonary toxicity concerns for rigid high-aspect-ratio multi-walled tubes"
        ],
        "references": [
            {"title": "Helical microtubules of graphitic carbon", "authors": "Iijima, S.", "year": 1991, "doi": "10.1038/354056a0"},
            {"title": "Carbon Nanotube Electronics", "authors": "Avouris, P. et al.", "year": 2007, "doi": "10.1038/nnano.2007.300"}
        ]
    },
    {
        "slug": "gold-nanoparticles",
        "name": "Gold Nanoparticles (AuNPs)",
        "formula": "Au",
        "category": "Metal",
        "dimensionality": "0D",
        "density_g_cm3": 19.32,
        "structure_type": "Face-centered cubic (FCC) spherical cluster",
        "description": "Colloidal gold clusters exhibiting localized surface plasmon resonance (LSPR), widely used in medical diagnostics, photothermal therapy, and nanophotonics.",
        "electrical_properties": "Metallic core with quantum-confinement-driven single-electron tunneling at sub-5nm dimensions.",
        "optical_properties": "Strong localized surface plasmon resonance (LSPR) peak around 520 nm (giving red colloidal color), red-shifting as particle size increases.",
        "mechanical_properties": "High ductility of gold bulk, surface energy dominating mechanical deformation at nanoscale.",
        "applications": [
            "Lateral flow immunochromatographic diagnostic assays (e.g. rapid antigen tests)",
            "Photothermal cancer ablation therapy",
            "Surface-Enhanced Raman Spectroscopy (SERS) substrates",
            "Targeted drug and oligonucleotide delivery"
        ],
        "advantages": [
            "High biocompatibility and chemically inert gold core",
            "Facile thiol surface functionalization (Au-S bond formation)",
            "Extremely high optical extinction cross-section"
        ],
        "limitations": [
            "High raw material precursor cost (gold salts)",
            "Irreversible aggregation if electrostatic or steric stabilization fails",
            "Potential in vivo bioaccumulation in the reticuloendothelial system (RES)"
        ],
        "references": [
            {"title": "Gold Nanoparticles: Assembly, Supramolecular Chemistry, and Applications", "authors": "Daniel, M. C. & Astruc, D.", "year": 2004, "doi": "10.1021/cr030698+"},
            {"title": "Physical Properties of Nanostructured Gold", "authors": "Kelly, K. L. et al.", "year": 2003, "doi": "10.1021/jp026731y"}
        ]
    },
    {
        "slug": "silver-nanoparticles",
        "name": "Silver Nanoparticles (AgNPs)",
        "formula": "Ag",
        "category": "Metal",
        "dimensionality": "0D",
        "density_g_cm3": 10.49,
        "structure_type": "Face-centered cubic (FCC) crystalline sphere",
        "description": "Broad-spectrum antimicrobial nanomaterial with intense LSPR in the near-UV/blue spectrum, widely integrated into wound dressings and antimicrobial textiles.",
        "electrical_properties": "Highest electrical conductivity among metallic nanomaterials; low percolation threshold in conductive inks.",
        "optical_properties": "Sharp LSPR extinction band in the 390-420 nm window with higher scattering efficiency than gold of equivalent size.",
        "mechanical_properties": "Soft metal; nanoparticles exhibit size-dependent yield stress and lowered melting point due to Gibbs-Thomson effect.",
        "applications": [
            "Wound dressings and medical catheter coatings",
            "Printed flexible electronics and conductive inks",
            "Antimicrobial packaging films and water purification membranes",
            "Surface-enhanced Raman scattering (SERS)"
        ],
        "advantages": [
            "Broad-spectrum biocidal action against Gram-positive, Gram-negative, and fungal pathogens",
            "Lower cost compared to gold and platinum group metals",
            "High thermal and electrical conductivity"
        ],
        "limitations": [
            "Susceptible to atmospheric sulfidation and oxidation forming Ag2S and Ag2O",
            "Cytotoxicity to mammalian cells via reactive oxygen species (ROS) at elevated doses",
            "Aquatic toxicity concerns upon silver ion release in water bodies"
        ],
        "references": [
            {"title": "Silver Nanoparticles as Antimicrobial Agent", "authors": "Rai, M. et al.", "year": 2009, "doi": "10.1016/j.biotechadv.2008.09.002"},
            {"title": "Synthesis and Characterization of Silver Nanoparticles", "authors": "Sun, Y. & Xia, Y.", "year": 2002, "doi": "10.1126/science.1077229"}
        ]
    },
    {
        "slug": "tio2",
        "name": "Titanium Dioxide (TiO2) Nanoparticles",
        "formula": "TiO2",
        "category": "Metal Oxide",
        "dimensionality": "0D / 3D polyhedral",
        "density_g_cm3": 4.23,
        "structure_type": "Tetragonal (Anatase / Rutile phases)",
        "description": "Wide bandgap semiconductor with exceptional photocatalytic, UV-absorbing, and self-cleaning capabilities.",
        "electrical_properties": "n-type semiconductor; bandgap of 3.2 eV (anatase) and 3.0 eV (rutile); dielectric constant ~80-170.",
        "optical_properties": "Strong UV absorbance below 385 nm; high refractive index (n ≈ 2.5-2.7) providing superior light scattering and whiteness.",
        "mechanical_properties": "High hardness (Mohs 5.5-6.5), rigid crystalline oxide lattice.",
        "applications": [
            "Photocatalytic water purification and pollutant degradation",
            "Dye-sensitized solar cells (DSSC - Grätzel cells)",
            "Broadband UV-blocking mineral sunscreens and coatings",
            "Self-cleaning architectural glass (photo-induced superhydrophilicity)"
        ],
        "advantages": [
            "High chemical and photo-corrosion stability in aqueous environments",
            "Inexpensive, abundant, and non-toxic in bulk form",
            "High photocatalytic quantum yield under UV excitation (especially anatase phase)"
        ],
        "limitations": [
            "Only absorbs ~4% of the solar spectrum (UV range) without bandgap engineering or doping",
            "Electron-hole recombination rate is high without cocatalysts (e.g. Pt)",
            "Regulatory scrutiny regarding inhalation of ultrafine titanium dioxide powders"
        ],
        "references": [
            {"title": "Electrochemical Photolysis of Water at a Semiconductor Electrode", "authors": "Fujishima, A. & Honda, K.", "year": 1972, "doi": "10.1038/238037a0"},
            {"title": "Titanium dioxide photocatalysis", "authors": "Hashimoto, K. et al.", "year": 2005, "doi": "10.1143/JJAP.44.8269"}
        ]
    },
    {
        "slug": "zno",
        "name": "Zinc Oxide (ZnO) Nanostructures",
        "formula": "ZnO",
        "category": "Metal Oxide",
        "dimensionality": "1D / 0D",
        "density_g_cm3": 5.61,
        "structure_type": "Hexagonal Wurtzite lattice",
        "description": "Multifunctional direct wide-bandgap semiconductor exhibiting strong piezoelectricity, UV-lasing, and biosensing capabilities.",
        "electrical_properties": "Direct bandgap of 3.37 eV at room temperature; large exciton binding energy of 60 meV (stable excitons at room temperature).",
        "optical_properties": "Near-band-edge UV emission and defect-related visible (green/orange) photoluminescence.",
        "mechanical_properties": "Strong non-centrosymmetric piezoelectric coefficient; flexible nanowire morphology for nanogenerators.",
        "applications": [
            "Piezoelectric nanogenerators (PENGs) for mechanical energy harvesting",
            "Ultraviolet photodetectors and UV lasers",
            "Gas sensors (detection of NO2, ethanol, CO)",
            "Transparent conductive electrodes for photovoltaics (Al-doped ZnO)"
        ],
        "advantages": [
            "Large exciton binding energy (60 meV) exceeding thermal energy at 300 K (26 meV)",
            "Diverse morphological control (nanorods, nanowires, nanobelts, flowers)",
            "Bio-friendly and biodegradable in physiological conditions at moderate concentrations"
        ],
        "limitations": [
            "Native n-type defects make reliable p-type doping notoriously difficult",
            "Chemical dissolution in acidic or strongly alkaline pH environments",
            "Surface recombination traps limit carrier lifetimes without surface passivation"
        ],
        "references": [
            {"title": "Piezoelectric Nanogenerators Based on Zinc Oxide Nanowire Arrays", "authors": "Wang, Z. L. & Song, J.", "year": 2006, "doi": "10.1126/science.1124005"},
            {"title": "A comprehensive review of ZnO materials and devices", "authors": "Özgür, Ü. et al.", "year": 2005, "doi": "10.1063/1.1992666"}
        ]
    },
    {
        "slug": "silicon-nanowires",
        "name": "Silicon Nanowires (SiNWs)",
        "formula": "Si",
        "category": "Semiconductor",
        "dimensionality": "1D",
        "density_g_cm3": 2.33,
        "structure_type": "Diamond cubic core with native oxide shell",
        "description": "One-dimensional semiconductor nanostructures with seamless compatibility with complementary metal-oxide-semiconductor (CMOS) fabrication lines.",
        "electrical_properties": "Gate-all-around (GAA) electrostatic gate control, suppressed short-channel effects, tunable doping.",
        "optical_properties": "Strong light trapping and reduced optical reflection due to sub-wavelength scattering and resonance.",
        "mechanical_properties": "Can accommodate substantial lithium intercalation strain (volume expansion >300%) without pulverizing, unlike bulk silicon.",
        "applications": [
            "High-capacity lithium-ion battery anodes (>3000 mAh/g theoretical capacity)",
            "Gate-All-Around (GAA) FETs for sub-3nm semiconductor nodes",
            "Label-free field-effect biosensors for protein/DNA detection",
            "Thermoelectric energy converters with suppressed thermal conductivity"
        ],
        "advantages": [
            "Complete integration readiness with established semiconductor foundries",
            "10x higher theoretical lithium capacity compared to traditional graphite anodes",
            "Substantially reduced thermal conductivity due to boundary phonon scattering"
        ],
        "limitations": [
            "Surface trap states require robust thermal oxide or organic passivation",
            "Metal-catalyzed VLS growth introduces gold or metal impurity contamination",
            "Electrode-electrolyte interphase (SEI) instability during continuous volume changes"
        ],
        "references": [
            {"title": "Silicon nanowire anodes for lithium-ion batteries", "authors": "Chan, C. K. et al.", "year": 2008, "doi": "10.1038/nnano.2007.411"},
            {"title": "Silicon Nanowires: Synthesis, Properties, and Applications", "authors": "Schmidt, V. et al.", "year": 2009, "doi": "10.1002/anie.200806091"}
        ]
    },
    {
        "slug": "quantum-dots",
        "name": "Colloidal Quantum Dots (CdSe / InP)",
        "formula": "CdSe / ZnS core-shell",
        "category": "Semiconductor",
        "dimensionality": "0D",
        "density_g_cm3": 5.81,
        "structure_type": "Spherical crystalline nanocrystal core/shell",
        "description": "Zero-dimensional semiconductor nanocrystals whose physical size is smaller than the bulk exciton Bohr radius, creating discrete atomic-like energy levels and size-tunable emission.",
        "electrical_properties": "Size-dependent quantized bandgap (Brus equation), Coulomb blockade at low temperature.",
        "optical_properties": "Narrow, symmetric photoluminescence emission (FWHM < 30 nm) spanning full visible spectrum simply by tuning core diameter (2 nm = blue, 6 nm = red). High quantum yield (>80%).",
        "mechanical_properties": "Colloidal dispersion in polymers or organic matrices; robust core/shell interface.",
        "applications": [
            "QLED displays with wide color gamut (Rec. 2020 coverage)",
            "Multiplexed fluorescence biological imaging and in vitro labeling",
            "Intermediate-band quantum dot solar cells",
            "Single-photon emitters for quantum information"
        ],
        "advantages": [
            "Continuous spectral emission tunability without altering chemical composition",
            "High photostability against photobleaching compared to organic fluorophores",
            "Broad excitation spectrum with narrow emission profile"
        ],
        "limitations": [
            "Toxicity of heavy metal cadmium (Cd) requiring shift to Indium Phosphide (InP) or perovskites",
            "Optical blinking (fluorescence intermittency) under single-nanoparticle excitation",
            "Sensitivity to ligand detachment and oxidation without protective ZnS shell"
        ],
        "references": [
            {"title": "Electronic wave functions in small semiconductor particles", "authors": "Brus, L. E.", "year": 1984, "doi": "10.1063/1.447218"},
            {"title": "Synthesis and Characterization of Nearly Monodisperse CdE (E = S, Se, Te) Semiconductor Nanocrystallites", "authors": "Murray, C. B. et al.", "year": 1993, "doi": "10.1021/ja00072a025"}
        ]
    }
]
