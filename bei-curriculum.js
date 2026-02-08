// BEI Curriculum Data - Official IOE Syllabus
const BEI_CURRICULUM = {
  1: [ // Semester 1 (Year I Part I)
    { code: 'ENSH 101', name: 'Engineering Mathematics I', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 0 },
    { code: 'ENSH 102', name: 'Engineering Physics', credits: 4, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENCT 101', name: 'Computer Programming', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 50 },
    { code: 'ENME 101', name: 'Engineering Drawing', credits: 2, assessmentMax: 20, finalMax: 30, practicalMax: 50 },
    { code: 'ENEX 101', name: 'Fundamental of Electrical and Electronics Engineering', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 50 },
    { code: 'ENME 106', name: 'Engineering Workshop', credits: 1, assessmentMax: 20, finalMax: 0, practicalMax: 30 }
  ],
  2: [ // Semester 2 (Year I Part II)
    { code: 'ENSH 151', name: 'Engineering Mathematics II', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 0 },
    { code: 'ENCT 151', name: 'Object Oriented Programming', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 50 },
    { code: 'ENEX 151', name: 'Electronic Device and Circuits', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 50 },
    { code: 'ENEX 152', name: 'Digital Logic', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 50 },
    { code: 'ENEE 154', name: 'Electrical Circuits and Machines', credits: 4, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENSH 153', name: 'Engineering Chemistry', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 }
  ],
  3: [ // Semester 3 (Year II Part I)
    { code: 'ENSH 201', name: 'Engineering Mathematics III', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 0 },
    { code: 'ENSH 204', name: 'Communication English', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENCT 201', name: 'Computer Graphics and Visualization', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 50 },
    { code: 'ENEX 201', name: 'Microprocessors', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 50 },
    { code: 'ENEX 202', name: 'Advanced Electronics', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEE 204', name: 'Control System', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 }
  ],
  4: [ // Semester 4 (Year II Part II)
    { code: 'ENSH 252', name: 'Numerical Methods', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 50 },
    { code: 'ENCT 251', name: 'Discrete Structure', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 0 },
    { code: 'ENEX 252', name: 'Instrumentation', credits: 4, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 253', name: 'Computer Organization & Architecture', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 254', name: 'Electromagnetics', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 255', name: 'Signals and Systems', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 }
  ],
  5: [ // Semester 5 (Year III Part I)
    { code: 'ENSH 304', name: 'Probability and Statistics', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 0 },
    { code: 'ENCT 305', name: 'Artificial Intelligence', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 301', name: 'Filter Design', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 302', name: 'Embedded Systems', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 303', name: 'Propagation and Antenna', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 3XX', name: 'Elective I', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 }
  ],
  6: [ // Semester 6 (Year III Part II)
    { code: 'ENCT 355', name: 'ICT Project Management', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 0 },
    { code: 'ENCE 356', name: 'Engineering Economics', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 0 },
    { code: 'ENEX 351', name: 'Communication Systems', credits: 4, assessmentMax: 40, finalMax: 60, practicalMax: 50 },
    { code: 'ENEX 352', name: 'Telecommunication and Computer Networks', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 50 },
    { code: 'ENEX 353', name: 'Minor Project', credits: 1, assessmentMax: 0, finalMax: 0, practicalMax: 50 },
    { code: 'ENEX 3XX', name: 'Elective II', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 }
  ],
  7: [ // Semester 7 (Year IV Part I)
    { code: 'ENEX 411', name: 'RF and Microwave Engineering', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 412', name: 'Robotics', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 413', name: 'Digital Signal Processing', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 4XX', name: 'Elective III', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 414', name: 'Project I', credits: 2, assessmentMax: 0, finalMax: 0, practicalMax: 50 },
    { code: 'ENEX 415', name: 'Wireless Communication', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 }
  ],
  8: [ // Semester 8 (Year IV Part II)
    { code: 'ENEX 463', name: 'Energy, Environment and Social Engineering', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 0 },
    { code: 'ENEX 462', name: 'Internship (8 weeks)', credits: 4, assessmentMax: 0, finalMax: 0, practicalMax: 100 },
    { code: 'ENEX 4XX', name: 'Elective IV', credits: 3, assessmentMax: 40, finalMax: 60, practicalMax: 25 },
    { code: 'ENEX 461', name: 'Project II', credits: 4, assessmentMax: 0, finalMax: 0, practicalMax: 100 }
  ]
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BEI_CURRICULUM };
}
