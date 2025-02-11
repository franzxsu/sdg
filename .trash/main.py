import os
import io
import re
import pytesseract
import PyPDF2
import numpy as np
from PIL import Image
import cv2

def clean_text(text):
    characters_to_remove = "!()@—*\">+-/,'|£#%$&^_~"
    
    # Remove specified characters
    for char in characters_to_remove:
        text = text.replace(char, '')
    
    # Remove newlines and replace with space
    # text = text.replace('\n', ' ')
    
    # Remove double spaces and tabs
    # text = re.sub(r'\s+', ' ', text)
    
    # Strip leading/trailing whitespace
    return text.strip()

# def preprocess_image(image):
#     """
#     Enhanced image preprocessing for better OCR
#     """
#     # Convert to grayscale
#     gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
    
#     # Apply adaptive thresholding
#     thresh = cv2.adaptiveThreshold(
#         gray, 255, 
#         cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
#         cv2.THRESH_BINARY, 11, 2
#     )
    
#     # Denoise
#     denoised = cv2.fastNlMeansDenoising(thresh)
    
#     return denoised

def extract_text_from_pdf(pdf_path):
    extracted_data = {
        'document_text': '',
        'image_text': ''
    }
    
    # Extract document text
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                extracted_data['document_text'] += page.extract_text() + ' '
        
        # Clean document text
        extracted_data['document_text'] = clean_text(extracted_data['document_text'])
    except Exception as e:
        print(f"Document text extraction error: {e}")
    
    # Extract image text
    try:
        images = extract_images_from_pdf(pdf_path)
        
        for img in images:
            # grayscale
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
            
            # Enhance
            threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
            
            # Extract text
            image_text = pytesseract.image_to_string(threshold)
            
            # Clean image text
            image_text = clean_text(image_text)
            
            if image_text.strip():
                extracted_data['image_text'] += image_text + '\n'
    
    except Exception as e:
        print(f"Image text extraction error: {e}")
    
    # Final cleaning
    extracted_data['image_text'] = clean_text(extracted_data['image_text'])
    
    return extracted_data

def extract_images_from_pdf(pdf_path):
    extracted_images = []
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                
                if '/XObject' in page['/Resources']:
                    xObject = page['/Resources']['/XObject'].get_object()
                    
                    for obj in xObject:
                        if xObject[obj]['/Subtype'] == '/Image':
                            try:
                                img_data = xObject[obj].get_data()
                                
                                image_formats = [
                                    lambda d: Image.open(io.BytesIO(d)),
                                    lambda d: Image.frombytes('RGB', 
                                        (xObject[obj]['/Width'], xObject[obj]['/Height']), 
                                        d)
                                ]
                                
                                for img_opener in image_formats:
                                    try:
                                        image = img_opener(img_data)
                                        extracted_images.append(image)
                                        break
                                    except Exception:
                                        continue
                            
                            except Exception as img_err:
                                print(f"Image extraction error: {img_err}")
    
    except Exception as e:
        print(f"PDF image extraction error: {e}")
    
    return extracted_images

def main(pdf_path):
    """Main function to extract text from PDF."""
    # Validate file exists
    if not os.path.exists(pdf_path):
        print("File not found. Please check the path.")
        return None
    
    # Extract text
    results = extract_text_from_pdf(pdf_path)
    
    return results


def save_extracted_text(output_path, document_text, image_text):
    try:
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write("--- Document Text ---\n")
            file.write(document_text + "\n\n")
            file.write("--- Image Text ---\n")
            file.write(image_text + "\n")
    except Exception as e:
        print(f"Error saving text to file: {e}")

def process_pdfs_in_folder(folder_path, output_folder):
    """
    Process all PDFs in a folder and save extracted text to output folder.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    for file_name in os.listdir(folder_path):
        if file_name.lower().endswith('.pdf'):
            pdf_path = os.path.join(folder_path, file_name)
            print(f"Processing: {pdf_path}")
            
            # Extract text
            results = main(pdf_path)
            
            # Save extracted text to a .txt file
            output_file_name = f"{os.path.splitext(file_name)[0]}.txt"
            output_path = os.path.join(output_folder, output_file_name)
            save_extracted_text(output_path, results['document_text'], results['image_text'])

if __name__ == "__main__":
    input_folder = "input_pdfs"
    output_folder = "output_texts"
    
    #save extracted pdf in folder
    process_pdfs_in_folder(input_folder, output_folder)
    print(f"text saved in '{output_folder}' folder")