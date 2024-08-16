import { useEffect, useRef } from 'react';
import { EventRequestData, EventResponseData } from '../../types/fetcher';

export class FetcherWorker {
  worker: Worker;

  constructor(worker: Worker) {
    this.worker = worker;
  }

  fetchEvents(msg: EventRequestData): void {
    this.worker.postMessage(msg);
  }

  terminate(): void {
    this.worker.terminate();
  }
}

export interface FetcherWorkerCallbacks {
  onMessage?: (events: EventResponseData) => void;
}

export const useFetcherWorker = (callbacks: FetcherWorkerCallbacks = {}) => {
  const { onMessage } = callbacks;
  const fetcherWorkerRef = useRef<FetcherWorker | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../workers/fetcher.worker.ts', import.meta.url), { type: 'module' });
    fetcherWorkerRef.current = new FetcherWorker(workerRef.current);

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    const onMessageCallback = (event: MessageEvent<EventResponseData>) => {
      if (onMessage) {
        onMessage(event.data);
      }
    };

    workerRef.current?.addEventListener('message', onMessageCallback);

    return () => {
      workerRef.current?.removeEventListener('message', onMessageCallback);
    };
  }, [onMessage]);

  return { fetcherWorkerRef };
};
