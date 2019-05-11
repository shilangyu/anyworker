import Worker from '../src'

declare const postMessage: (data: any) => void

describe('onerror method', () => {
	it('should catch the message', () => {
		const worker = new Worker(() => {
			postMessage('hello there')
		})

		worker.onmessage(msg => {
			worker.terminate()
			expect(msg).toBe('hello there')
		})
	})

	it('should catch the message after restart', () => {
		let calledOnce = false
		const worker = new Worker(() => {
			postMessage('hello there')
		})

		worker.onmessage(msg => {
			worker.terminate()
			if (!calledOnce) calledOnce = true
			else expect(msg).toBe('hello there')
		})

		setTimeout(() => worker.restart(), 300)
	})
})
