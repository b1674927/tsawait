
//sync block: everything between await is atomic in js
async function workerCase1(id: number) {
    console.log(`🩰Worker ${id}: before await`);
    // once the first worker runs into await, the second can start and so on
    await new Promise(resolve => setTimeout(resolve, 100));

    // if one worker is here, only one worker can be here because the others are in await
    console.log(`🩰Worker ${id}: after await - doing sync work`);

    // NO other worker interrupts this block
    let sum = 0;
    for (let i = 0; i < 3; i++) {
        console.log(`🩰Worker ${id}: sync loop iteration ${i}`);
        sum += i;
    }
    console.log(`🩰Worker ${id}: finished sync block`);
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`🩰Worker ${id}: done`);
}

//now we interrupt atomicity by having an await
async function workerCase2(id: number) {
    console.log(`🔀Worker ${id}: before await`);
    // once the first worker runs into await, the second can start and so on
    await new Promise(resolve => setTimeout(resolve, 100));

    // if one worker is here, only one worker can be here because the others are in await
    console.log(`🔀Worker ${id}: after await - doing no more sync work`);

    // NO other worker interrupts this block
    let sum = 0;
    for (let i = 0; i < 3; i++) {
        console.log(`🔀Worker ${id}: no more sync loop iteration ${i}`);
        await new Promise(resolve => setTimeout(resolve, 1));
        sum += i;
    }
    console.log(`🔀Worker ${id}: finished no more sync block`);
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`🔀Worker ${id}: done`);
}

async function runExperiments() {
    // Start 3 workers "simultaneously"
    await Promise.all([workerCase1(1), workerCase1(2), workerCase1(3)]);

    console.log("\n\n*** now for the 'not so sync' case")
    await Promise.all([workerCase2(1), workerCase2(2), workerCase2(3)]);
}

runExperiments();