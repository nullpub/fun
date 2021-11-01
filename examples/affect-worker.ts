import * as A from "../affect.ts";

const workerBlob = new Blob([`
self.onmessage = async (e) => {
  const output = typeof e.data === "number" ? e.data + 1 : 0;
  setTimeout(() => postMessage(output), 1000);
};
`], { type: "application/javascript" });

const computation = A.asks((n: number) =>
  new Promise((res) => {
    const worker = new Worker(URL.createObjectURL(workerBlob), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<number>) => {
      worker.terminate();
      res(event.data);
    };
    worker.postMessage(n);
  })
);

console.log(await computation(1));
