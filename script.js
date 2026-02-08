document.addEventListener("DOMContentLoaded", () => {
  // State
  let subjects = [];

  // DOM Elements
  const form = document.getElementById("subjectForm");
  const subjectNameInput = document.getElementById("subjectName");
  const creditHoursInput = document.getElementById("creditHours");
  const internalMarksInput = document.getElementById("internalMarks");
  const finalMarksInput = document.getElementById("finalMarks");
  const formError = document.getElementById("formError");
  const gradeTableBody = document.querySelector("#gradeTable tbody");
  const totalCreditsEl = document.getElementById("totalCredits");
  const sgpaEl = document.getElementById("sgpa");
  const totalPercentageEl = document.getElementById("totalPercentage");
  const emptyState = document.getElementById("emptyState");
  const gradeTable = document.getElementById("gradeTable");

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
  const validateInputs = (subject, credit, internal, final) => {
    if (!subject.trim()) return "Subject Name is required.";
    if (credit < 0.5 || credit > 10) return "Invalid Credit Hours.";
    if (internal < 0 || internal > 40) return "Internal marks must be 0-40.";
    if (final < 0 || final > 60) return "Final marks must be 0-60.";
    return null;
  };

  // Add Subject
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const subject = subjectNameInput.value;
    const credit = parseFloat(creditHoursInput.value);
    const internal = parseFloat(internalMarksInput.value);
    const final = parseFloat(finalMarksInput.value);

    // Validation
    const error = validateInputs(subject, credit, internal, final);
    if (error) {
      formError.textContent = error;
      return;
    }
    formError.textContent = ""; // Clear error

    // Calculation
    const totalMarks = internal + final;
    // Percentage is essentially totalMarks since max is 100 (40+60)
    // But strictly speaking: (totalMarks / 100) * 100
    const percentage = totalMarks;
    const gradeInfo = getGrade(percentage);

    const newSubject = {
      id: Date.now(),
      name: subject,
      credit,
      internal,
      final,
      totalMarks,
      percentage,
      grade: gradeInfo.letter,
      point: gradeInfo.point,
    };

    subjects.push(newSubject);
    renderTable();
    calculateResults();
    form.reset();
    subjectNameInput.focus();
  });

  // Delete Subject
  window.deleteSubject = (id) => {
    subjects = subjects.filter((sub) => sub.id !== id);
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

    subjects.forEach((sub) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${sub.name}</td>
                <td>${sub.credit}</td>
                <td>${sub.internal}</td>
                <td>${sub.final}</td>
                <td>${sub.totalMarks}%</td>
                <td><span class="grade-badge grade-${sub.grade.replace("+", "")}">${sub.grade}</span></td>
                <td>${sub.point}</td>
                <td>
                    <button class="action-btn btn-delete" onclick="deleteSubject(${sub.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
      gradeTableBody.appendChild(row);
    });
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

    // Overall Percentage (Weighted by credit hours is the standard way or just average marks?)
    // Usually Aggregate % = (Sum of (Marks * Credit)) / Sum of Credits
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
});
