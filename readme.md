# Push2Prod

Push2Prod is a deployment tool designed to deploy React projects similar to Vercel. It is built using React.js, Node.js, AWS, Docker, Redis, S3, and Postgres.

## Features

- **Deployment:** Easily deploy React projects to production environments.
- **Scalability:** Built on AWS infrastructure for scalability.
- **Containerization:** Uses Docker for containerization, ensuring consistency across environments.
- **Data Storage:** Utilizes AWS S3 for storing project assets and Postgres for database management.
- **Caching:** Implements Redis for caching to improve performance.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/thealonemusk/Push2Prod.git
   ```

2. Install dependencies:

   ```bash
   cd Push2Prod
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the root directory.
   - Add the following variables and replace the values with your own:

     ```plaintext
     AWS_ACCESS_KEY_ID=your_aws_access_key_id
     AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
     AWS_REGION=your_aws_region
     REDIS_URL=your_redis_url
     DATABASE_URL=your_postgres_database_url
     ```

4. Start the application:

   ```bash
   npm start
   ```

## Usage

1. Access the Push2Prod dashboard by navigating to `http://localhost:3000` in your web browser.
2. Log in with your credentials.
3. Follow the on-screen instructions to deploy your React project.

## Contributing

We welcome contributions to Push2Prod! To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/my-feature`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add my feature'`).
5. Push to the branch (`git push origin feature/my-feature`).
6. Create a new Pull Request.
