import 'dotenv/config'

import { Server } from "./server"

import express, { Request, Response } from 'express';
import { query, validationResult } from 'express-validator';

const app = express()
const port = process.env.PORT || 7050

const servers: Map<string, Server> = new Map()
const CONNECTION_TIMEOUT_MS = 5 * 1000

app.set('trust proxy', true);

// Authentication Check
app.use((req, res, next) => {
	const authHeader = req.headers['x-auth-token'];

	if (!authHeader || authHeader !== process.env["token"]) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	next();
});

// Connection Timeout
app.use((req, res, next) => {
	const ip = req.ip! // the ! means it WILL be a string
	const IRCServer = servers.get(ip)

	if (IRCServer) {
		IRCServer.refreshTimeout()
	}

	next()
})

app.get("/connect",
	[
		query('host').isString().notEmpty().withMessage('host is required'),
		query('port').isInt({ min: 1, max: 65535 }).withMessage('Port must be a number between 1 and 65535'),
		query("secure").optional().isBoolean().withMessage("Secure must be a boolean")
	],
	(req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const ip = req.ip!
		if (servers.get(ip)) {
			res.status(409).json({
				errors: {}
			})
			return
		}
		const { host, port, secure } = req.query as unknown as {
			host: string;
			port: string;
			secure: boolean | undefined;
		}

		const IRCServer = new Server(host, parseInt(port), secure, ip, CONNECTION_TIMEOUT_MS)
		servers.set(ip, IRCServer)
		
		res.status(200).json({ip: ip, server: IRCServer.getServer()})
	}
);

app.get("/status", (req, res) => {
	const ip = req.ip!
	const IRCServer = servers.get(ip)

	if (!IRCServer) {
		res.status(404).json({
			message: "Not connected to any servers!"
		})

		return
	}

	res.json({
		ip: req.ip,
		
		users: IRCServer.getUsers(),
		server: IRCServer.getServer(),
	})
})

app.listen(port, () => {
	console.log(`Hosting irc-proxy on port ${port}`)
})