from flask import Flask, request, jsonify
from transformers import pipeline, AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
from torchvision import transforms
from flask_cors import CORS  # Add this import
import requests  # Add this import

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Add this line to enable CORS

# Pneumonia classifier
pneumonia_classifier = pipeline(model="lxyuan/vit-xray-pneumonia-classification")

# Eye disease CNN model
class CNN(torch.nn.Module):
    def __init__(self, NUMBER_OF_CLASSES):
        super(CNN, self).__init__()
        self.conv_layers = torch.nn.Sequential(
            torch.nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, stride=2),
            torch.nn.BatchNorm2d(16),
            torch.nn.LeakyReLU(),
            torch.nn.MaxPool2d(kernel_size=2, stride=2),
            torch.nn.Conv2d(in_channels=16, out_channels=32, kernel_size=3, stride=2),
            torch.nn.BatchNorm2d(32),
            torch.nn.LeakyReLU(),
            torch.nn.MaxPool2d(kernel_size=2, stride=2),
            torch.nn.Conv2d(in_channels=32, out_channels=64, kernel_size=3, stride=2),
            torch.nn.BatchNorm2d(64),
            torch.nn.LeakyReLU(),
            torch.nn.MaxPool2d(kernel_size=2, stride=2),
        )
        self.dense_layers = torch.nn.Sequential(
            torch.nn.Dropout(0.2),
            torch.nn.Linear(64 * 3 * 3, 128),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.2),
            torch.nn.Linear(128, NUMBER_OF_CLASSES),
        )

    def forward(self, x):
        x = self.conv_layers(x)
        x = x.view(x.size(0), -1)
        x = self.dense_layers(x)
        return x

NUMBER_OF_CLASSES = 4
eye_disease_model = CNN(NUMBER_OF_CLASSES)
model_path = "eye_disease_model.pth"  # Update the path
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
eye_disease_model.load_state_dict(torch.load(model_path, map_location=device))
eye_disease_model = eye_disease_model.to(device)
eye_disease_model.eval()

# Brain tumor detection model
brain_tumor_processor = AutoImageProcessor.from_pretrained("ShimaGh/Brain-Tumor-Detection")
brain_tumor_model = AutoModelForImageClassification.from_pretrained("ShimaGh/Brain-Tumor-Detection")
brain_tumor_label_map = {0: "No Tumor", 1: "Tumor Detected"}

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the Medical Image Classifier API."})

def save_prediction_to_db(disease_name, prediction, confidence):
    api_url = "http://localhost:3000/api/lab-tests"
    data = {
        "diseaseId": disease_name,
        "answers": {},  # You can add any additional data here
        "riskScore": confidence
    }
    response = requests.post(api_url, json=data)
    return response.status_code == 200

@app.route('/pneumonia', methods=['POST'])
def classify_pneumonia():
    try:
        file = request.files['image']
        image = Image.open(file)

        # Pneumonia classification
        result = pneumonia_classifier(image)
        label = result[0]['label']
        confidence = int(result[0]['score'] * 100)

        save_prediction_to_db("Pneumonia", label, confidence)

        return jsonify({
            "prediction": label,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/eye', methods=['POST'])
def classify_eye_disease():
    try:
        file = request.files['image']
        image = Image.open(file)

        # Eye disease classification
        preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        input_tensor = preprocess(image).unsqueeze(0).to(device)

        with torch.no_grad():
            output = eye_disease_model(input_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            confidence, predicted = torch.max(probabilities, 1)

        eye_labels = ["Normal", "Diabetic Retinopathy", "Cataract", "Glaucoma"]
        label = eye_labels[predicted.item()]
        confidence = int(confidence.item() * 100)

        save_prediction_to_db("Eye Disease", label, confidence)

        return jsonify({
            "prediction": label,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/brain', methods=['POST'])
def classify_brain_tumor():
    try:
        file = request.files['image']
        image = Image.open(file)

        # Brain tumor classification
        inputs = brain_tumor_processor(images=image, return_tensors="pt")
        outputs = brain_tumor_model(**inputs)
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=1)
        confidence, predicted = torch.max(probabilities, 1)

        label = brain_tumor_label_map.get(predicted.item(), "Unknown")
        confidence = int(confidence.item() * 100)

        save_prediction_to_db("Brain Tumor", label, confidence)

        return jsonify({
            "prediction": label,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Update the port to 5001
