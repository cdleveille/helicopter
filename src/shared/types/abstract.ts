export interface IScore {
	player: string;
	score: number;
}

// export interface ISocket extends ISocketBroadcast {
// 	id: string;
// 	connected: boolean;
// 	disconnected: boolean;
// 	connect: (params: ISocketParams) => ISocket;
// 	on: (listener: string, callback: (...params: any[]) => any) => void;
// 	broadcast: ISocketBroadcast;
// }

// interface ISocketBroadcast {
// 	emit: (listener: string, data?: any) => void;
// }

// interface ISocketParams {
// 	reconnectionDelay: number;
// 	reconnectionAttempts: number;
// }

export interface IEnvVars {
	IS_PROD: boolean;
	USE_DB: boolean;
}
