import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createUserPatient } from '../services/patientService'; // Adjust path if needed

// Icons for better UI
import { 
  FiUser, FiMail, FiCalendar, FiBriefcase, FiBarChart2, FiHeart, FiFileText, FiPlus, FiLoader
} from 'react-icons/fi';

// Reusable Input Components for cleaner code
const FormSection = ({ title, icon, children }) => (
  <div className="bg-bg-surface p-6 md:p-8 rounded-2xl border border-border-default shadow-sm mb-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-bg-surface-alt p-2 rounded-full text-primary">
        {icon}
      </div>
      <h2 className="text-xl md:text-2xl font-primary font-semibold text-text-strong">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {children}
    </div>
  </div>
);

const InputField = ({ name, label, type, register, errors, placeholder, Icon }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-1.5 font-medium text-text-muted">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute top-1/2 left-3 -translate-y-1/2 text-text-subtle" />}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, { 
            valueAsNumber: type === 'number',
            ...(type === 'number' && { min: { value: 0, message: "Value cannot be negative" } })
         })}
        className={`w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 rounded-lg font-secondary bg-bg-app border border-border-default focus:ring-2 focus:ring-border-hover focus:border-border-focus outline-none transition-all duration-300 placeholder:text-text-subtle text-text-default`}
      />
    </div>
    {errors[name] && <span className="text-danger-text text-sm mt-1">{errors[name].message}</span>}
  </div>
);

const SelectField = ({ name, label, register, errors, children }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-1.5 font-medium text-text-muted">{label}</label>
    <select
      id={name}
      {...register(name)}
      className="w-full pl-4 pr-10 py-2.5 rounded-lg font-secondary bg-bg-app border border-border-default focus:ring-2 focus:ring-border-hover focus:border-border-focus outline-none transition-all duration-300 appearance-none bg-no-repeat bg-right"
      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em' }}
    >
      {children}
    </select>
    {errors[name] && <span className="text-danger-text text-sm mt-1">{errors[name].message}</span>}
  </div>
);

const CheckboxGrid = ({ title, options, control, errors }) => (
  <div className="md:col-span-2">
    <h3 className="mb-3 font-medium text-text-muted">{title}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 rounded-lg bg-bg-surface-alt border border-border-default">
      {options.map(({ name, label }) => (
        <Controller
          key={name}
          name={name}
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2 text-text-default cursor-pointer">
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              {label}
            </label>
          )}
        />
      ))}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const AddPatientForm = () => {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      // Profile
      full_name: '', email: '', date_of_birth: '', gender: 'female', occupation: '',
      height_cm: '', weight_kg: '', activity_level: 'moderately_active',
      goal: 'lose_weight', diet_type: 'vegetarian', allergies: '',
      is_diabetic: false, is_hypertensive: false, has_heart_condition: false,
      has_thyroid_disorder: false, has_arthritis: false, has_gastric_issues: false,
      other_chronic_condition: '', family_history: '',
      // Lab Report
      report_date: '', lab_weight_kg: '', lab_height_cm: '', waist_circumference_cm: '',
      blood_pressure_systolic: '', blood_pressure_diastolic: '', fasting_blood_sugar: '',
      postprandial_sugar: '', hba1c: '', ldl_cholesterol: '', hdl_cholesterol: '',
      triglycerides: '', crp: '', esr: '', uric_acid: '', creatinine: '', urea: '',
      alt: '', ast: '', vitamin_d3: '', vitamin_b12: '', tsh: '',
    }
  });

  const onSubmit = async (data) => {
    // Helper to convert empty strings from number inputs to null
    const toNullOrNumber = (value) => (value === '' || value === null || isNaN(value)) ? null : Number(value);
    
    // Structure the data for the API
    const payload = {
      profile: {
        full_name: data.full_name,
        email: data.email,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        occupation: data.occupation,
        height_cm: toNullOrNumber(data.height_cm),
        weight_kg: toNullOrNumber(data.weight_kg),
        activity_level: data.activity_level,
        goal: data.goal,
        diet_type: data.diet_type,
        allergies: data.allergies,
        is_diabetic: data.is_diabetic,
        is_hypertensive: data.is_hypertensive,
        has_heart_condition: data.has_heart_condition,
        has_thyroid_disorder: data.has_thyroid_disorder,
        has_arthritis: data.has_arthritis,
        has_gastric_issues: data.has_gastric_issues,
        other_chronic_condition: data.other_chronic_condition,
        family_history: data.family_history,
      },
      latest_lab_report: {
        report_date: data.report_date || null,
        weight_kg: toNullOrNumber(data.lab_weight_kg),
        height_cm: toNullOrNumber(data.lab_height_cm),
        waist_circumference_cm: toNullOrNumber(data.waist_circumference_cm),
        blood_pressure_systolic: toNullOrNumber(data.blood_pressure_systolic),
        blood_pressure_diastolic: toNullOrNumber(data.blood_pressure_diastolic),
        fasting_blood_sugar: toNullOrNumber(data.fasting_blood_sugar),
        postprandial_sugar: toNullOrNumber(data.postprandial_sugar),
        hba1c: toNullOrNumber(data.hba1c),
        ldl_cholesterol: toNullOrNumber(data.ldl_cholesterol),
        hdl_cholesterol: toNullOrNumber(data.hdl_cholesterol),
        triglycerides: toNullOrNumber(data.triglycerides),
        crp: toNullOrNumber(data.crp),
        esr: toNullOrNumber(data.esr),
        uric_acid: toNullOrNumber(data.uric_acid),
        creatinine: toNullOrNumber(data.creatinine),
        urea: toNullOrNumber(data.urea),
        alt: toNullOrNumber(data.alt),
        ast: toNullOrNumber(data.ast),
        vitamin_d3: toNullOrNumber(data.vitamin_d3),
        vitamin_b12: toNullOrNumber(data.vitamin_b12),
        tsh: toNullOrNumber(data.tsh),
      }
    };

    try {
      await createUserPatient(payload);
      toast.success('Patient created successfully!');
      reset(); // Reset form fields on success
    } catch (error) {
      toast.error(error.message || 'Failed to create patient. Please try again.');
    }
  };

  const healthConditions = [
    { name: 'is_diabetic', label: 'Diabetic' },
    { name: 'is_hypertensive', label: 'Hypertensive' },
    { name: 'has_heart_condition', label: 'Heart Condition' },
    { name: 'has_thyroid_disorder', label: 'Thyroid Disorder' },
    { name: 'has_arthritis', label: 'Arthritis' },
    { name: 'has_gastric_issues', label: 'Gastric Issues' },
  ];

  return (
    <div className="min-h-screen bg-bg-app p-4 sm:p-6 md:p-8 animate-fade-in-up">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-primary font-bold text-text-strong">Add New Patient</h1>
          <p className="text-text-default mt-2">Fill in the details below to add a new patient to your roster.</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* --- Profile Information --- */}
          <FormSection title="Patient Profile" icon={<FiUser size={20} />}>
            <InputField name="full_name" label="Full Name" type="text" register={register} errors={errors} placeholder="e.g., Rita Sharma" Icon={FiUser} />
            <InputField name="email" label="Email Address" type="email" register={register} errors={errors} placeholder="e.g., rita@gmail.com" Icon={FiMail} />
            <InputField name="date_of_birth" label="Date of Birth" type="date" register={register} errors={errors} Icon={FiCalendar} />
            <SelectField name="gender" label="Gender" register={register} errors={errors}>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </SelectField>
            <InputField name="occupation" label="Occupation" type="text" register={register} errors={errors} placeholder="e.g., Bank Manager" Icon={FiBriefcase} />
          </FormSection>

          {/* --- Physical Metrics & Goals --- */}
          <FormSection title="Physical Metrics & Goals" icon={<FiBarChart2 size={20} />}>
            <InputField name="height_cm" label="Height (cm)" type="number" register={register} errors={errors} placeholder="e.g., 165" />
            <InputField name="weight_kg" label="Weight (kg)" type="number" register={register} errors={errors} placeholder="e.g., 77" />
            <SelectField name="activity_level" label="Activity Level" register={register} errors={errors}>
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly Active</option>
              <option value="moderately_active">Moderately Active</option>
              <option value="very_active">Very Active</option>
            </SelectField>
            <SelectField name="goal" label="Primary Goal" register={register} errors={errors}>
              <option value="lose_weight">Lose Weight</option>
              <option value="maintain_weight">Maintain Weight</option>
              <option value="gain_weight">Gain Weight</option>
              <option value="improve_health">General Health Improvement</option>
            </SelectField>
            <SelectField name="diet_type" label="Dietary Preference" register={register} errors={errors}>
              <option value="vegetarian">Vegetarian</option>
              <option value="non_vegetarian">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="eggetarian">Eggetarian</option>
            </SelectField>
          </FormSection>

          {/* --- Health Profile --- */}
          <FormSection title="Health Profile" icon={<FiHeart size={20} />}>
            <div className="md:col-span-2">
              <InputField name="allergies" label="Allergies (comma-separated)" type="text" register={register} errors={errors} placeholder="e.g., Peanuts, Shellfish" />
            </div>
            <CheckboxGrid title="Existing Health Conditions" options={healthConditions} control={control} errors={errors} />
            <div className="md:col-span-2">
              <InputField name="other_chronic_condition" label="Other Chronic Conditions" type="text" register={register} errors={errors} placeholder="Specify if any" />
            </div>
            <div className="md:col-span-2">
              <InputField name="family_history" label="Significant Family Medical History" type="text" register={register} errors={errors} placeholder="e.g., Father has Type 2 Diabetes" />
            </div>
          </FormSection>
          
          {/* --- Initial Lab Report --- */}
          <FormSection title="Initial Lab Report (Optional)" icon={<FiFileText size={20} />}>
            <InputField name="report_date" label="Report Date" type="date" register={register} errors={errors} />
            <InputField name="lab_weight_kg" label="Weight on Report (kg)" type="number" register={register} errors={errors} placeholder="e.g., 61" />
            <InputField name="lab_height_cm" label="Height on Report (cm)" type="number" register={register} errors={errors} placeholder="e.g., 158" />
            <InputField name="waist_circumference_cm" label="Waist (cm)" type="number" register={register} errors={errors} placeholder="e.g., 33" />
            <InputField name="blood_pressure_systolic" label="BP Systolic (mmHg)" type="number" register={register} errors={errors} placeholder="e.g., 122" />
            <InputField name="blood_pressure_diastolic" label="BP Diastolic (mmHg)" type="number" register={register} errors={errors} placeholder="e.g., 80" />
            <InputField name="fasting_blood_sugar" label="Fasting Sugar (mg/dL)" type="number" register={register} errors={errors} placeholder="e.g., 122" />
            <InputField name="postprandial_sugar" label="Postprandial Sugar (mg/dL)" type="number" register={register} errors={errors} placeholder="e.g., 140" />
            <InputField name="hba1c" label="HbA1c (%)" type="number" register={register} errors={errors} placeholder="e.g., 6.5" />
            <InputField name="ldl_cholesterol" label="LDL Cholesterol (mg/dL)" type="number" register={register} errors={errors} placeholder="e.g., 130" />
            <InputField name="hdl_cholesterol" label="HDL Cholesterol (mg/dL)" type="number" register={register} errors={errors} placeholder="e.g., 50" />
            <InputField name="triglycerides" label="Triglycerides (mg/dL)" type="number" register={register} errors={errors} placeholder="e.g., 150" />
            <InputField name="crp" label="CRP (mg/L)" type="number" register={register} errors={errors} placeholder="e.g., 3.0" />
            <InputField name="esr" label="ESR (mm/hr)" type="number" register={register} errors={errors} placeholder="e.g., 15" />
            <InputField name="uric_acid" label="Uric Acid (mg/dL)" type="number" register={register} errors={errors} placeholder="e.g., 6.0" />
            <InputField name="creatinine" label="Creatinine (mg/dL)" type="number" register={register} errors={errors} placeholder="e.g., 0.9" />
            <InputField name="urea" label="Urea (mg/dL)" type="number" register={register} errors={errors} placeholder="e.g., 30" />
            <InputField name="alt" label="ALT (U/L)" type="number" register={register} errors={errors} placeholder="e.g., 25" />
            <InputField name="ast" label="AST (U/L)" type="number" register={register} errors={errors} placeholder="e.g., 25" />
            <InputField name="vitamin_d3" label="Vitamin D3 (ng/mL)" type="number" register={register} errors={errors} placeholder="e.g., 30" />
            <InputField name="vitamin_b12" label="Vitamin B12 (pg/mL)" type="number" register={register} errors={errors} placeholder="e.g., 400" />
            <InputField name="tsh" label="TSH (μIU/mL)" type="number" register={register} errors={errors} placeholder="e.g., 2.5" />
          </FormSection>
          
          {/* --- Form Submission --- */}
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5 rounded-xl bg-primary text-text-on-primary font-semibold font-primary hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/40 transition-all duration-300 disabled:bg-opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>Creating Patient...</span>
                </>
              ) : (
                <>
                  <FiPlus />
                  <span>Create Patient</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientForm;