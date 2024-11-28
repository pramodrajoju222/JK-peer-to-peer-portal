
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
import matplotlib.pyplot as plt
import os
import json

# Set random seed for reproducibility
tf.random.set_seed(42)

# Define the paths to your dataset
# Update the base_dir to include the mounted drive path
base_dir = '/content/drive/My Drive/Arkansas_fish_dataset'
train_dir = os.path.join(base_dir, 'train')
test_dir = os.path.join(base_dir, 'test')

# Image dimensions and batch size
img_height, img_width = 224, 224
batch_size = 32

# Data augmentation for training
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2,
    validation_split=0.2  # Use 20% of training data for validation
)

# Only rescaling for test
test_datagen = ImageDataGenerator(rescale=1./255)

# Set up generators
train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(img_height, img_width),
    batch_size=batch_size,
    class_mode='categorical',
    subset='training'  # Set as training data
)

validation_generator = train_datagen.flow_from_directory(
    train_dir,  # Same directory as training data
    target_size=(img_height, img_width),
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation'  # Set as validation data
)

test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(img_height, img_width),
    batch_size=batch_size,
    class_mode='categorical'
)

num_classes = len(train_generator.class_indices)

# Create the model
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(img_height, img_width, 3))
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
output = Dense(num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=output)

# Compile the model
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train the model
epochs = 20

history = model.fit(
    train_generator,
    steps_per_epoch=train_generator.samples // batch_size,
    epochs=epochs,
    validation_data=validation_generator,
    validation_steps=validation_generator.samples // batch_size
)

# Plot training history
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()

plt.tight_layout()
plt.show()

# Evaluate on test set
test_loss, test_accuracy = model.evaluate(test_generator)
print(f"Test accuracy: {test_accuracy:.4f}")

# Save the model
model_path = '/content/drive/My Drive/arkansas_fish_model.h5'
model.save(model_path)
print(f"Model saved successfully at {model_path}")

# Save the class indices
class_indices = train_generator.class_indices
class_indices_path = '/content/drive/My Drive/class_indices.json'
with open(class_indices_path, 'w') as f:
    json.dump(class_indices, f)
print(f"Class indices saved successfully at {class_indices_path}")

# Verify saved files
if os.path.exists(model_path):
    print(f"Model file found at {model_path}")
else:
    print(f"Model file not found at {model_path}")

if os.path.exists(class_indices_path):
    print(f"Class indices file found at {class_indices_path}")
else:
    print(f"Class indices file not found at {class_indices_path}")

print("Training completed and files saved successfully.")





import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import numpy as np
import json
import matplotlib.pyplot as plt
from google.colab import files
import io
from PIL import Image

# Load the saved model
model_path = '/content/drive/My Drive/arkansas_fish_model.h5'
model = load_model(model_path)

# Load the class indices
class_indices_path = '/content/drive/My Drive/class_indices.json'
with open(class_indices_path, 'r') as f:
    class_indices = json.load(f)

# Invert the class indices dictionary
class_names = {v: k for k, v in class_indices.items()}

# Function to upload and process the image
def upload_and_process_image():
    uploaded = files.upload()
    image_path = next(iter(uploaded))
    img = Image.open(io.BytesIO(uploaded[image_path]))
    img = img.resize((224, 224))  # Resize to match model input size
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # Normalize
    return img_array, image_path

# Function to predict fish species
def predict_fish_species(model, class_names, img_array):
    predictions = model.predict(img_array)
    predicted_class_index = np.argmax(predictions[0])
    predicted_class = class_names[predicted_class_index]
    confidence = predictions[0][predicted_class_index]
    return predicted_class, confidence

# Main execution flow
img_array, image_name = upload_and_process_image()  # Upload and process image

# Make prediction
predicted_class, confidence = predict_fish_species(model, class_names, img_array)

# Display results
print(f"Image: {image_name}")
print(f"Predicted fish species: {predicted_class}")
print(f"Confidence: {confidence:.2f}")

# Display the image with prediction
plt.imshow(img_array[0])
plt.axis('off')
plt.title(f"Predicted: {predicted_class}\nConfidence: {confidence:.2f}")
plt.show()

import tensorflow as tf
import numpy as np
import json
from PIL import Image
import io

# Load the saved model
model_path = '/content/drive/My Drive/arkansas_fish_model.h5'
model = tf.keras.models.load_model(model_path)

# Convert the model to TensorFlow Lite format
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save the TensorFlow Lite model
tflite_model_path = '/content/drive/My Drive/arkansas_fish_model.tflite'
with open(tflite_model_path, 'wb') as f:
    f.write(tflite_model)
print(f"TensorFlow Lite model saved to: {tflite_model_path}")

# Load the class indices
class_indices_path = '/content/drive/My Drive/class_indices.json'
with open(class_indices_path, 'r') as f:
    class_indices = json.load(f)

# Invert the class indices dictionary
class_names = {v: k for k, v in class_indices.items()}

# Function to preprocess the image
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes))
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0
    return img_array

# Function to perform inference using TensorFlow Lite
def tflite_predict(tflite_model, image):
    # Load TFLite model and allocate tensors
    interpreter = tf.lite.Interpreter(model_content=tflite_model)
    interpreter.allocate_tensors()

    # Get input and output tensors
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    # Set the input tensor
    interpreter.set_tensor(input_details[0]['index'], image)

    # Run inference
    interpreter.invoke()

    # Get the output tensor
    predictions = interpreter.get_tensor(output_details[0]['index'])

    return predictions

# Example usage (for testing in Colab)
from google.colab import files

# Upload an image
uploaded = files.upload()
image_path = next(iter(uploaded))
with open(image_path, 'rb') as f:
    image_bytes = f.read()

# Preprocess the image
processed_image = preprocess_image(image_bytes)

# Perform inference
predictions = tflite_predict(tflite_model, processed_image)

# Get the predicted class
predicted_class_index = np.argmax(predictions[0])
predicted_class = class_names[predicted_class_index]
confidence = predictions[0][predicted_class_index]

print(f"Predicted fish species: {predicted_class}")
print(f"Confidence: {confidence:.2f}")