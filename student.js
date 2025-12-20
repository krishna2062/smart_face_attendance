// js/students.js
class StudentsManager {
  constructor() {
    this.currentStep = 1;
    this.studentData = {};
    this.init();
  }

  init() {
    this.setupWizard();
    this.setupEventListeners();
    this.loadStudentsList();
    this.loadDraft();
  }

  setupWizard() {
    this.updateWizard();
  }

  setupEventListeners() {
    // Wizard navigation
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const saveBtn = document.getElementById("saveBtn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.prevStep());
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextStep());
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.saveStudent());
    }

    // Roll number validation
    const rollNumberInput = document.getElementById("rollNumber");
    if (rollNumberInput) {
      rollNumberInput.addEventListener("blur", () => this.validateRollNumber());
    }

    // Export students button
    const exportBtn = document.getElementById("exportStudentsBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportStudentsCSV());
    }

    // Simulation mode change
    const simulationMode = document.getElementById("simulationMode");
    if (simulationMode) {
      simulationMode.addEventListener("change", (e) => {
        const specificGroup = document.getElementById("specificStudentGroup");
        if (e.target.value === "specific") {
          specificGroup.style.display = "block";
        } else {
          specificGroup.style.display = "none";
        }
      });
    }

    // Auto-advance and autosave: listen to inputs in wizard
    const wizardInputs = document.querySelectorAll(
      ".wizard-pane input, .wizard-pane select"
    );
    wizardInputs.forEach((el) => {
      el.addEventListener("input", () => this.onFieldChange());
      el.addEventListener("change", () => this.onFieldChange());
      el.addEventListener("blur", () => this.onFieldChange());
      // Enter key should try to advance
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          // If current step is valid, move next
          if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            this.nextStep();
          }
        }
      });
    });

    const restoreBtn = document.getElementById("restoreDraftBtn");
    if (restoreBtn) {
      restoreBtn.addEventListener("click", () => this.restoreDraft());
    }
  }

  onFieldChange() {
    // Simple autosave without aggressive step advancement
    clearTimeout(this._draftTimer);
    this._draftTimer = setTimeout(() => {
      this.saveCurrentStepData();
      this.saveDraft();
    }, 500);
  }

  // Draft handling
  draftKey() {
    return "student_registration_draft";
  }

  saveDraft() {
    try {
      const draft = {
        step: this.currentStep,
        data: this.studentData,
      };
      localStorage.setItem(this.draftKey(), JSON.stringify(draft));
      const ds = document.getElementById("draftStatus");
      const rb = document.getElementById("restoreDraftBtn");
      if (ds) ds.style.display = "inline-block";
      if (rb) rb.style.display = "none";
    } catch (e) {
      console.error("Failed to save draft", e);
    }
  }

  loadDraft() {
    try {
      const raw = localStorage.getItem(this.draftKey());
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || !draft.data) return;

      const ds = document.getElementById("draftStatus");
      const rb = document.getElementById("restoreDraftBtn");
      if (ds) ds.style.display = "none";
      if (rb) rb.style.display = "inline-block";
      this._loadedDraft = draft; // store for restore
    } catch (e) {
      console.error("Failed to load draft", e);
    }
  }

  restoreDraft() {
    if (!this._loadedDraft) return;
    const draft = this._loadedDraft;
    this.studentData = draft.data || {};
    this.currentStep = draft.step || 1;

    // Populate fields
    const setIf = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };
    setIf("rollNumber", this.studentData.rollNumber);
    setIf("fullName", this.studentData.fullName);
    setIf("email", this.studentData.email);
    setIf("phone", this.studentData.phone);
    setIf("faculty", this.studentData.faculty);
    setIf("semester", this.studentData.semester);
    setIf("section", this.studentData.section);
    setIf("academicYear", this.studentData.academicYear);

    // Restore face image if present
    if (this.studentData.faceImage && window.cameraManager) {
      try {
        window.cameraManager.capturedPhoto = this.studentData.faceImage;
        window.cameraManager.capturedImage.src = this.studentData.faceImage;
        window.cameraManager.capturedImage.style.display = "block";
        document
          .getElementById("capturedPreview")
          .querySelector("p").style.display = "none";
        window.cameraManager.captureBtn.disabled = true;
        window.cameraManager.retakeBtn.disabled = false;
      } catch (e) {
        console.warn("Unable to restore captured image into camera manager", e);
      }
    }

    // Update wizard to reflect restored step
    this.updateWizard();

    // Hide restore button after restore
    const rb = document.getElementById("restoreDraftBtn");
    if (rb) rb.style.display = "none";
    const ds = document.getElementById("draftStatus");
    if (ds) ds.style.display = "inline-block";

    // Clear loaded draft state
    this._loadedDraft = null;
    // Save draft again to reflect any changes
    this.saveDraft();
  }

  updateWizard() {
    // Update steps indicators
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.dataset.step) === this.currentStep) {
            step.classList.add('active');
        }
    });
    
    // Update panes content - Force style display to ensure visibility
    document.querySelectorAll('.wizard-pane').forEach(pane => {
        pane.classList.remove('active');
        pane.style.display = 'none'; // Ensure hidden
        
        if (parseInt(pane.dataset.step) === this.currentStep) {
            pane.classList.add('active');
            pane.style.display = 'block'; // Force show
        }
    });
    
    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (prevBtn) {
        prevBtn.disabled = this.currentStep === 1;
    }
    
    if (nextBtn && saveBtn) {
        if (this.currentStep === 4) {
            nextBtn.style.display = 'none';
            saveBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            saveBtn.style.display = 'none';
        }
    }
    
    // Update confirmation summary
    if (this.currentStep === 4) {
        this.updateConfirmationSummary();
    }
  }

  nextStep() {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.saveCurrentStepData();

    if (this.currentStep < 4) {
      this.currentStep++;
      this.updateWizard();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateWizard();
    }
  }

  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      case 3:
        return this.validateStep3();
      default:
        return true;
    }
  }

  validateStep1() {
    const rollNumber = document.getElementById("rollNumber").value.trim();
    const fullName = document.getElementById("fullName").value.trim();

    let isValid = true;

    if (!rollNumber) {
      this.showError("rollNumberError", "Roll number is required");
      isValid = false;
    } else {
      this.hideError("rollNumberError");
    }

    if (!fullName) {
      this.showError("fullNameError", "Full name is required");
      isValid = false;
    } else {
      this.hideError("fullNameError");
    }

    return isValid;
  }

  validateStep2() {
    const faculty = document.getElementById("faculty").value;
    const semester = document.getElementById("semester").value;
    const section = document.getElementById("section").value.trim();

    let isValid = true;

    if (!faculty) {
      this.showError("facultyError", "Faculty selection is required");
      isValid = false;
    } else {
      this.hideError("facultyError");
    }

    if (!semester) {
      this.showError("semesterError", "Semester is required");
      isValid = false;
    } else {
      this.hideError("semesterError");
    }

    if (!section) {
      this.showError("sectionError", "Section is required");
      isValid = false;
    } else {
      this.hideError("sectionError");
    }

    return isValid;
  }

  validateStep3() {
    const capturedPhoto = window.cameraManager?.getCapturedPhoto();

    if (!capturedPhoto) {
      if (window.mainApp) {
        window.mainApp.showNotification(
          "Please capture a face image first",
          "error"
        );
      }
      return false;
    }

    return true;
  }

  saveCurrentStepData() {
    switch (this.currentStep) {
      case 1:
        this.studentData.rollNumber = document
          .getElementById("rollNumber")
          .value.trim();
        this.studentData.fullName = document
          .getElementById("fullName")
          .value.trim();
        this.studentData.email = document.getElementById("email").value.trim();
        this.studentData.phone = document.getElementById("phone").value.trim();
        break;

      case 2:
        this.studentData.faculty = document.getElementById("faculty").value;
        this.studentData.semester = document.getElementById("semester").value;
        this.studentData.section = document
          .getElementById("section")
          .value.trim();
        this.studentData.academicYear = document
          .getElementById("academicYear")
          .value.trim();
        break;

      case 3:
        // Camera manager may not be available in some contexts, guard access
        this.studentData.faceImage =
          window.cameraManager?.getCapturedPhoto() || null;
        break;
    }
  }

  updateConfirmationSummary() {
    document.getElementById("confirmRollNo").textContent =
      this.studentData.rollNumber || "-";
    document.getElementById("confirmName").textContent =
      this.studentData.fullName || "-";
    document.getElementById("confirmFaculty").textContent =
      this.studentData.faculty || "-";
    document.getElementById("confirmSemester").textContent =
      this.studentData.semester || "-";
    document.getElementById("confirmSection").textContent =
      this.studentData.section || "-";
    document.getElementById("confirmImageStatus").textContent = this.studentData
      .faceImage
      ? "Captured ✓"
      : "Not captured";
    const confirmPreview = document.getElementById("confirmImagePreview");
    if (confirmPreview) {
      if (this.studentData.faceImage) {
        confirmPreview.src = this.studentData.faceImage;
        confirmPreview.style.display = "inline-block";
      } else {
        confirmPreview.src = "";
        confirmPreview.style.display = "none";
      }
    }
  }

  async saveStudent() {
    const confirmCheckbox = document.getElementById("confirmData");
    if (!confirmCheckbox || !confirmCheckbox.checked) {
      if (window.mainApp) {
        window.mainApp.showNotification(
          "Please confirm that the information is correct",
          "error"
        );
      }
      return;
    }

    // Validate all data
    if (
      !this.studentData.rollNumber ||
      !this.studentData.fullName ||
      !this.studentData.faculty ||
      !this.studentData.semester ||
      !this.studentData.section
    ) {
      if (window.mainApp) {
        window.mainApp.showNotification(
          "Please complete all required fields",
          "error"
        );
      }
      return;
    }

    const result = storage.saveStudent(this.studentData);

    if (result.success) {
      // Show success message
      const successAlert = document.getElementById("successAlert");
      if (successAlert) {
        successAlert.style.display = "flex";
      }

      // Reset form
      this.resetWizard();

      // Reload students list
      this.loadStudentsList();

      // Update dashboard
      if (window.mainApp) {
        window.mainApp.updateDashboard();
      }

      // Show notification
      if (window.mainApp) {
        window.mainApp.showNotification(
          "Student registered successfully!",
          "success"
        );
      }

      // Stop camera
      if (window.cameraManager) {
        window.cameraManager.stopCamera();
      }

      // Clear draft
      try {
        localStorage.removeItem(this.draftKey());
      } catch (e) {
        /* ignore */
      }
      const ds = document.getElementById("draftStatus");
      if (ds) ds.style.display = "none";
    } else {
      // Show error message
      const errorAlert = document.getElementById("errorAlert");
      if (errorAlert) {
        errorAlert.style.display = "flex";
        document.getElementById("errorMessage").textContent = result.message;
      }

      if (window.mainApp) {
        window.mainApp.showNotification(result.message, "error");
      }
    }
  }

  resetWizard() {
    this.currentStep = 1;
    this.studentData = {};

    // Reset form fields
    document.getElementById("rollNumber").value = "";
    document.getElementById("fullName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("faculty").value = "";
    document.getElementById("semester").value = "";
    document.getElementById("section").value = "";
    document.getElementById("academicYear").value = "";

    // Reset image
    if (window.cameraManager) {
      window.cameraManager.retakePhoto();
    }

    // Reset alerts
    document.getElementById("successAlert").style.display = "none";
    document.getElementById("errorAlert").style.display = "none";

    // Reset confirmation checkbox
    document.getElementById("confirmData").checked = false;

    // Clear confirmation image preview
    const confirmPreview = document.getElementById("confirmImagePreview");
    if (confirmPreview) {
      confirmPreview.src = "";
      confirmPreview.style.display = "none";
    }

    // Update wizard
    this.updateWizard();

    // Remove any draft
    try {
      localStorage.removeItem(this.draftKey());
    } catch (e) {}
  }

  loadStudentsList() {
    const students = storage.getStudents();
    const container = document.getElementById("studentsList");

    if (!container) return;

    if (students.length === 0) {
      container.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-light); padding: 40px;">
                        <i class="fas fa-user-plus" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                        No students registered yet
                    </td>
                </tr>
            `;
      return;
    }

    container.innerHTML = students
      .map(
        (student) => `
            <tr>
                <td>${student.rollNumber}</td>
                <td>${student.fullName}</td>
                <td>${student.faculty}</td>
                <td>Semester ${student.semester}</td>
                <td>${student.section}</td>
                <td>${student.academicYear || ""}</td>
                <td>${new Date(
                  student.registeredDate
                ).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-small" onclick="studentsManager.viewStudent('${
                      student.id
                    }')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-small btn-warning" onclick="studentsManager.stripFace('${
                      student.id
                    }')" title="Remove face image">
                        <i class="fas fa-eraser"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="studentsManager.deleteStudent('${
                      student.id
                    }')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  stripFace(id) {
    if (
      !confirm(
        "Remove stored face image for this student? This will free storage but disable automatic recognition for this student."
      )
    )
      return;

    const result = storage.updateStudent(id, { faceImage: null });
    if (result.success) {
      this.loadStudentsList();
      if (window.mainApp) {
        window.mainApp.updateDashboard();
        window.mainApp.showNotification("Face image removed", "success");
      }
    } else {
      if (window.mainApp) {
        window.mainApp.showNotification(result.message, "error");
      }
    }
  }

  viewStudent(id) {
    const students = storage.getStudents();
    const student = students.find((s) => s.id === id);

    if (student) {
      alert(`
                Student Details:
                
                Roll Number: ${student.rollNumber}
                Name: ${student.fullName}
                Email: ${student.email || "N/A"}
                Phone: ${student.phone || "N/A"}
                Faculty: ${student.faculty}
                Semester: ${student.semester}
                Section: ${student.section}
                Academic Year: ${student.academicYear || "N/A"}
                Registered: ${new Date(student.registeredDate).toLocaleString()}
            `);
    }
  }

  deleteStudent(id) {
    if (
      confirm(
        "Are you sure you want to delete this student? This action cannot be undone."
      )
    ) {
      const result = storage.deleteStudent(id);

      if (result.success) {
        this.loadStudentsList();
        if (window.mainApp) {
          window.mainApp.updateDashboard();
          window.mainApp.showNotification(
            "Student deleted successfully",
            "success"
          );
        }
      } else {
        if (window.mainApp) {
          window.mainApp.showNotification(result.message, "error");
        }
      }
    }
  }

  validateRollNumber() {
    const rollNumber = document.getElementById("rollNumber").value.trim();
    const errorElement = document.getElementById("rollNumberError");

    if (!rollNumber) {
      this.showError("rollNumberError", "Roll number is required");
      return false;
    }

    // Check for duplicate
    const existingStudent = storage.getStudentByRollNumber(rollNumber);
    if (existingStudent) {
      this.showError("rollNumberError", "Roll number already exists");
      return false;
    }

    this.hideError("rollNumberError");
    return true;
  }

  showError(fieldId, message) {
    const element = document.getElementById(fieldId);
    if (element) {
      element.textContent = message;
      element.style.display = "block";
    }
  }

  hideError(fieldId) {
    const element = document.getElementById(fieldId);
    if (element) {
      element.style.display = "none";
    }
  }

  exportStudentsCSV() {
    const students = storage.getStudents();

    if (students.length === 0) {
      if (window.mainApp) {
        window.mainApp.showNotification("No students to export", "error");
      }
      return;
    }

    // Create CSV headers
    const headers = [
      "Roll Number",
      "Name",
      "Email",
      "Phone",
      "Faculty",
      "Semester",
      "Section",
      "Academic Year",
      "Registered Date",
    ];

    // Create CSV rows
    const rows = students.map((student) => [
      student.rollNumber,
      student.fullName,
      student.email || "",
      student.phone || "",
      student.faculty,
      student.semester,
      student.section,
      student.academicYear || "",
      new Date(student.registeredDate).toLocaleDateString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `students_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.mainApp) {
      window.mainApp.showNotification(
        "Students exported successfully",
        "success"
      );
    }
  }

  populateStudentDropdown() {
    const select = document.getElementById("specificStudent");
    if (!select) return;

    const students = storage.getStudents();

    select.innerHTML =
      '<option value="">Select a student</option>' +
      students
        .map(
          (student) =>
            `<option value="${student.id}">${student.rollNumber} - ${student.fullName}</option>`
        )
        .join("");
  }
}

// Initialize students manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.studentsManager = new StudentsManager();
});
