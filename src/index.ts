import isNode from 'detect-node'

enum ENV {
	node,
	web
}

export type MessageCallback = (data: any) => void
export type ErrorCallback = (error: Error | ErrorEvent) => void

export default class {
	public worker?: Worker | import('worker_threads').Worker
	public env: ENV = ENV[isNode ? 'node' : 'web']
	public isRunning = true
	private _workerFuncStr: string = ''
	private _messageCallback?: MessageCallback
	private _errorCallback?: ErrorCallback

	constructor(env: Function) {
		this.either(
			() => {
				this._workerFuncStr = `() => {
				const { parentPort } = require('worker_threads');
				${env
					.toString()
					.replace(/^(\(\) ?=> ?\{|function ?\(\) ?\{)/, '')
					.replace(/postMessage\(/g, 'parentPort.postMessage(')
					.replace(/onmessage\(/g, "parentPort.on('message',")}
				`
			},
			() => {
				this._workerFuncStr = env
					.toString()
					.replace(
						/onmessage\((\((.*?)\) ?=>|function\((.*?)\))/g,
						'onmessage = (function({data: $2$3})'
					)
			}
		)
		this._workerFuncStr = `(${this._workerFuncStr})()`

		this.start()
	}

	private start() {
		this.isRunning = true

		this.either(
			() => {
				this.worker = new (require('worker_threads'.trim())
					.Worker as typeof import('worker_threads').Worker)(this._workerFuncStr, {
					eval: true
				})
			},
			() => {
				this.worker = new (window as any).Worker(
					URL.createObjectURL(new Blob([this._workerFuncStr]))
				)
			}
		)
	}

	onmessage(callback: MessageCallback) {
		this._messageCallback = callback

		this.either(
			worker => {
				worker.on('message', callback)
			},
			worker => {
				worker.onmessage = ({ data }) => callback(data)
			}
		)
	}

	onerror(callback: ErrorCallback) {
		this._errorCallback = callback

		this.either(
			worker => {
				worker.on('error', callback)
			},
			worker => {
				worker.onerror = callback
			}
		)
	}

	terminate() {
		this.isRunning = false
		this.worker!.terminate()
	}

	restart() {
		this.terminate()
		this.start()
		this._messageCallback && this.onmessage(this._messageCallback)
		this._errorCallback && this.onerror(this._errorCallback)
	}

	postMessage(data: any) {
		this.worker!.postMessage(data)
	}

	private either(
		node: (worker: import('worker_threads').Worker) => void,
		web: (worker: Worker) => void
	) {
		switch (this.env) {
			case ENV.node:
				node(this.worker as import('worker_threads').Worker)
				break
			case ENV.web:
				web(this.worker as Worker)
				break
		}
	}
}
