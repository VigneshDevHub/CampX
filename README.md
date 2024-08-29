# CampX

## Introduction
**CampX** is a web application designed to help users discover and share campgrounds from around the world. Users can browse through a collection of campgrounds, read reviews, and contribute by adding their own. Each user has control over the campgrounds they add, with the ability to edit or delete them. The platform encourages a community-driven approach to exploring the great outdoors.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Hosted Website](#hosted-website)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)

## Features
- **Global Campground Discovery**: Browse campgrounds from various locations worldwide.
- **User-Generated Content**: Users can add campgrounds and reviews.
- **Edit and Delete Permissions**: Only the original author of a campground can edit or delete their entry.
- **Interactive UI**: Engaging interface built with HTML, CSS, and JavaScript.

## Hosted Website
Visit the live version of CampX here: [CampX Website](https://campx-ztww.onrender.com/)

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Media Storage**: Cloudinary

## Installation
To set up the project locally, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/CampX.git
    cd CampX
    ```

2. Install the necessary dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the root directory with the following variables:
    ```env
    DATABASE_URL=your_mongo_atlas_url
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

4. Start the server:
    ```bash
    npm start
    ```

5. Open your browser and navigate to `http://localhost:3000` to view the app.

## Usage
- **Adding a Campground**: Users can submit new campgrounds by filling out a form with details such as location, description, and uploading images.
- **Reviewing Campgrounds**: Users can add reviews to any campground, sharing their experience and feedback.
- **Editing/Deleting Campgrounds**: Only the user who added a campground can edit or delete it.

## Configuration
The application requires a few configurations to run:

- **MongoDB Atlas**: Set up a cluster and obtain the connection string.
- **Cloudinary**: Create an account to manage image uploads.

Ensure that your environment variables are correctly set in the `.env` file as shown in the [Installation](#installation) section.

## Dependencies
Key dependencies used in the project include:

- [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js.
- [Mongoose](https://mongoosejs.com/) - Elegant MongoDB object modeling for Node.js.
- [Cloudinary](https://cloudinary.com/) - Media management platform for image and video uploads.
- [dotenv](https://www.npmjs.com/package/dotenv) - Module to load environment variables from a `.env` file into `process.env`.

You can view all dependencies in the `package.json` file.

## Contributing
We welcome contributions to CampX! To get started, follow these steps:

1. **Fork the Repository**: Click on the "Fork" button at the top right of this page.
2. **Clone Your Fork**: Clone your forked repository to your local machine.
    ```bash
    git clone https://github.com/Vignesh025/CampX.git
    ```
3. **Create a Branch**: Create a new branch for your feature or bugfix.
    ```bash
    git checkout -b feature/your-feature-name
    ```
4. **Make Your Changes**: Implement your feature or bugfix.
5. **Commit Your Changes**: Write a clear, concise commit message.
    ```bash
    git commit -m "Add feature X"
    ```
6. **Push to Your Fork**: Push your changes to your forked repository.
    ```bash
    git push origin feature/your-feature-name
    ```
7. **Submit a Pull Request**: Open a pull request to the main repository, describing the changes you made.

### Guidelines
- Ensure your code follows the existing style and conventions.
- Include relevant documentation updates.
- Write tests for new features or bugfixes if applicable.

We appreciate your contributions and look forward to working together to improve CampX!

## Contributors
- **Vignesh** - [GitHub Profile](https://github.com/Vignesh025)

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
