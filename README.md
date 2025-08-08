# SixtyFour AI API Tester

A comprehensive Node.js application with a modern web interface to test all SixtyFour AI API endpoints.

## 🚀 Features

- **Complete API Coverage**: Test all SixtyFour AI endpoints:
  - Enrich Company (sync & async)
  - Enrich Lead
  - Find Email
  - Find Phone
  - QA Agent
  - Job Status Monitoring

- **Modern UI**: Clean, responsive interface with:
  - Tabbed navigation
  - Real-time health monitoring
  - Async job tracking
  - JSON result viewer with copy functionality

- **Developer Friendly**: 
  - Environment variable configuration
  - Error handling and validation
  - Automatic job monitoring
  - CORS enabled for development

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SixtyFour AI API key

## 🛠️ Installation

1. **Clone or download the project**
   ```bash
   cd your-project-directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your API key**
   
   Edit the `.env` file and replace `your_api_key_here` with your actual SixtyFour AI API key:
   ```env
   SIXTYFOUR_API_KEY=your_actual_api_key_here
   PORT=3000
   API_BASE_URL=https://api.sixtyfour.ai
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Enrich Company
Test company data enrichment with options to:
- Add target company information (name, address, phone, website)
- Configure custom fields to extract
- Enable people finding with focus prompts
- Run synchronous or asynchronous requests

### Enrich Lead
Enrich individual lead information using:
- Name, email, LinkedIn profile
- Company affiliation
- Custom data extraction fields

### Find Email
Locate email addresses by providing:
- Person's full name
- Company name or domain
- Additional context

### Find Phone
Discover phone numbers using:
- Person's name
- Company information
- Location details

### QA Agent
Ask questions about data with:
- Natural language queries
- Contextual information
- Intelligent responses

### Async Jobs
Monitor long-running tasks:
- View active job status
- Check job progress
- Retrieve completed results
- Automatic status updates

## 🔧 API Endpoints

The application exposes these local endpoints:

- `POST /api/enrich-company` - Enrich company data
- `POST /api/enrich-company-async` - Start async company enrichment
- `POST /api/enrich-lead` - Enrich lead information
- `POST /api/find-email` - Find email addresses
- `POST /api/find-phone` - Find phone numbers
- `POST /api/qa-agent` - Ask questions
- `GET /api/job-status/:taskId` - Check async job status
- `GET /health` - Health check endpoint

## 📁 Project Structure

```
├── server.js          # Express server with API routes
├── package.json       # Dependencies and scripts
├── .env              # Environment variables (API key)
├── README.md         # This file
├── .gitignore        # Git ignore patterns
└── public/           # Frontend static files
    ├── index.html    # Main UI interface
    ├── styles.css    # Styling and responsive design
    └── script.js     # Frontend JavaScript logic
```

## 🌟 Key Features Explained

### Health Monitoring
- Real-time connection status
- API key validation
- Server availability check

### Custom Fields
- Dynamic field addition for company enrichment
- Flexible data extraction configuration
- Type-aware field definitions

### Async Job Management
- Automatic job monitoring
- Status tracking and updates
- Result retrieval and display

### Error Handling
- Comprehensive error messages
- Network failure recovery
- Validation feedback

## 🚨 Troubleshooting

### API Key Issues
- Ensure your API key is correctly set in `.env`
- Check the health status indicator in the UI
- Verify your SixtyFour AI account has sufficient credits

### Connection Problems
- Confirm the server is running on the correct port
- Check firewall settings
- Verify internet connectivity

### Common Errors
- **"API Key Not Configured"**: Update the `.env` file with your actual API key
- **"Rate Limit Exceeded"**: Wait before making additional requests
- **"Invalid Request"**: Check required fields are filled correctly

## 📚 Documentation

- [SixtyFour AI API Documentation](https://docs.sixtyfour.ai)
- [Enrich Company Endpoint](https://docs.sixtyfour.ai/api-reference/endpoint/enrich-company)

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your API key secure and private
- Use environment variables in production
- Consider rate limiting for production deployments

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this testing tool.

## 📄 License

MIT License - feel free to use this project for testing and development purposes.
