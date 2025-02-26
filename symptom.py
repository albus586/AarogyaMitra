# Disease-symptom mapping
diseases = {
    "Diabetes": [
        "fatigue",
        "frequent urination",
        "excessive thirst",
        "blurred vision",
        "unexplained weight loss",
        "slow-healing sores"
    ],
    "Hypertension": [
        "headache",
        "dizziness",
        "blurred vision",
        "shortness of breath",
        "chest pain",
        "nosebleeds"
    ],
    "Heart Disease": [
        "chest pain",
        "shortness of breath",
        "fatigue",
        "irregular heartbeat",
        "swelling in legs",
        "dizziness"
    ],
    "Eye Disease": [
        "blurred vision",
        "eye pain",
        "sensitivity to light",
        "double vision",
        "loss of peripheral vision",
        "seeing halos around lights"
    ],
    "Brain Tumor": [
        "headache",
        "nausea",
        "fatigue",
        "vision problems",
        "memory problems",
        "seizures"
    ],
    "Pneumonia": [
        "cough",
        "fever",
        "shortness of breath",
        "fatigue",
        "chest pain",
        "nausea"
    ],
    "Normal": []
}

# List to store patient's "Yes" responses
answer = []

# Function to predict the disease dynamically
def predict_disease():
    possible_diseases = set(diseases.keys())  # Start with all diseases as possible
    asked_symptoms = set()  # Keep track of asked symptoms
    max_questions = 5

    for _ in range(max_questions):
        # Identify remaining symptoms in possible diseases
        remaining_symptoms = set(
            symptom for disease in possible_diseases for symptom in diseases[disease]
        ) - asked_symptoms

        # Stop if no symptoms remain or only one disease is left
        if not remaining_symptoms or len(possible_diseases) == 1:
            break

        # Select the most common symptom in remaining diseases
        symptom_counts = {symptom: 0 for symptom in remaining_symptoms}
        for disease in possible_diseases:
            for symptom in diseases[disease]:
                if symptom in remaining_symptoms:
                    symptom_counts[symptom] += 1

        # Pick the symptom that appears most frequently in possible diseases
        most_common_symptom = max(symptom_counts, key=symptom_counts.get)

        # Ask the user about the most common symptom
        user_input = input(f"Do you experience {most_common_symptom}? (Yes/No): ").strip().lower()
        asked_symptoms.add(most_common_symptom)

        if user_input == "yes":
            answer.append(most_common_symptom)
            # Keep only diseases that have this symptom
            possible_diseases = {d for d in possible_diseases if most_common_symptom in diseases[d]}
        elif user_input == "no":
            # Eliminate diseases that have this symptom
            possible_diseases = {d for d in possible_diseases if most_common_symptom not in diseases[d]}

    # Return the predicted disease
    return list(possible_diseases)[0] if possible_diseases else "Normal"

# Predict the disease based on answers
predicted_disease = predict_disease()

# Print the patient's answers
print("\nYour reported symptoms:", answer)

# Print the predicted disease
print(f"\nBased on your symptoms, you might have: {predicted_disease}")

# Follow-up steps
follow_up_steps = {
    "Diabetes": [
        "Consult a doctor for a blood sugar test.",
        "Monitor your diet and reduce sugar intake.",
        "Exercise regularly and maintain a healthy weight."
    ],
    "Hypertension": [
        "Check your blood pressure regularly.",
        "Reduce salt intake and avoid processed foods.",
        "Consult a doctor for medication if needed."
    ],
    "Heart Disease": [
        "Seek immediate medical attention if you have chest pain.",
        "Adopt a heart-healthy diet (low fat, low cholesterol).",
        "Exercise regularly and avoid smoking."
    ],
    "Eye Disease": [
        "Visit an ophthalmologist for a comprehensive eye exam.",
        "Avoid straining your eyes and use protective eyewear.",
        "Follow prescribed treatments for any diagnosed condition."
    ],
    "Brain Tumor": [
        "Consult a neurologist immediately for further evaluation.",
        "Undergo imaging tests like MRI or CT scan.",
        "Follow the treatment plan recommended by your doctor."
    ],
    "Pneumonia": [
        "Seek medical attention for antibiotics or antiviral treatment.",
        "Rest and stay hydrated.",
        "Monitor your temperature and seek emergency care if symptoms worsen."
    ],
    "Normal": [
        "No specific disease detected. Maintain a healthy lifestyle.",
        "If symptoms persist, consult a doctor for further evaluation."
    ]
}

# Print follow-up steps
print("\nFollow-up steps you should take:")
for step in follow_up_steps[predicted_disease]:
    print(f"- {step}")
