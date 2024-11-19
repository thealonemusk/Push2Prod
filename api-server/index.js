const express = require('express');
const cors = require('cors');
const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const app = express();
const PORT = 9000;

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
    credentials: true, 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));

app.use(express.json());

const subscriber = new Redis('');


const io = new Server({
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});

io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel);
        socket.emit('message', `Joined ${channel}`);
    });
});

io.listen(9002, () => console.log('Socket Server 9002'));

const ecsClient = new ECSClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
});

const config = {
    CLUSTER: '',
    TASK: ''
};

app.post('/project', async (req, res) => {
    const { gitURL, slug } = req.body;
    const projectSlug = slug ? slug : generateSlug();

    // Spin the container
    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: ['', '', ''],
                securityGroups: ['']
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: 'builder-image',
                    environment: [
                        { name: 'GIT_REPOSITORY__URL', value: gitURL },
                        { name: 'PROJECT_ID', value: projectSlug }
                    ]
                }
            ]
        }
    });

    await ecsClient.send(command);

    return res.json({ 
        status: 'queued', 
        data: { 
            projectSlug, 
            url: `http://${projectSlug}.localhost:8000` 
        } 
    });
});

async function initRedisSubscribe() {
    console.log('Subscribed to logs....');
    subscriber.psubscribe('logs:*');
    subscriber.on('pmessage', (pattern, channel, message) => {
        io.to(channel).emit('message', message);
    });
}

initRedisSubscribe();

app.listen(PORT, () => console.log(`API Server Running..${PORT}`));