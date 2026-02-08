document.addEventListener("DOMContentLoaded", () => {
  // State
  let subjects = JSON.parse(localStorage.getItem("ioe_subjects")) || [];

  // DOM Elements
  const form = document.getElementById("subjectForm");
  const subjectNameInput = document.getElementById("subjectName");
  const creditHoursInput = document.getElementById("creditHours");
  const internalMarksInput = document.getElementById("internalMarks");
  const finalMarksInput = document.getElementById("finalMarks");
  const hasPracticalCheckbox = document.getElementById("hasPractical");
  const practicalFields = document.getElementById("practicalFields");
  const practicalMaxMarksSelect = document.getElementById("practicalMaxMarks");
  const practicalMarksInput = document.getElementById("practicalMarks");
  const formError = document.getElementById("formError");
  const gradeTableBody = document.querySelector("#gradeTable tbody");
  const totalCreditsEl = document.getElementById("totalCredits");
  const sgpaEl = document.getElementById("sgpa");
  const totalPercentageEl = document.getElementById("totalPercentage");
  const emptyState = document.getElementById("emptyState");
  const gradeTable = document.getElementById("gradeTable");

  // Toggle Practical Fields
  hasPracticalCheckbox.addEventListener("change", () => {
    if (hasPracticalCheckbox.checked) {
      practicalFields.style.display = "block";
      practicalMaxMarksSelect.required = true;
      practicalMarksInput.required = true;
    } else {
      practicalFields.style.display = "none";
      practicalMaxMarksSelect.required = false;
      practicalMarksInput.required = false;
      practicalMaxMarksSelect.value = "";
      practicalMarksInput.value = "";
      practicalMarksInput.max = "";
    }
  });

  // Update practical marks max based on selection
  practicalMaxMarksSelect.addEventListener("change", () => {
    const maxMarks = practicalMaxMarksSelect.value;
    if (maxMarks) {
      practicalMarksInput.max = maxMarks;
      practicalMarksInput.placeholder = `Max ${maxMarks}`;
    }
  });

  // IOE Grading System
  const getGrade = (percentage) => {
    if (percentage >= 90) return { letter: "A", point: 4.0 };
    if (percentage >= 80) return { letter: "A-", point: 3.7 };
    if (percentage >= 70) return { letter: "B+", point: 3.3 };
    if (percentage >= 60) return { letter: "B", point: 3.0 };
    if (percentage >= 50) return { letter: "B-", point: 2.7 };
    return { letter: "F", point: 0.0 }; // Fail
  };

  // Helper: Validations
  const validateInputs = (subject, credit, internal, final, hasPractical, practicalMarks, practicalMax) => {
    if (!subject.trim()) return "Subject Name is required.";
    if (credit < 0.5 || credit > 10) return "Invalid Credit Hours.";
    if (internal < 0 || internal > 40) return "Internal marks must be 0-40.";
    if (final < 0 || final > 60) return "Final marks must be 0-60.";
    
    if (hasPractical) {
      if (!practicalMax) return "Please select Practical Max Marks.";
      if (practicalMarks < 0 || practicalMarks > practicalMax) {
        return `Practical marks must be 0-${practicalMax}.`;
      }
    }
    
    return null;
  };

  // Update Storage
  const updateStorage = () => {
    localStorage.setItem("ioe_subjects", JSON.stringify(subjects));
  };

  // Add Subject
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const subject = subjectNameInput.value;
    const credit = parseFloat(creditHoursInput.value);
    const internal = parseFloat(internalMarksInput.value);
    const final = parseFloat(finalMarksInput.value);
    const hasPractical = hasPracticalCheckbox.checked;
    const practicalMax = hasPractical ? parseInt(practicalMaxMarksSelect.value, 10) : 0;
    const practicalMarks = hasPractical ? parseFloat(practicalMarksInput.value) || 0 : 0;

    // Validation
    const error = validateInputs(subject, credit, internal, final, hasPractical, practicalMarks, practicalMax);
    if (error) {
      formError.textContent = error;
      return;
    }
    formError.textContent = ""; // Clear error

    // Calculation
    const theoryMarks = internal + final; // Max 100
    const totalMarks = theoryMarks + practicalMarks;
    
    // Calculate percentage based on whether subject has practical
    const maxMarks = 100 + practicalMax; // 100 (theory) + practical max (0/25/50/100)
    const percentage = (totalMarks / maxMarks) * 100;
    
    const gradeInfo = getGrade(percentage);

    const newSubject = {
      id: Date.now(),
      name: subject,
      credit,
      internal,
      final,
      hasPractical,
      practicalMarks,
      practicalMax,
      theoryMarks,
      totalMarks,
      maxMarks,
      percentage,
      grade: gradeInfo.letter,
      point: gradeInfo.point,
    };

    subjects.push(newSubject);
    updateStorage();
    renderTable();
    calculateResults();
    form.reset();
    hasPracticalCheckbox.checked = false;
    practicalFields.style.display = "none";
    practicalMaxMarksSelect.required = false;
    practicalMarksInput.required = false;
    practicalMarksInput.max = "";
    subjectNameInput.focus();
  });

  // Table Event Delegation (Delete)
  gradeTableBody.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".btn-delete");
    if (deleteBtn) {
      const id = parseInt(deleteBtn.dataset.id, 10);
      deleteSubject(id);
    }
  });

  // Delete Subject Logic
  const deleteSubject = (id) => {
    subjects = subjects.filter((sub) => sub.id !== id);
    updateStorage();
    renderTable();
    calculateResults();
  };

  // Render Table
  const renderTable = () => {
    gradeTableBody.innerHTML = "";

    if (subjects.length === 0) {
      gradeTable.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    gradeTable.style.display = "table";
    emptyState.style.display = "none";

    // Use DocumentFragment for performance
    const fragment = document.createDocumentFragment();

    subjects.forEach((sub) => {
      const row = document.createElement("tr");
      
      // Display practical marks with max or '-' if no practical
      const practicalDisplay = sub.hasPractical ? `${sub.practicalMarks}/${sub.practicalMax}` : '-';
      
      row.innerHTML = `
                <td>${sub.name}</td>
                <td>${sub.credit}</td>
                <td>${sub.internal}</td>
                <td>${sub.final}</td>
                <td>${practicalDisplay}</td>
                <td>${sub.totalMarks}/${sub.maxMarks}</td>
                <td><span class="grade-badge grade-${sub.grade.replace("+", "")}">${sub.grade}</span></td>
                <td>${sub.point}</td>
                <td>
                    <button class="action-btn btn-delete" data-id="${sub.id}" aria-label="Delete ${sub.name}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
      fragment.appendChild(row);
    });
    gradeTableBody.appendChild(fragment);
  };

  // Calculate Overall Results
  const calculateResults = () => {
    if (subjects.length === 0) {
      totalCreditsEl.textContent = "0";
      sgpaEl.textContent = "0.00";
      totalPercentageEl.textContent = "0%";
      return;
    }

    const totalCredits = subjects.reduce((sum, sub) => sum + sub.credit, 0);
    const weightedPoints = subjects.reduce(
      (sum, sub) => sum + sub.credit * sub.point,
      0,
    );

    // SGPA = Total Weighted Points / Total Credits
    const sgpa =
      totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : "0.00";

    const weightedMarks = subjects.reduce(
      (sum, sub) => sum + sub.totalMarks * sub.credit,
      0,
    );
    const aggregatePercentage =
      totalCredits > 0 ? (weightedMarks / totalCredits).toFixed(2) : "0.00";

    totalCreditsEl.textContent = totalCredits;
    sgpaEl.textContent = sgpa;
    totalPercentageEl.textContent = aggregatePercentage + "%";
  };

  // Initial Render
  renderTable();
  calculateResults();
});
