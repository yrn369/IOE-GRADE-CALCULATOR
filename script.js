document.addEventListener('DOMContentLoaded', () => {
  // State
  let subjects = [];
  let currentProgram = '';
  let currentSemester = '';
  let subjectCounter = 0;

  // DOM Elements
  const programSelect = document.getElementById('programSelect');
  const semesterRow = document.getElementById('semesterRow');
  const semesterSelect = document.getElementById('semesterSelect');
  const subjectsSection = document.getElementById('subjectsSection');
  const subjectsList = document.getElementById('subjectsList');
  const emptySubjects = document.getElementById('emptySubjects');
  const addSubjectBtn = document.getElementById('addSubjectBtn');
  const resultsSection = document.getElementById('resultsSection');
  const calculateBtn = document.getElementById('calculateBtn');
  const gradeTableBody = document.getElementById('gradeTableBody');
  const totalCreditsEl = document.getElementById('totalCredits');
  const sgpaEl = document.getElementById('sgpa');
  const percentageEl = document.getElementById('percentage');

  // IOE Grading System
  const getGrade = (percentage) => {
    if (percentage >= 90) return { letter: 'A', point: 4.0 };
    if (percentage >= 80) return { letter: 'A-', point: 3.7 };
    if (percentage >= 70) return { letter: 'B+', point: 3.3 };
    if (percentage >= 60) return { letter: 'B', point: 3.0 };
    if (percentage >= 50) return { letter: 'B-', point: 2.7 };
    if (percentage >= 40) return { letter: 'C+', point: 2.4 };
    if (percentage >= 35) return { letter: 'C', point: 2.0 };
    return { letter: 'F', point: 0.0 };
  };

  // Subject Type Handler
  const getSubjectType = () => {
    return {
      THEORY: 'theory',
      PRACTICAL: 'practical',
      THEORY_WITH_PRACTICAL: 'theory_with_practical'
    };
  };

  const SUBJECT_TYPES = getSubjectType();

  // Program Selection Handler
  programSelect.addEventListener('change', (e) => {
    currentProgram = e.target.value;
    
    if (currentProgram) {
      // Show semester row
      semesterRow.style.display = 'flex';
      
      // Populate semesters
      const maxSemesters = e.target.selectedOptions[0].dataset.semesters || 8;
      semesterSelect.innerHTML = '<option value="">Choose Semester</option>';
      
      for (let i = 1; i <= maxSemesters; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Semester ${i}`;
        semesterSelect.appendChild(option);
      }
      
      // Reset semester selection
      currentSemester = '';
      subjectsSection.style.display = 'none';
      resultsSection.style.display = 'none';
      subjects = [];
      subjectsList.innerHTML = '';
    } else {
      semesterRow.style.display = 'none';
      subjectsSection.style.display = 'none';
      resultsSection.style.display = 'none';
    }
  });

  // Semester Selection Handler
  semesterSelect.addEventListener('change', (e) => {
    currentSemester = e.target.value;
    
    if (currentSemester) {
      subjectsSection.style.display = 'block';
      
      // Load saved subjects from localStorage
      loadSubjects();
      
      if (subjects.length > 0) {
        renderSubjects();
        resultsSection.style.display = 'block';
        calculateGrades();
      }
    } else {
      subjectsSection.style.display = 'none';
      resultsSection.style.display = 'none';
    }
  });

  // Add Subject Button
  addSubjectBtn.addEventListener('click', () => {
    subjectCounter++;
    const subjectCard = createSubjectCard(subjectCounter);
    subjectsList.appendChild(subjectCard);
    emptySubjects.style.display = 'none';
    resultsSection.style.display = 'block';
  });

  // Create Subject Card
  function createSubjectCard(id, data = null) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.dataset.id = id;

    const subjectType = data?.subjectType || 'theory';

    card.innerHTML = `
      <div class="subject-card-header">
        <span class="subject-number">Subject ${id}</span>
        <button class="btn-remove" onclick="removeSubject(${id})">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
      <form class="subject-form">
        <div class="form-group">
          <label>Subject Name</label>
          <input type="text" class="subject-name" placeholder="e.g., Applied Mathematics" value="${data?.name || ''}" required>
        </div>
        <div class="form-group">
          <label>Subject Type</label>
          <select class="subject-type" required>
            <option value="theory" ${subjectType === 'theory' ? 'selected' : ''}>Theory Only</option>
            <option value="practical" ${subjectType === 'practical' ? 'selected' : ''}>Practical Only</option>
            <option value="theory_with_practical" ${subjectType === 'theory_with_practical' ? 'selected' : ''}>Theory + Practical</option>
          </select>
        </div>
        <div class="form-group">
          <label>Credit Hours</label>
          <input type="number" class="credit-hours" min="0.5" max="10" step="0.5" value="${data?.credit || ''}" placeholder="3" required>
        </div>
        
        <div class="marks-row theory-marks" style="display: ${subjectType !== 'practical' ? 'grid' : 'none'};">
          <div class="form-group">
            <label>Assessment/Internal (Max 40)</label>
            <input type="number" class="internal-marks" min="0" max="40" value="${data?.internal || ''}" placeholder="0">
          </div>
          <div class="form-group">
            <label>Final Theory (Max 60)</label>
            <input type="number" class="final-marks" min="0" max="60" value="${data?.final || ''}" placeholder="0">
          </div>
        </div>
        
        <div class="practical-marks-only" style="display: ${subjectType === 'practical' ? 'grid' : 'none'};">
          <div class="form-group">
            <label>Practical Max Marks</label>
            <select class="practical-max-solo" required>
              <option value="">Select Max</option>
              <option value="25" ${data?.practicalMax === 25 ? 'selected' : ''}>25</option>
              <option value="50" ${data?.practicalMax === 50 ? 'selected' : ''}>50</option>
              <option value="75" ${data?.practicalMax === 75 ? 'selected' : ''}>75</option>
              <option value="100" ${data?.practicalMax === 100 ? 'selected' : ''}>100</option>
            </select>
          </div>
          <div class="form-group">
            <label>Assessment Marks</label>
            <input type="number" class="practical-assessment" min="0" value="${data?.practicalAssessment || ''}" placeholder="0">
          </div>
        </div>
        
        <div class="practical-row" style="display: ${subjectType === 'theory_with_practical' ? 'grid' : 'none'}; grid-column: 1 / -1;">
          <div class="form-group">
            <label>Practical Max Marks</label>
            <select class="practical-max" required>
              <option value="">Select Max</option>
              <option value="25" ${data?.practicalMax === 25 ? 'selected' : ''}>25</option>
              <option value="50" ${data?.practicalMax === 50 ? 'selected' : ''}>50</option>
              <option value="100" ${data?.practicalMax === 100 ? 'selected' : ''}>100</option>
            </select>
          </div>
          <div class="form-group">
            <label>Practical Marks</label>
            <input type="number" class="practical-marks" min="0" value="${data?.practicalMarks || ''}" placeholder="0">
          </div>
        </div>
      </form>
    `;

    // Subject type change handler
    const subjectTypeSelect = card.querySelector('.subject-type');
    const theoryMarksRow = card.querySelector('.theory-marks');
    const practicalMarksOnly = card.querySelector('.practical-marks-only');
    const practicalRow = card.querySelector('.practical-row');
    const internalInput = card.querySelector('.internal-marks');
    const finalInput = card.querySelector('.final-marks');
    const practicalMaxSolo = card.querySelector('.practical-max-solo');
    const practicalAssessment = card.querySelector('.practical-assessment');
    const practicalMax = card.querySelector('.practical-max');
    const practicalMarks = card.querySelector('.practical-marks');

    subjectTypeSelect.addEventListener('change', (e) => {
      const type = e.target.value;
      
      if (type === 'theory') {
        theoryMarksRow.style.display = 'grid';
        practicalMarksOnly.style.display = 'none';
        practicalRow.style.display = 'none';
        internalInput.required = true;
        finalInput.required = true;
        practicalMaxSolo.required = false;
        practicalAssessment.required = false;
        practicalMax.required = false;
        practicalMarks.required = false;
      } else if (type === 'practical') {
        theoryMarksRow.style.display = 'none';
        practicalMarksOnly.style.display = 'grid';
        practicalRow.style.display = 'none';
        internalInput.required = false;
        finalInput.required = false;
        practicalMaxSolo.required = true;
        practicalAssessment.required = true;
        practicalMax.required = false;
        practicalMarks.required = false;
      } else { // theory_with_practical
        theoryMarksRow.style.display = 'grid';
        practicalMarksOnly.style.display = 'none';
        practicalRow.style.display = 'grid';
        internalInput.required = true;
        finalInput.required = true;
        practicalMaxSolo.required = false;
        practicalAssessment.required = false;
        practicalMax.required = true;
        practicalMarks.required = true;
      }
      calculateGrades();
    });

    // Update practical marks max
    if (practicalMaxSolo) {
      practicalMaxSolo.addEventListener('change', (e) => {
        practicalAssessment.max = e.target.value;
        practicalAssessment.placeholder = `Max ${e.target.value}`;
      });
    }

    if (practicalMax) {
      practicalMax.addEventListener('change', (e) => {
        practicalMarks.max = e.target.value;
        practicalMarks.placeholder = `Max ${e.target.value}`;
      });
    }

    // Auto-calculate on input change
    const inputs = card.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        calculateGrades();
      });
    });

    return card;
  }

  // Remove Subject (global function)
  window.removeSubject = (id) => {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.remove();
      const remainingCards = subjectsList.querySelectorAll('.subject-card');
      if (remainingCards.length === 0) {
        emptySubjects.style.display = 'block';
        resultsSection.style.display = 'none';
      }
      calculateGrades();
      saveSubjects();
    }
  };

  // Get Subjects from Cards
  function getSubjectsFromCards() {
    const cards = subjectsList.querySelectorAll('.subject-card');
    const subjectsData = [];

    cards.forEach(card => {
      const name = card.querySelector('.subject-name').value;
      const credit = parseFloat(card.querySelector('.credit-hours').value) || 0;
      const subjectType = card.querySelector('.subject-type').value;
      
      if (!name || !credit) return;

      let totalMarks, maxMarks, percentage;

      if (subjectType === 'theory') {
        // Theory only: Internal + Final (max 100)
        const internal = parseFloat(card.querySelector('.internal-marks').value) || 0;
        const final = parseFloat(card.querySelector('.final-marks').value) || 0;
        totalMarks = internal + final;
        maxMarks = 100;
        percentage = (totalMarks / maxMarks) * 100;

        const gradeInfo = getGrade(percentage);
        subjectsData.push({
          name,
          credit,
          subjectType,
          internal,
          final,
          practicalMarks: 0,
          totalMarks,
          maxMarks,
          percentage,
          grade: gradeInfo.letter,
          point: gradeInfo.point
        });

      } else if (subjectType === 'practical') {
        // Practical only: Assessment marks only
        const practicalMax = parseInt(card.querySelector('.practical-max-solo').value, 10) || 0;
        const practicalAssessment = parseFloat(card.querySelector('.practical-assessment').value) || 0;
        totalMarks = practicalAssessment;
        maxMarks = practicalMax;
        percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

        const gradeInfo = getGrade(percentage);
        subjectsData.push({
          name,
          credit,
          subjectType,
          internal: 0,
          final: 0,
          practicalMax,
          practicalMarks: practicalAssessment,
          totalMarks,
          maxMarks,
          percentage,
          grade: gradeInfo.letter,
          point: gradeInfo.point
        });

      } else { // theory_with_practical
        // Theory + Practical combined in one subject
        const internal = parseFloat(card.querySelector('.internal-marks').value) || 0;
        const final = parseFloat(card.querySelector('.final-marks').value) || 0;
        const practicalMax = parseInt(card.querySelector('.practical-max').value, 10) || 0;
        const practicalMarks = parseFloat(card.querySelector('.practical-marks').value) || 0;
        
        const theoryMarks = internal + final;
        totalMarks = theoryMarks + practicalMarks;
        maxMarks = 100 + practicalMax;
        percentage = (totalMarks / maxMarks) * 100;

        const gradeInfo = getGrade(percentage);
        subjectsData.push({
          name,
          credit,
          subjectType,
          internal,
          final,
          practicalMax,
          practicalMarks,
          totalMarks,
          maxMarks,
          percentage,
          grade: gradeInfo.letter,
          point: gradeInfo.point
        });
      }
    });

    return subjectsData;
  }

  // Calculate Grades
  function calculateGrades() {
    subjects = getSubjectsFromCards();
    
    if (subjects.length === 0) {
      totalCreditsEl.textContent = '0';
      sgpaEl.textContent = '0.00';
      percentageEl.textContent = '0%';
      gradeTableBody.innerHTML = '';
      return;
    }

    // Calculate totals
    const totalCredits = subjects.reduce((sum, sub) => sum + sub.credit, 0);
    const weightedPoints = subjects.reduce((sum, sub) => sum + (sub.credit * sub.point), 0);
    const sgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00';
    
    const weightedPercentage = subjects.reduce((sum, sub) => sum + (sub.percentage * sub.credit), 0);
    const avgPercentage = totalCredits > 0 ? (weightedPercentage / totalCredits).toFixed(2) : '0.00';

    // Update display
    totalCreditsEl.textContent = totalCredits.toFixed(1);
    sgpaEl.textContent = sgpa;
    percentageEl.textContent = avgPercentage + '%';

    // Render table
    renderGradeTable();
    
    // Save to localStorage
    saveSubjects();
  }

  // Render Grade Table
  function renderGradeTable() {
    gradeTableBody.innerHTML = '';

    subjects.forEach(sub => {
      const row = document.createElement('tr');
      
      let internalDisplay, finalDisplay, practicalDisplay;
      
      if (sub.subjectType === 'theory') {
        internalDisplay = sub.internal;
        finalDisplay = sub.final;
        practicalDisplay = '-';
      } else if (sub.subjectType === 'practical') {
        internalDisplay = '-';
        finalDisplay = '-';
        practicalDisplay = `${sub.practicalMarks}/${sub.maxMarks}`;
      } else { // theory_with_practical
        internalDisplay = sub.internal;
        finalDisplay = sub.final;
        practicalDisplay = `${sub.practicalMarks}/${sub.practicalMax}`;
      }
      
      row.innerHTML = `
        <td>${sub.name}</td>
        <td>${sub.credit}</td>
        <td>${internalDisplay}</td>
        <td>${finalDisplay}</td>
        <td>${practicalDisplay}</td>
        <td>${sub.totalMarks}/${sub.maxMarks}</td>
        <td><span class="grade-badge grade-${sub.grade.replace('+', '')}">${sub.grade}</span></td>
        <td>${sub.point.toFixed(1)}</td>
      `;
      
      gradeTableBody.appendChild(row);
    });
  }

  // Save Subjects to localStorage
  function saveSubjects() {
    const cards = subjectsList.querySelectorAll('.subject-card');
    const cardsData = [];

    cards.forEach(card => {
      const name = card.querySelector('.subject-name').value;
      const credit = card.querySelector('.credit-hours').value;
      const subjectType = card.querySelector('.subject-type').value;
      const internal = card.querySelector('.internal-marks').value;
      const final = card.querySelector('.final-marks').value;
      
      let practicalMax, practicalMarks, practicalAssessment;
      
      if (subjectType === 'practical') {
        practicalMax = card.querySelector('.practical-max-solo').value;
        practicalAssessment = card.querySelector('.practical-assessment').value;
        practicalMarks = null;
      } else if (subjectType === 'theory_with_practical') {
        practicalMax = card.querySelector('.practical-max').value;
        practicalMarks = card.querySelector('.practical-marks').value;
        practicalAssessment = null;
      } else {
        practicalMax = null;
        practicalMarks = null;
        practicalAssessment = null;
      }

      cardsData.push({
        name,
        credit,
        subjectType,
        internal,
        final,
        practicalMax: parseInt(practicalMax, 10) || 0,
        practicalMarks,
        practicalAssessment
      });
    });

    const key = `ioe_subjects_${currentProgram}_${currentSemester}`;
    localStorage.setItem(key, JSON.stringify(cardsData));
  }

  // Load Subjects from localStorage
  function loadSubjects() {
    const key = `ioe_subjects_${currentProgram}_${currentSemester}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      const cardsData = JSON.parse(saved);
      subjectsList.innerHTML = '';
      subjectCounter = 0;
      
      if (cardsData.length > 0) {
        emptySubjects.style.display = 'none';
        cardsData.forEach(data => {
          subjectCounter++;
          const card = createSubjectCard(subjectCounter, data);
          subjectsList.appendChild(card);
        });
      } else {
        emptySubjects.style.display = 'block';
      }
    } else {
      subjectsList.innerHTML = '';
      subjectCounter = 0;
      emptySubjects.style.display = 'block';
    }
  }

  // Render Subjects (refresh display)
  function renderSubjects() {
    if (subjectsList.querySelectorAll('.subject-card').length > 0) {
      emptySubjects.style.display = 'none';
    } else {
      emptySubjects.style.display = 'block';
    }
  }

  // Calculate button
  calculateBtn.addEventListener('click', () => {
    calculateGrades();
  });
});
