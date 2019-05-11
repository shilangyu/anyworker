import Worker from '../src'

describe('onerror method', () => {
	it('should fail and catch the error', done => {
		const worker = new Worker(() => {
			throw 'err'
		})

		worker.onerror(err => {
			worker.terminate()
			done()
		})
	})

	it('should not fail', done => {
		const worker = new Worker(() => {
			let a = 0
			let b = 3
			let c = b / a
		})

		worker.onerror(err => {
			worker.terminate()
			done.fail(new Error('worker failed'))
		})

		setTimeout(() => done(), 300)
	})

	it('should catch errors after restart', done => {
		let calledOnce = false
		const worker = new Worker(() => {
			throw 'err'
		})

		worker.onerror(err => {
			worker.terminate()
			if (!calledOnce) calledOnce = true
			else done()
		})

		setTimeout(() => worker.restart(), 300)
	})
})
