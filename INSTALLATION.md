## Fork the Repository
Before starting the installation process, **fork the repository** to your GitHub account by clicking the "Fork" button at the top right of the repository page.

## Installation
To set up the project locally, follow these steps:

1. **Clone the forked repository**:
    
    ```bash
    git clone https://github.com/yourusername/CampX.git
    cd CampX
    ```


2. **Install the necessary dependencies**:

    ```bash
    npm install
    ```

3. **Set up environment variables**:

    Create a `.env` file in the root directory with the following variables:
    ```env
    DB_URL=your_mongo_atlas_url
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_KEY=your_cloudinary_api_key
    CLOUDINARY_SECRET=your_cloudinary_api_secret
    MAPBOX_TOKEN=your_mapbox_token
    ```

4. **Start the server**:
    ```bash
    node app.js
    ```

5. **View the app**:
   Open your browser and navigate to `http://localhost:3000` to view the app.

