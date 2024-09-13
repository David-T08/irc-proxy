import { EventEmitter } from 'events';
import { Client } from 'matrix-org-irc';

type Message = {
	args: string[];
	prefix: string;
	nick?: string;
	user?: string;
	host?: string;
	server?: string;
	command: any;
	rawCommand: string;
	commandType: any;
}

interface ServerConfig {
	secure: boolean;

	host: string;
	port: number;

	orgIP: string,
	maxTimeoutMS: number;
}

interface UserConfig {
	nick: string;
	name: string;
	real: string;

	// The recieved events to send back to the client
	// Cleared when read
	output: Message[],
	input: string[],

	debugging: boolean,

	client: Client
}

class User {
	public readonly name: string;
	public readonly real: string;

	private nick: string;
	private client: Client;

	private readonly debugging: boolean;

	private output: any[];
	private input: string[];

	constructor(name: string, nick: string, server: ServerConfig) {
		this.nick = nick
		this.name = name
		this.real = "Roblox IRC Client"

		// Allow for extra information when disconnecting n whatnot
		this.debugging = server.host == "irc.beenman.com"

		const client = new Client(server.host, nick, {
			channels: (this.debugging) ? ["#welcome"] : [],

			port: server.port,
			secure: server.secure,
		})

		const output: any[] = []

		client.addListener("raw", (message) => {
			output.push(message)
		})

		this.input = []
		this.client = client
		this.output = output
	}

	getOutput(): any[] {
		const copy = [...this.output]

		this.output = []
		return copy
	}

	getClient(): Client { return this.client }

	disconnect(reason: string | undefined) {
	}
}

export class Server extends EventEmitter {
	private readonly server: ServerConfig

	private users: Map<string, User>
	private timeout: NodeJS.Timeout | undefined

	constructor(server: string, port: number, secure: boolean | undefined, orgIP: string, maxTimeoutMS: number) {
		super()

		this.server = {
			secure: secure || false,

			host: server,
			port: port,

			orgIP: orgIP,
			maxTimeoutMS: maxTimeoutMS
		}

		this.users = new Map()
		this.refreshTimeout()
	}

	refreshTimeout() {
		console.log("new timeout")
		if (this.timeout) {
			clearTimeout(this.timeout)
		}

		this.timeout = setTimeout(() => {
			this.users.forEach((user, name) => {
				user.getClient().disconnect()
			})

			this.users.clear()

			this.emit("timeout", "Timed out.")
			console.log(`${this.server.orgIP} timed out.`)
		}, this.server.maxTimeoutMS)
	}

	getUsers(): Map<string, User> {
		return this.users
	}

	getServer(): ServerConfig {
		return this.server
	}

	addUser(name: string, nick: string) {
		if (this.users.has(name)) {
			throw new Error(`User "${name}" already exists.`);
		}

		this.users.set(name, new User(name, nick, this.server));
	}

	updateChannelList() {

	}
}