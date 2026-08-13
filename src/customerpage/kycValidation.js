// kycValidation.js

// Validation helper functions
/*export const validateFile = (file, fieldName, options = {}) => {
  const { allowedTypes = ["image/jpeg", "image/png", "image/jpg"], maxSize = 5 * 1024 * 1024, required = true } = options;
  
  if (required && !file) {
    return `${fieldName} is required`;
  }
  
  if (file && !allowedTypes.includes(file.type)) {
    return `Only ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} files are allowed`;
  }
  
  if (file && file.size > maxSize) {
    return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  }
  
  return null;
};*/

/*export const validateFile = (file, fieldName, options = {}) => {
  const {
    allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
    maxSize = 25 * 1024 * 1024,
    required = true
  } = options;

  if (required && !file) {
    return `${fieldName} is required`;
  }

  if (!file) return null;

  const fileName = file.name?.toLowerCase() || "";
  const isValidExtension = allowedExtensions.some(ext =>
    fileName.endsWith(ext)
  );

  if (!isValidExtension) {
    return `Only JPG, PNG, WEBP, HEIC images are allowed`;
  }

  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  }

  return null;
};
*/



export const validateFile = (file, fieldName, options = {}) => {
  const {
    allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".heic",
      ".heif",
      ".pdf"
    ],
    maxSize = 25 * 1024 * 1024,
    required = true
  } = options;

  if (required && !file) {
    return `${fieldName} is required`;
  }

  if (!file) return null;

  const fileName = file.name?.toLowerCase() || "";

  const isValidExtension = allowedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!isValidExtension) {
    return "Only JPG, JPEG, PNG, WEBP, HEIC, HEIF, and PDF files are allowed";
  }

  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  }

  return null;
};









export const validatePhoneNumber = (phone, fieldName = "Phone number") => {
  if (!phone?.trim()) {
    return `${fieldName} is required`;
  }
  
  const phoneRegex = /^0[2-9]\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return `Invalid ${fieldName.toLowerCase()} format. Use 0XXXXXXXXX`;
  }
  
  return null;
};

export const validateEmail = (email) => {
  if (!email?.trim()) {
    return "Email is required";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  
  return null;
};

export const validateName = (name, fieldName = "Name") => {
  if (!name?.trim()) {
    return `${fieldName} is required`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  
  return null;
};

/*export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return "Date of birth is required";
  }
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 18) {
    return "You must be at least 18 years old";
  }
  
  if (age > 120) {
    return "Please enter a valid date of birth";
  }
  
  return null;
};
*/


export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth?.trim()) {
    return "Date of birth is required";
  }

  // STRICT FORMAT VALIDATION: yyyy-mm-dd
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateOfBirth)) {
  return "Invalid date format. Example: 1990-05-30";
  }

  // Validate actual date
  const birthDate = new Date(dateOfBirth);

  if (isNaN(birthDate.getTime())) {
    return "Please enter a valid date";
  }

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  if (age < 18) {
    return "You must be at least 18 years old";
  }

  if (age > 120) {
    return "Please enter a valid date of birth";
  }

  return null;
};


// UPDATED: Added options parameter for partial validation
export const validateNationalId = (nationalId, options = {}) => {
  const { required = true, allowPartial = false } = options;
  
  if (!nationalId?.trim()) {
    return required ? "National ID is required" : null;
  }
  
  // Allow partial validation for real-time checking
  if (allowPartial && nationalId.trim().length < 5) {
    return null;
  }
  
  // Remove any whitespace and trim
  const cleanId = nationalId.trim().toUpperCase();
  
  // Ghana Card format: GHA-123456789-0 (9 numbers between hyphens)
  const ghanaCardRegex = /^GHA-\d{9}-\d$/;
  
  if (!ghanaCardRegex.test(cleanId)) {
    const match = cleanId.match(/^GHA-(\d+)-(\d+)$/);
    if (match) {
      const middleDigits = match[1];
      const lastDigit = match[2];
      
      if (middleDigits.length !== 9) {
        return `Invalid Ghana Card format. The middle section must have exactly 9 digits. You entered ${middleDigits.length} digits.`;
      }
      if (lastDigit.length !== 1) {
        return `Invalid Ghana Card format. The last section must have exactly 1 digit. You entered ${lastDigit.length} digits.`;
      }
    }
    
    return "Invalid Ghana Card format. Use GHA-XXXXXXXXX-X (e.g., GHA-123456789-0)";
  }
  
  return null;
};

export const validateNumberField = (value, fieldName, options = {}) => {
  const { required = true, min = 0, allowZero = true } = options;
  
  if (required && !value && value !== 0) {
    return `${fieldName} is required`;
  }
  
  if (value && (isNaN(value) || parseFloat(value) < min)) {
    return `${fieldName} must be a positive number`;
  }
  
  if (value === 0 && !allowZero) {
    return `${fieldName} must be greater than 0`;
  }
  
  return null;
};

export const validateYearsField = (years, fieldName) => {
  if (!years && years !== 0) {
    return `${fieldName} is required`;
  }
  
  if (years && parseFloat(years) < 0) {
    return `${fieldName} must be a positive number`;
  }
  
  if (years && parseFloat(years) > 50) {
    return `${fieldName} seems too high. Please verify.`;
  }
  
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value?.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateGpsAddress = (address) => {
  if (!address?.trim()) {
    return "GPS address is required";
  }
  
  if (address.trim().length < 3) {
    return "Please enter a valid GPS address or location description";
  }
  
  const validCharsRegex = /^[a-zA-Z0-9\s\-_,.()]+$/;
  if (!validCharsRegex.test(address.trim())) {
    return "GPS address contains invalid characters. Use letters, numbers, spaces, hyphens, or commas.";
  }
  
  return null;
};

// Step-specific validations
export const validatePersonalInfoStep = (formData) => {
  const errors = {};
  
  // Avatar validation
  const avatarError = validateFile(formData.avatar, "Profile picture", { required: true });
  if (avatarError) errors.avatar = avatarError;
  
  // Title validation
  const titleError = validateRequired(formData.title, "Title");
  if (titleError) errors.title = titleError;
  
  // Name validations
  const firstNameError = validateName(formData.firstName, "First name");
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateName(formData.lastName, "Last name");
  if (lastNameError) errors.lastName = lastNameError;
  
  // Date of birth validation
  const dobError = validateDateOfBirth(formData.dateOfBirth);
  if (dobError) errors.dateOfBirth = dobError;
  
  // Gender validation
  const genderError = validateRequired(formData.gender, "Gender");
  if (genderError) errors.gender = genderError;
  
  // Marital Status validation
  const maritalStatusError = validateRequired(formData.maritalStatus, "Marital status");
  if (maritalStatusError) errors.maritalStatus = maritalStatusError;
  
  // UPDATED: Only validate format, duplicate check happens separately in component
  const nationalIdError = validateNationalId(formData.nationalId, { required: true });
  if (nationalIdError) errors.nationalId = nationalIdError;
  
  // Residential location validation
  const residentialLocationError = validateRequired(formData.residentialLocation, "Residential location");
  if (residentialLocationError) errors.residentialLocation = residentialLocationError;
  
  // Spouse validation for married individuals
  if (formData.maritalStatus === "married") {
    const spouseNameError = validateName(formData.spouseName, "Spouse name");
    if (spouseNameError) errors.spouseName = spouseNameError;
    
    const spouseContactError = validatePhoneNumber(formData.spouseContact, "Spouse contact");
    if (spouseContactError) errors.spouseContact = spouseContactError;
  }
  
  return errors;
};

export const validateContactInfoStep = (formData) => {
  const errors = {};
  
  // Email validation
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  // Mobile number validation
  const mobileError = validatePhoneNumber(formData.mobileNumber, "Mobile number");
  if (mobileError) errors.mobileNumber = mobileError;
  
  // Residential address validation
  const addressError = validateRequired(formData.residentialAddress, "Residential GPS address");
  if (addressError) errors.residentialAddress = addressError;
  
  // City validation
  const cityError = validateRequired(formData.city, "City/Town");
  if (cityError) errors.city = cityError;
  
  // State/Suburb validation
  const stateError = validateRequired(formData.state, "Suburb/Area");
  if (stateError) errors.state = stateError;
  
  // Alternate phone validation (optional but validate format if provided)
  if (formData.alternatePhone) {
    const alternatePhoneError = validatePhoneNumber(formData.alternatePhone, "Alternate phone number");
    if (alternatePhoneError) errors.alternatePhone = alternatePhoneError;
  }
  
  return errors;
};


export const validateEmploymentInfoStep = (formData) => {
  const errors = {};
  
  if (!formData.employmentStatus) {
    errors.employmentStatus = "Employment status is required";
    return errors;
  }
  
  if (formData.employmentStatus === "salary-worker") {
    const employerError = validateRequired(formData.employerName, "Employer name");
    if (employerError) errors.employerName = employerError;
    
    const jobTitleError = validateRequired(formData.jobTitle, "Job title");
    if (jobTitleError) errors.jobTitle = jobTitleError;
    
    const monthlyIncomeError = validateNumberField(formData.monthlyIncome, "Monthly income");
    if (monthlyIncomeError) errors.monthlyIncome = monthlyIncomeError;
    
    const yearsError = validateYearsField(formData.yearsInCurrentEmployment, "Years in current employment");
    if (yearsError) errors.yearsInCurrentEmployment = yearsError;
    
    const workplaceError = validateRequired(formData.workPlaceLocation, "Workplace location");
    if (workplaceError) errors.workPlaceLocation = workplaceError;
    
    const payslipError = validateFile(formData.payslip, "Payslip", { 
      required: true, 
      allowedTypes: ["application/pdf", "image/jpeg", "image/png", "image/jpg"] 
    });
    if (payslipError) errors.payslip = payslipError;
    
    const ghanaCardFrontError = validateFile(formData.ghanaCardFront, "Ghana Card front image", { required: true });
    if (ghanaCardFrontError) errors.ghanaCardFront = ghanaCardFrontError;
    
    const ghanaCardBackError = validateFile(formData.ghanaCardBack, "Ghana Card back image", { required: true });
    if (ghanaCardBackError) errors.ghanaCardBack = ghanaCardBackError;

    // ✅ NEW: Validation for Employment ID
    const employmentIdError = validateFile(formData.employmentId, "Employment ID", { required: true });
    if (employmentIdError) errors.employmentId = employmentIdError;
    
  } else if (formData.employmentStatus === "self-employed") {
    // ... (existing self-employed validations remain unchanged)
  }
  
  return errors;
};


export const validateReferenceInfoStep = (formData) => {
  const errors = {};
  
  const ref1NameError = validateName(formData.referenceName1, "Reference 1 name");
  if (ref1NameError) errors.referenceName1 = ref1NameError;
  
  const ref1PhoneError = validatePhoneNumber(formData.referencePhone1, "Reference 1 phone number");
  if (ref1PhoneError) errors.referencePhone1 = ref1PhoneError;
  
  const ref2NameError = validateName(formData.referenceName2, "Reference 2 name");
  if (ref2NameError) errors.referenceName2 = ref2NameError;
  
  const ref2PhoneError = validatePhoneNumber(formData.referencePhone2, "Reference 2 phone number");
  if (ref2PhoneError) errors.referencePhone2 = ref2PhoneError;
  
  if (formData.referencePhone1 && formData.referencePhone2 && 
      formData.referencePhone1 === formData.referencePhone2) {
    errors.referencePhone2 = "References must be different people";
  }
  
  return errors;
};

export const validateAllSteps = (formData) => {
  const step1Errors = validatePersonalInfoStep(formData);
  const step2Errors = validateContactInfoStep(formData);
  const step3Errors = validateEmploymentInfoStep(formData);
  const step4Errors = validateReferenceInfoStep(formData);
  
  return {
    isValid: Object.keys(step1Errors).length === 0 && 
             Object.keys(step2Errors).length === 0 && 
             Object.keys(step3Errors).length === 0 && 
             Object.keys(step4Errors).length === 0,
    errors: {
      step1: step1Errors,
      step2: step2Errors,
      step3: step3Errors,
      step4: step4Errors,
    }
  };
};

export const getStepErrors = (formData, step) => {
  switch (step) {
    case 1:
      return validatePersonalInfoStep(formData);
    case 2:
      return validateContactInfoStep(formData);
    case 3:
      return validateEmploymentInfoStep(formData);
    case 4:
      return validateReferenceInfoStep(formData);
    default:
      return {};
  }
};

export const hasError = (errors, fieldName) => {
  return errors && errors[fieldName] ? errors[fieldName] : null;
};