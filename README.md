# Pluteo
## Personal Library Manager

### About

Pluteo is a free Open Source Personal Library Manager created using .NET 9 and React.

This project aims to provide a simple tool for people to manage their books, upload Ebook files, add personal notes, control the reading queue, obtain personal statistics and more.

### Authors and Maintainers

Adrià Alberich Jaume - alberichjaumeadria@gmail.com

### How to install

#### Requirements

- `.NET 9` or above.
- `Node.js` and `npm` package manager.
- `Docker` and `Docker Compose`.
- `Mailgun` account with at least the developer tier.
- `MongoDB Compass` to later connect with the database.

#### Installation steps

- Clone the repository.
- Go to `backend/PluteoInfrastructure/appsettings.json` and configure at your liking (do not use the json below as it contains explanatory comments).

```json
{
  "ApplicationSettings": {
    "ApplicationName": "Pluteo",
    "ApplicationVersion": "1.0.0",
    // Frontend application URL
    "ApplicationUrl": "http://localhost:5173",
    // Default language for the user
    "DefaultLocale": "ca",
    // Replace this with a valid 32 key
    "JwtKey": "e3b0c44298fc1c149afbf4c8996fb924",
    // Default session duration (24h)
    "AccessTokenExpireMinutes": 1440,
    // Cipher iterations, change this to invalidate all passwords and force a global password reset (in case of a security breach)
    "PasswordIterations": 100000,
    // Maximum password length
    "PasswordLimit": 32,
    // Password validation regex pattern
    "PasswordPattern": "^(?=.*[A-Z])(?=.*\\d).{8,32}$",
    // Maximum email length
    "EmailLimit": 32,
    // Email validation regex pattern
    "EmailPattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
    // Max notifications that the user can have at a time
    "UserMaxNotifications": 10,
    // Default value for user setting NotifyByEmail
    "DefaultNotifyByEmail": true,
    // Default value for user setting NotifyLoan
    "DefaultNotifyLoan": true,
    // Default value for user setting NotifyLoanBeforeDays
    "DefaultNotifyLoanBeforeDays": 7,
    // Default value for user setting NotifyLoanBeforeDaysFrequency
    "DefaultNotifyLoanBeforeDaysFrequency": 1,
    // Limits for the user settings
    "MinNotifyLoanBeforeDays": 1,
    "MaxNotifyLoanBeforeDays": 30,
    "MinNotifyLoanBeforeDaysFrequency": 1,
    "MaxNotifyLoanBeforeDaysFrequency": 30,
    // Default shelf and read queue names (note that these are localizen in the frontend)
    "DefaultShelfName": "shelf_default",
    "DefaultReadQueueName": "shelf_read_queue",
    // Loan notification job delay in seconds (default once an hour)
    "LoanNotificationJobDelay": 3600
  },
  // MongoDB database settings (only change this if you're deploying outside Docker)
  "DatabaseSettings": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "Pluteo",
    "UserCollectionName": "Users",
    "BookCollectionName": "Books"
  },
  // Mailgun API settings
  "EmailSettings": {
    // Local directory for the HTML email templates
    "EmailTemplatesDir": "EmailTemplates",
    // Base Mailgun API URI
    "EmailBaseUri": "https://api.mailgun.net/v3",
    // Your Mailgun API Key
    "EmailAPIKey": "",
    // Your Mailgun sandbox domain (or custom domain)
    "EmailDomain": "",
    // From field for the emails (name and email)
    "EmailFromName": "Pluteo",
    "EmailFromEmail": "pluteo@pluteo.com"
  },
  // Open Library API (no need to touch this)
  "OpenLibrarySettings": {
    "ApiUrl": "https://openlibrary.org",
    "CoverApiUrl": "https://covers.openlibrary.org"
  },
  "AllowedHosts": "*"
}

```

- Open a terminal and cd to repository root dir.
- Launch the application using `docker-compose up --build`
- Access the application at `http://localhost:5173` by default.

Docker Compose will build and launch 3 containers, one for the backend, one for the frontend under nginx and another one for the MongoDB database.

Note that the current setup is not recommended for production deployment.

### How to contribute

Feel free to push a PR, open an issue, or fork the project if you want to use this project as the basis for your own.

### License

The MIT License (MIT)

Copyright (c) 2025 Adrià Alberich Jaume

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.