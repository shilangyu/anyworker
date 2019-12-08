# anyworker

[![](https://github.com/shilangyu/anyworker/workflows/anyworker/badge.svg)](https://github.com/shilangyu/anyworker/actions)

```
npm i anyworker
```

Creates a bridge between web's WebWorker and node's worker_threads.

No more writing duplicate code for node and web targets ✨

Implements:

- postMessage
- onerror
- onmessage
- terminate

Additionally gives such APIs as:

- restart

## example

```ts
import Worker from 'anyworker'

const worker = new Worker(() => {
	postMessage({ sending: ['a', 'message', 'from', 'worker'] })

	onmessage(data => console.log('hello from a worker! Master sent me:', data))
})

worker.postMessage({ sending: ['a', 'message', 'from', 'master'] })
worker.onmessage(data => console.log('hello from master! Worker sent me:', data))

// later
worker.terminate()
// or
worker.restart()
```
