import { makeWorkerApiAndCleanup } from './StorageResponsesService'

class MockWorker {
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  postMessage = vi.fn()
  terminate = vi.fn()
}

describe('makeWorkerApiAndCleanup', () => {
  let createdWorkers: MockWorker[]

  beforeEach(() => {
    createdWorkers = []
    vi.stubGlobal(
      'Worker',
      vi.fn(() => {
        const worker = new MockWorker()
        createdWorkers.push(worker)
        return worker
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('can be cleaned up more than once without throwing', () => {
    const { cleanup } = makeWorkerApiAndCleanup()

    cleanup()
    expect(() => cleanup()).not.toThrow()
    expect(createdWorkers).toHaveLength(1)
    expect(createdWorkers[0].terminate).toHaveBeenCalledTimes(1)
  })
})
