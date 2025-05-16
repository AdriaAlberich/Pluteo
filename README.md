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
- Go to `backend/PluteoInfrastructure/appsettings.json` and configure at your liking.
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