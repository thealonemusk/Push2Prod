/**
 * Build and Deployment Script
 * 
 * This script handles the build process and deployment of the application to Azure Blob Storage.
 * It performs the following operations:
 * 1. Builds the application using npm
 * 2. Uploads the built files to Azure Blob Storage
 * 3. Publishes build logs to Redis for real-time monitoring
 * 
 * Required Environment Variables:
 * - PROJECT_ID: The identifier for the current project
 * - AZURE_STORAGE_CONNECTION_STRING: Azure Blob Storage connection string
 * - REDIS_URL: Redis connection URL
 */

const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')
const Redis = require('ioredis')

// Validate required environment variables
const requiredEnvVars = ['PROJECT_ID', 'AZURE_STORAGE_CONNECTION_STRING', 'REDIS_URL']
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: ${envVar} environment variable is required`)
        process.exit(1)
    }
}

// Redis client for publishing build logs
const publisher = new Redis(process.env.REDIS_URL)

// Azure Blob Storage configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
const containerClient = blobServiceClient.getContainerClient('push2prod-outputs')

// Project identifier from environment variables
const PROJECT_ID = process.env.PROJECT_ID


function publishLog(log) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }))
}

async function init() {
    console.log('Executing script.js')
    publishLog('Build Started...')
    const outDirPath = path.join(__dirname, 'output')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data', function (data) {
        console.log(data.toString())
        publishLog(data.toString())
    })

    p.stdout.on('error', function (data) {
        console.log('Error', data.toString())
        publishLog(`error: ${data.toString()}`)
    })

    p.on('close', async function () {
        console.log('Build Complete')
        publishLog(`Build Complete`)
        const distFolderPath = path.join(__dirname, 'output', 'dist')
        const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })

        publishLog(`Starting to upload`)
        for (const file of distFolderContents) {
            const filePath = path.join(distFolderPath, file)
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log('uploading', filePath)
            publishLog(`uploading ${file}`)

            const command = new PutObjectCommand({
                Bucket: 'push2prod-outputs',
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            })
            await s3Client.send(command)
            publishLog(`uploaded ${file}`)
            console.log('uploaded', filePath)
        }
        publishLog(`Done`)
        console.log('Done...')
    })
}
init()