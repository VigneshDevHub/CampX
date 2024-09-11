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
Visit the live version of CampX here: [CampX Website](https://campx-f9sv.onrender.com)

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Media Storage**: Cloudinary

## Installation
To set up the project locally, follow the steps mentioned in the [INSTALLATION](INSTALLATION.md) Guide.

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
We welcome contributions to CampX! To get started, follow the guidelines in the [CONTRIBUTING](CONTRIBUTING.md) file.

## Contributors
- **Vignesh** - [GitHub Profile](https://github.com/Vignesh025)

## Code of Conduct

We are committed to fostering a welcoming and inclusive environment for everyone. Please take a moment to review our [Code of Conduct](CODE_OF_CONDUCT.md), which outlines our expectations for participant behavior and how we handle reports of misconduct.

By participating in this project, you agree to abide by our Code of Conduct.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
