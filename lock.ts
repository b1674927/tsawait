let refreshLocked: boolean;
let numlocks: number;

async function sleepForMS(MS: number) {
    await new Promise(resolve => setTimeout(resolve, MS));
}

async function worker(id: number, screwUp: boolean) {
    while (refreshLocked) {
        await sleepForMS(1);
    }
    if (screwUp) {
        await sleepForMS(10);
    } else {
        // do some work without await just to persuade that
        // await causes the non-atomicity
        const start = Date.now();
        let m = 0;
        for (let j = 0; j < Math.max(0, 10 - id) * 10_000_000; j++) {
            m = m + Math.exp(0.2 * Math.sqrt(m / 10_000_000));
        }
        console.log(`Worker ${id} took ${Date.now() - start}ms`);
    }
    refreshLocked = true;
    numlocks += 1;
    let sum = 0;
    for (let i = 0; i < 5; i++) {
        console.log(`Worker ${id}: iteration ${i} numlocks ${numlocks}`);
        await sleepForMS(10);
        sum += i;
    }
    refreshLocked = false;
    numlocks -= 1;
}

async function runExperiments() {
    refreshLocked = false;
    numlocks = 0;
    // Start 3 workers "simultaneously"
    const N = 10;
    let p = new Array<Promise<void>>();
    for (let j = 0; j < N; j++) {
        p.push(worker(j, false));
    }
    await Promise.all(p);

    console.log("\n\n*** now we screw it up")
    p = [];
    for (let j = 0; j < N; j++) {
        p.push(worker(j, true));
    }
    await Promise.all(p);
}


runExperiments();