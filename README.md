# User Manual Chatbot

A Flask-based chatbot that can analyze user manuals from PDFs or web pages and answer questions about them using OpenAI's GPT models.

## Features

- Upload PDF user manuals and extract text using OCR
- Scrape content from web pages
- Generate FAQs from user manual content
- Interactive chat interface for asking questions
- Follow-up question suggestions

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/liEric123/User-Manual-Guide.git
   cd User-Manual-Guide
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your actual values:
     ```
     OPENAI_API_KEY=your_actual_openai_api_key
     FLASK_SECRET_KEY=your_flask_secret_key
     TESSERACT_CMD=C:/Program Files/Tesseract-OCR/tesseract.exe
     POPPLER_PATH=C:/path/to/your/poppler/bin
     ```

4. **Install required system dependencies**
   - **Tesseract OCR**: Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
   - **Poppler**: Download from [poppler-windows](https://github.com/oschwartz10612/poppler-windows)

5. **Run the application**
   ```bash
   python chatbot.py
   ```

## Usage

1. Open your browser and go to `http://localhost:5000`
2. Upload a PDF user manual or provide a webpage URL
3. Wait for the system to process and generate FAQs
4. Start asking questions about the manual content

## Security Notes

- Never commit your `.env` file to version control
- Keep your OpenAI API key secure and don't share it publicly
- The `.env` file is already included in `.gitignore` for your protection

## Requirements

- Python 3.7+
- OpenAI API key
- Tesseract OCR
- Poppler utilities
- All Python dependencies listed in `requirements.txt`
