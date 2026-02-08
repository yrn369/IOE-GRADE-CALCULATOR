document.addEventListener('DOMContentLoaded', () => {
  // State
  let subjects = [];
  let currentProgram = '';
  let currentSemester = '';

  // DOM Elements
  const programSelect = document.getElementById('programSelect');
  const semesterCard = document.getElementById('semesterCard');
  const semesterSelect = document.getElementById('semesterSelect');
  const subjectsSection = document.getElementById('subjectsSection');
  const addTheoryPairBtn = document.getElementById('addTheoryPairBtn');
  const addSingleBtn = document.getElementById('addSingleBtn');
  const subjectsTableBody = document.getElementById('subjectsTableBody');
  const emptyState = document.getElementById('emptyState');
  const resultsSection = document.getElementById('resultsSection');
  const totalCreditsEl = document.getElementById('totalCredits');
  const sgpaEl = document.getElementById('sgpa');
  const sgpaGradeEl = document.getElementById('sgpaGrade');
  const percentageEl = document.getElementById('percentage');
  const distributionBarsEl = document.getElementById('distributionBars');
  
  // Modal Elements
  const modal = document.getElementById('subjectModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const subjectForm = document.getElementById('subjectForm');
  const subjectNameInput = document.getElementById('subjectName');
  const subjectTypeSelect = document.getElementById('subjectType');
  const creditHoursInput = document.getElementById('creditHours');
  const theoryFields = document.getElementById('theoryFields');
  const practicalFields = document.getElementById('practicalFields');
  const assessmentInput = document.getElementById('assessment');
  const finalInput = document.getElementById('final');
  const practicalMaxSelect = document.getElementById('practicalMax');
  const practicalMarksInput = document.getElementById('practicalMarks');
  const theoryPreview = document.getElementById('theoryPreview');
  const practicalPreview = document.getElementById('practicalPreview');
  const practicalHint = document.getElementById('practicalHint');
  const cancelBtn = document.getElementById('cancelBtn');

  let isPairMode = false;
  let pairSubject = null;

  // IOE Grading System (Verified from marksheets)
  const getGrade = (percentage) => {
    const p = parseFloat(percentage) || 0;
    if (p >= 90) return { letter: 'A', point: 4.0 };
    if (p >= 80) return { letter: 'A-', point: 3.7 };
    if (p >= 70) return { letter: 'B+', point: 3.3 };
    if (p >= 60) return { letter: 'B', point: 3.0 };
    if (p >= 50) return { letter: 'B-', point: 2.7 };
    if (p >= 40) return { letter: 'C+', point: 2.4 };
    if (p >= 35) return { letter: 'C', point: 2.0 };
    return { letter: 'F', point: 0.0 };
  };

  // Safe number parsing
  const safeFloat = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
  };

  const safeInt = (value, defaultValue = 0) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
  };

  // Program Selection
  programSelect.addEventListener('change', (e) => {
    currentProgram = e.target.value;
    
    if (currentProgram) {
      semesterCard.style.display = 'block';
      
      const maxSemesters = e.target.selectedOptions[0]?.dataset.semesters || 8;
      semesterSelect.innerHTML = '<option value="">Choose Semester</option>';
      
      for (let i = 1; i <= maxSemesters; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Semester ${i}`;
        semesterSelect.appendChild(option);
      }
      
      currentSemester = '';
      subjectsSection.style.display = 'none';
      resultsSection.style.display = 'none';
      subjects = [];
      renderTable();
    } else {
      semesterCard.style.display = 'none';
      subjectsSection.style.display = 'none';
      resultsSection.style.display = 'none';
    }
  });

  // Semester Selection
  semesterSelect.addEventListener('change', (e) => {
    currentSemester = e.target.value;
    
    if (currentSemester) {
      subjectsSection.style.display = 'block';
      
      // Check if program has curriculum data
      const hasCurriculum = (currentProgram === 'BEI' && typeof BEI_CURRICULUM !== 'undefined') ||
                           (currentProgram === 'BCT' && typeof BCT_CURRICULUM !== 'undefined');
      
      if (hasCurriculum) {
        loadProgramCurriculum(currentSemester);
      } else {
        loadSubjects();
      }
      
      if (subjects.length > 0) {
        renderTable();
        calculateResults();
        resultsSection.style.display = 'block';
      }
    } else {
      subjectsSection.style.display = 'none';
      resultsSection.style.display = 'none';
    }
  });

  // Load Program Curriculum (BEI or BCT)
  function loadProgramCurriculum(semester) {
    const semesterNum = parseInt(semester, 10);
    let curriculumData = null;
    
    if (currentProgram === 'BEI' && typeof BEI_CURRICULUM !== 'undefined') {
      curriculumData = BEI_CURRICULUM[semesterNum];
    } else if (currentProgram === 'BCT' && typeof BCT_CURRICULUM !== 'undefined') {
      curriculumData = BCT_CURRICULUM[semesterNum];
    }
    
    if (!curriculumData) {
      subjects = [];
      return;
    }

    // Check if already have saved marks for this semester
    const saved = getSavedMarks();
    
    // Create subjects from curriculum
    subjects = curriculumData.map((subject, index) => {
      const savedSubject = saved.find(s => s.code === subject.code);
      
      return {
        id: Date.now() + index,
        code: subject.code,
        name: subject.name,
        credit: subject.credits,
        assessmentMax: subject.assessmentMax,
        finalMax: subject.finalMax,
        practicalMax: subject.practicalMax,
        // Use saved marks if available, otherwise 0
        assessment: savedSubject?.assessment || 0,
        final: savedSubject?.final || 0,
        practicalMarks: savedSubject?.practicalMarks || 0,
        // Will be calculated
        total: 0,
        maxMarks: 0,
        percentage: 0,
        grade: '-',
        point: 0
      };
    });

    // Calculate grades for all subjects
    subjects.forEach(sub => {
      calculateSubjectGrade(sub);
    });

    renderTable();
    calculateResults();
    resultsSection.style.display = 'block';
  }

  // Calculate individual subject grade
  function calculateSubjectGrade(subject) {
    const assessment = safeFloat(subject.assessment);
    const final = safeFloat(subject.final);
    const practical = safeFloat(subject.practicalMarks);
    
    let total, maxMarks, percentage;

    // Determine subject type based on max marks
    if (subject.finalMax > 0) {
      // Theory subject (has final exam)
      total = assessment + final + practical;
      maxMarks = subject.assessmentMax + subject.finalMax + subject.practicalMax;
    } else {
      // Practical/Project only
      total = practical;
      maxMarks = subject.practicalMax;
    }

    percentage = maxMarks > 0 ? (total / maxMarks) * 100 : 0;
    const grade = getGrade(percentage);

    subject.total = total;
    subject.maxMarks = maxMarks;
    subject.percentage = percentage;
    subject.grade = grade.letter;
    subject.point = grade.point;
  }

  // Quick Add Theory + PR Pair
  addTheoryPairBtn.addEventListener('click', () => {
    isPairMode = true;
    pairSubject = null;
    openModal('Add Theory Subject');
    subjectTypeSelect.value = 'theory';
    subjectTypeSelect.disabled = true;
    toggleFieldsByType('theory');
  });

  // Add Single Subject
  addSingleBtn.addEventListener('click', () => {
    isPairMode = false;
    pairSubject = null;
    openModal('Add Subject');
    subjectTypeSelect.disabled = false;
  });

  // Subject Type Change
  subjectTypeSelect.addEventListener('change', (e) => {
    toggleFieldsByType(e.target.value);
  });

  // Toggle Fields Based on Type
  function toggleFieldsByType(type) {
    if (type === 'theory') {
      theoryFields.style.display = 'block';
      practicalFields.style.display = 'none';
      assessmentInput.required = true;
      finalInput.required = true;
      practicalMaxSelect.required = false;
      practicalMarksInput.required = false;
    } else {
      theoryFields.style.display = 'none';
      practicalFields.style.display = 'block';
      assessmentInput.required = false;
      finalInput.required = false;
      practicalMaxSelect.required = true;
      practicalMarksInput.required = true;
    }
  }

  // Practical Max Change
  practicalMaxSelect.addEventListener('change', (e) => {
    const max = safeInt(e.target.value);
    if (max > 0) {
      practicalMarksInput.max = max;
      practicalHint.textContent = `0-${max}`;
    } else {
      practicalHint.textContent = 'Select max first';
    }
    updatePracticalPreview();
  });

  // Real-time Preview Updates
  assessmentInput.addEventListener('input', updateTheoryPreview);
  finalInput.addEventListener('input', updateTheoryPreview);
  practicalMarksInput.addEventListener('input', updatePracticalPreview);

  function updateTheoryPreview() {
    const assessment = safeFloat(assessmentInput.value);
    const final = safeFloat(finalInput.value);
    const total = assessment + final;
    const percentage = total;
    const grade = getGrade(percentage);

    theoryPreview.innerHTML = `
      <div class="preview-label">Preview</div>
      <div class="preview-grade">
        <span class="preview-marks">${total}/100 (${percentage.toFixed(1)}%)</span>
        <span class="grade-badge grade-${grade.letter.replace('+', '')}">${grade.letter}</span>
      </div>
    `;
  }

  function updatePracticalPreview() {
    const max = safeInt(practicalMaxSelect.value);
    const marks = safeFloat(practicalMarksInput.value);
    
    if (max > 0) {
      const percentage = (marks / max) * 100;
      const grade = getGrade(percentage);

      practicalPreview.innerHTML = `
        <div class="preview-label">Preview</div>
        <div class="preview-grade">
          <span class="preview-marks">${marks}/${max} (${percentage.toFixed(1)}%)</span>
          <span class="grade-badge grade-${grade.letter.replace('+', '')}">${grade.letter}</span>
        </div>
      `;
    } else {
      practicalPreview.innerHTML = '';
    }
  }

  // Form Submit
  subjectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = subjectNameInput.value.trim();
    const type = subjectTypeSelect.value;
    const credit = safeFloat(creditHoursInput.value);

    if (!name || credit <= 0) {
      alert('Please fill all required fields correctly.');
      return;
    }

    let subject;

    if (type === 'theory') {
      const assessment = safeFloat(assessmentInput.value);
      const final = safeFloat(finalInput.value);

      // Validation
      if (assessment < 0 || assessment > 40) {
        alert('Assessment marks must be between 0 and 40.');
        return;
      }
      if (final < 0 || final > 60) {
        alert('Final marks must be between 0 and 60.');
        return;
      }

      const total = assessment + final;
      const percentage = total; // Out of 100
      const grade = getGrade(percentage);

      subject = {
        id: Date.now(),
        name,
        type,
        credit,
        assessment,
        final,
        total,
        maxMarks: 100,
        percentage,
        grade: grade.letter,
        point: grade.point
      };
    } else {
      const max = safeInt(practicalMaxSelect.value);
      const marks = safeFloat(practicalMarksInput.value);

      // Validation
      if (max <= 0) {
        alert('Please select practical max marks.');
        return;
      }
      if (marks < 0 || marks > max) {
        alert(`Practical marks must be between 0 and ${max}.`);
        return;
      }

      const percentage = (marks / max) * 100;
      const grade = getGrade(percentage);

      subject = {
        id: Date.now(),
        name,
        type,
        credit,
        practicalMax: max,
        practicalMarks: marks,
        total: marks,
        maxMarks: max,
        percentage,
        grade: grade.letter,
        point: grade.point
      };
    }

    subjects.push(subject);

    // If in pair mode and just added theory, prompt for PR
    if (isPairMode && type === 'theory' && !pairSubject) {
      pairSubject = subject;
      subjectForm.reset();
      subjectTypeSelect.value = 'practical';
      subjectTypeSelect.disabled = true;
      toggleFieldsByType('practical');
      subjectNameInput.value = name + ' PR';
      creditHoursInput.value = '1'; // Default PR credit
      modalTitle.textContent = 'Add Practical (PR)';
      return;
    }

    // Done adding
    saveSubjects();
    renderTable();
    calculateResults();
    resultsSection.style.display = 'block';
    closeModal();
  });

  // Modal Controls
  function openModal(title = 'Add Subject') {
    modalTitle.textContent = title;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    subjectNameInput.focus();
  }

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    subjectForm.reset();
    theoryPreview.innerHTML = '';
    practicalPreview.innerHTML = '';
    isPairMode = false;
    pairSubject = null;
    subjectTypeSelect.disabled = false;
    toggleFieldsByType('theory');
  }

  modalClose.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  // Delete Subject
  window.deleteSubject = (id) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      subjects = subjects.filter(s => s.id !== id);
      saveSubjects();
      renderTable();
      calculateResults();

      if (subjects.length === 0) {
        resultsSection.style.display = 'none';
      }
    }
  };

  // Render Table
  function renderTable() {
    subjectsTableBody.innerHTML = '';

    if (subjects.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    const hasCurriculum = currentProgram === 'BEI' || currentProgram === 'BCT';

    subjects.forEach((sub, idx) => {
      const row = document.createElement('tr');
      
      // For programs with curriculum, show editable inputs for marks
      let assessmentDisplay, finalDisplay;
      
      if (hasCurriculum) {
        // Show max marks and make editable
        if (sub.finalMax > 0) {
          // Theory subject - has assessment and final
          assessmentDisplay = `<input type="number" class="subject-input marks-input" 
            data-index="${idx}" data-field="assessment" 
            min="0" max="${sub.assessmentMax}" 
            value="${sub.assessment || 0}" 
            placeholder="0" />`;
          
          finalDisplay = `<input type="number" class="subject-input marks-input" 
            data-index="${idx}" data-field="final" 
            min="0" max="${sub.finalMax}" 
            value="${sub.final || 0}" 
            placeholder="0" />`;
        } else {
          // Project/Workshop - practical only
          assessmentDisplay = `<input type="number" class="subject-input marks-input" 
            data-index="${idx}" data-field="practicalMarks" 
            min="0" max="${sub.practicalMax}" 
            value="${sub.practicalMarks || 0}" 
            placeholder="0" />`;
          
          finalDisplay = '-';
        }
      } else {
        // For other programs, show static values
        assessmentDisplay = sub.assessment || 0;
        finalDisplay = sub.final || '-';
      }

      row.innerHTML = `
        <td><strong>${sub.name}</strong><br><small style="color: var(--text-tertiary)">${sub.code || ''}</small></td>
        <td>
          ${sub.finalMax > 0 ? 
            '<span class="subject-type-badge badge-theory">Theory</span>' : 
            '<span class="subject-type-badge badge-practical">PR</span>'}
          ${hasCurriculum && sub.practicalMax > 0 && sub.finalMax > 0 ? 
            '<span class="subject-type-badge badge-practical" style="margin-left: 4px;">+PR</span>' : ''}
        </td>
        <td class="credit-col">${sub.credit}</td>
        <td class="marks-col">${assessmentDisplay}<br><small style="color: var(--text-tertiary)">Max ${sub.finalMax > 0 ? sub.assessmentMax : sub.practicalMax}</small></td>
        <td class="marks-col">${finalDisplay}${sub.finalMax > 0 ? '<br><small style="color: var(--text-tertiary)">Max ' + sub.finalMax + '</small>' : ''}</td>
        <td class="grade-col">
          <span class="grade-badge grade-${sub.grade.replace('+', '')}">${sub.grade}</span>
        </td>
        <td class="action-col">
          ${!hasCurriculum ? `<button class="btn-delete" onclick="deleteSubject(${sub.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>` : ''}
        </td>
      `;

      subjectsTableBody.appendChild(row);
    });

    // Add event listeners for inline editing (curriculum programs only)
    if (hasCurriculum) {
      const marksInputs = document.querySelectorAll('.marks-input');
      marksInputs.forEach(input => {
        input.addEventListener('input', handleInlineMarksChange);
        input.addEventListener('blur', saveMarks);
      });
    }
  }

  // Handle inline marks change
  function handleInlineMarksChange(e) {
    const index = parseInt(e.target.dataset.index, 10);
    const field = e.target.dataset.field;
    const value = safeFloat(e.target.value);

    if (subjects[index]) {
      subjects[index][field] = value;
      calculateSubjectGrade(subjects[index]);
      
      // Update only the grade cell for this row
      const row = e.target.closest('tr');
      const gradeCell = row.querySelector('.grade-col .grade-badge');
      if (gradeCell) {
        const sub = subjects[index];
        gradeCell.className = `grade-badge grade-${sub.grade.replace('+', '')}`;
        gradeCell.textContent = sub.grade;
      }

      // Update results
      calculateResults();
    }
  }

  // Calculate Results
  function calculateResults() {
    if (subjects.length === 0) {
      totalCreditsEl.textContent = '0';
      sgpaEl.textContent = '0.00';
      sgpaGradeEl.textContent = '';
      percentageEl.textContent = '0%';
      distributionBarsEl.innerHTML = '';
      return;
    }

    // Calculate totals with safe math
    const totalCredits = subjects.reduce((sum, sub) => sum + safeFloat(sub.credit), 0);
    const weightedPoints = subjects.reduce((sum, sub) => {
      return sum + (safeFloat(sub.credit) * safeFloat(sub.point));
    }, 0);
    
    const sgpa = totalCredits > 0 ? (weightedPoints / totalCredits) : 0;
    const sgpaGrade = getGrade((sgpa / 4.0) * 100);

    const weightedPercentage = subjects.reduce((sum, sub) => {
      return sum + (safeFloat(sub.percentage) * safeFloat(sub.credit));
    }, 0);
    const avgPercentage = totalCredits > 0 ? (weightedPercentage / totalCredits) : 0;

    // Update display
    totalCreditsEl.textContent = totalCredits.toFixed(1);
    sgpaEl.textContent = sgpa.toFixed(2);
    sgpaGradeEl.textContent = sgpaGrade.letter;
    percentageEl.textContent = avgPercentage.toFixed(2) + '%';

    // Grade Distribution
    renderGradeDistribution();
  }

  // Render Grade Distribution
  function renderGradeDistribution() {
    const distribution = {};
    subjects.forEach(sub => {
      distribution[sub.grade] = (distribution[sub.grade] || 0) + 1;
    });

    const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'F'];
    distributionBarsEl.innerHTML = '';

    grades.forEach(grade => {
      const count = distribution[grade] || 0;
      if (count > 0) {
        const percentage = (count / subjects.length) * 100;
        
        const barDiv = document.createElement('div');
        barDiv.className = 'distribution-bar';
        barDiv.innerHTML = `
          <div class="bar-label grade-badge grade-${grade.replace('+', '')}">${grade}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${percentage}%">
              <span class="bar-count">${count}</span>
            </div>
          </div>
        `;
        distributionBarsEl.appendChild(barDiv);
      }
    });
  }

  // LocalStorage
  function saveSubjects() {
    const key = `ioe_subjects_${currentProgram}_${currentSemester}`;
    localStorage.setItem(key, JSON.stringify(subjects));
  }

  function loadSubjects() {
    const key = `ioe_subjects_${currentProgram}_${currentSemester}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        subjects = JSON.parse(saved);
      } catch (e) {
        subjects = [];
      }
    } else {
      subjects = [];
    }
  }

  // Save/Load marks for curriculum programs (BEI, BCT)
  function saveMarks() {
    const hasCurriculum = currentProgram === 'BEI' || currentProgram === 'BCT';
    if (!hasCurriculum) return;
    
    const key = `${currentProgram.toLowerCase()}_marks_${currentSemester}`;
    const marksData = subjects.map(sub => ({
      code: sub.code,
      assessment: sub.assessment || 0,
      final: sub.final || 0,
      practicalMarks: sub.practicalMarks || 0
    }));
    
    localStorage.setItem(key, JSON.stringify(marksData));
  }

  function getSavedMarks() {
    const hasCurriculum = currentProgram === 'BEI' || currentProgram === 'BCT';
    if (!hasCurriculum) return [];
    
    const key = `${currentProgram.toLowerCase()}_marks_${currentSemester}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  // Initialize
  toggleFieldsByType('theory');
});
