describe('onerror method', () => {
	it('should catch the message', done => {
		const worker = new Worker(() => {
			postMessage('hello there')
		})

		worker.onmessage(msg => {
			worker.terminate()
			expect(msg).toBe('hello there')
			done()
		})
	})

	it('should catch the message after restart', done => {
		let calledOnce = false
		const worker = new Worker(() => {
			postMessage('hello there')
		})

		worker.onmessage(msg => {
			worker.terminate()
			if (!calledOnce) calledOnce = true
			else {
				expect(msg).toBe('hello there')
				done()
			}
		})

		setTimeout(() => worker.restart(), 300)
	})
})
