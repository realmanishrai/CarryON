(function () {
  let currentStep = 1;
  const totalSteps = 5;

  // DOM Elements
  const form = document.getElementById("application-form");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const btnSubmit = document.getElementById("btn-submit");
  const btnCrashSim = document.getElementById("btn-crash-sim");
  const reviewSummary = document.getElementById("review-summary");
  const resumeInput = document.getElementById("resume_file");
  const fileChosenName = document.getElementById("file-chosen-name");

  // Load any previously interrupted state or session data
  const savedState = sessionStorage.getItem("carryon_interrupted_state");
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      sessionStorage.removeItem("carryon_interrupted_state");
      // Populate fields
      Object.keys(parsed).forEach((k) => {
        const el = document.getElementById(k);
        if (el && el.type !== "file") {
          el.value = parsed[k];
        }
      });
      console.log("Restored interrupted demo state from session storage");
    } catch (e) {
      console.error(e);
    }
  }

  // File Upload handling & validation
  if (resumeInput) {
    resumeInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      const errEl = document.getElementById("error-resume_file");
      if (!file) {
        fileChosenName.textContent = "";
        return;
      }

      fileChosenName.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

      // Validate file extension
      const validExtensions = [".pdf", ".docx"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!validExtensions.includes(ext)) {
        errEl.textContent = `Incompatible file format '${ext}'. Only .pdf and .docx documents are accepted.`;
        resumeInput.classList.add("input-error");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        errEl.textContent = `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB). Please upload a smaller document.`;
        resumeInput.classList.add("input-error");
        return;
      }

      errEl.textContent = "";
      resumeInput.classList.remove("input-error");
    });
  }

  // Live input error removal
  document.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", function () {
      field.classList.remove("input-error");
      const errEl = document.getElementById(`error-${field.id}`);
      if (errEl) errEl.textContent = "";
    });
  });

  // Validation function per step
  function validateCurrentStep() {
    let isValid = true;

    function setError(fieldId, message) {
      const field = document.getElementById(fieldId);
      const errEl = document.getElementById(`error-${fieldId}`);
      if (field) field.classList.add("input-error");
      if (errEl) errEl.textContent = message;
      isValid = false;
    }

    if (currentStep === 1) {
      const name = document.getElementById("full_name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();

      if (!name) setError("full_name", "Full Name is required.");
      if (!email) {
        setError("email", "Email Address is required.");
      } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setError("email", "Please enter a valid email address.");
      }

      if (!phone) {
        setError("phone", "Phone Number is required.");
      } else if (/[a-zA-Z]/.test(phone)) {
        // SCENARIO A: Alphabetic in phone number
        setError("phone", "Invalid phone number. Alphabetic characters are not allowed. Please enter digits only.");
      }
    } else if (currentStep === 2) {
      const college = document.getElementById("college").value.trim();
      const degree = document.getElementById("degree").value.trim();
      const gradYear = document.getElementById("graduation_year").value.trim();

      if (!college) setError("college", "College / University is required.");
      if (!degree) setError("degree", "Degree is required.");
      if (!gradYear) {
        setError("graduation_year", "Graduation year is required.");
      } else {
        const yearNum = parseInt(gradYear, 10);
        if (isNaN(yearNum) || yearNum < 1970 || yearNum > 2035) {
          setError("graduation_year", "Please enter a realistic graduation year (1970-2035).");
        }
      }
    } else if (currentStep === 3) {
      const exp = document.getElementById("experience_years").value.trim();
      if (exp === "") {
        setError("experience_years", "Years of experience is required.");
      } else {
        const expNum = parseFloat(exp);
        if (isNaN(expNum) || expNum < 0) {
          // SCENARIO C: Negative years of experience
          setError("experience_years", "Years of experience cannot be negative.");
        }
      }
    } else if (currentStep === 4) {
      const skills = document.getElementById("skills").value.trim();
      if (!skills) setError("skills", "Please list at least 1-2 core technical skills.");

      const fileInput = document.getElementById("resume_file");
      if (!fileInput.files || fileInput.files.length === 0) {
        setError("resume_file", "Please upload your resume.");
      } else {
        const file = fileInput.files[0];
        const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (![".pdf", ".docx"].includes(ext) || file.size > 5 * 1024 * 1024) {
          setError("resume_file", "Incompatible resume file. Must be PDF/DOCX under 5MB.");
        }
      }
    } else if (currentStep === 5) {
      const consent = document.getElementById("confirmation_check");
      if (!consent.checked) {
        setError("confirmation_check", "You must certify the application details to submit.");
      }
    }

    return isValid;
  }

  // Populate Review Step Summary
  function populateReviewSummary() {
    if (!reviewSummary) return;

    const val = (id) => (document.getElementById(id) ? document.getElementById(id).value : "");
    const resumeFile = resumeInput && resumeInput.files[0] ? resumeInput.files[0].name : "Not provided";

    reviewSummary.innerHTML = `
      <div class="review-section">
        <h4>Personal Information</h4>
        <div class="review-grid">
          <div class="review-item"><span>Name:</span> <strong>${val("full_name") || "—"}</strong></div>
          <div class="review-item"><span>Email:</span> <strong>${val("email") || "—"}</strong></div>
          <div class="review-item"><span>Phone:</span> <strong>${val("phone") || "—"}</strong></div>
          <div class="review-item"><span>Location:</span> <strong>${val("location") || "—"}</strong></div>
        </div>
      </div>
      <div class="review-section">
        <h4>Education &amp; Background</h4>
        <div class="review-grid">
          <div class="review-item"><span>College:</span> <strong>${val("college") || "—"}</strong></div>
          <div class="review-item"><span>Degree:</span> <strong>${val("degree") || "—"}</strong></div>
          <div class="review-item"><span>Grad Year:</span> <strong>${val("graduation_year") || "—"}</strong></div>
          <div class="review-item"><span>GPA:</span> <strong>${val("gpa") || "—"}</strong></div>
        </div>
      </div>
      <div class="review-section">
        <h4>Experience &amp; Skills</h4>
        <div class="review-grid">
          <div class="review-item"><span>Experience:</span> <strong>${val("experience_years")} years</strong></div>
          <div class="review-item"><span>Current Role:</span> <strong>${val("current_role") || "—"}</strong></div>
          <div class="review-item"><span>Notice Period:</span> <strong>${val("notice_period")} days</strong></div>
          <div class="review-item"><span>Skills:</span> <strong>${val("skills") || "—"}</strong></div>
          <div class="review-item"><span>Resume:</span> <strong>${resumeFile}</strong></div>
        </div>
      </div>
    `;
  }

  // Update UI for current step
  function updateStepUI() {
    document.querySelectorAll(".form-step").forEach((section, idx) => {
      section.classList.toggle("active", idx + 1 === currentStep);
    });

    document.querySelectorAll(".step-item").forEach((item, idx) => {
      const stepNum = idx + 1;
      item.classList.toggle("active", stepNum === currentStep);
      item.classList.toggle("completed", stepNum < currentStep);
    });

    btnPrev.style.display = currentStep > 1 ? "inline-flex" : "none";

    if (currentStep === totalSteps) {
      btnNext.style.display = "none";
      btnSubmit.style.display = "inline-flex";
      populateReviewSummary();
    } else {
      btnNext.style.display = "inline-flex";
      btnSubmit.style.display = "none";
    }

    // Expose state on window for CarryON DOM extractor
    window.__CARRYON_DEMO_STATE__ = {
      currentStep,
      totalSteps,
      stepTitle: document.querySelector(`.form-step#step-${currentStep}`)?.getAttribute("data-section-name")
    };

    // Dispatch custom event that extension content script can observe
    window.dispatchEvent(new CustomEvent("carryon-step-changed", { detail: window.__CARRYON_DEMO_STATE__ }));
  }

  // Event Handlers
  btnNext.addEventListener("click", function () {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        currentStep++;
        updateStepUI();
      }
    }
  });

  btnPrev.addEventListener("click", function () {
    if (currentStep > 1) {
      currentStep--;
      updateStepUI();
    }
  });

  btnSubmit.addEventListener("click", function () {
    if (validateCurrentStep()) {
      form.style.display = "none";
      document.querySelector(".wizard-header").style.display = "none";
      document.getElementById("submission-success").style.display = "block";
    }
  });

  // SCENARIO E: Simulate session crash
  if (btnCrashSim) {
    btnCrashSim.addEventListener("click", function () {
      const formData = {};
      document.querySelectorAll("input, select, textarea").forEach((el) => {
        if (el.id && el.type !== "file") {
          formData[el.id] = el.value;
        }
      });
      sessionStorage.setItem("carryon_interrupted_state", JSON.stringify(formData));
      sessionStorage.setItem("carryon_simulated_crash", "true");
      // Reload page to simulate sudden browser tab crash / restart
      window.location.reload();
    });
  }

  // Initialize
  updateStepUI();
})();
