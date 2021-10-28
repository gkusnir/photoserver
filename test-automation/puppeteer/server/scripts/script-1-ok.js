// example script returning 0

async function main() {

    let now = Date.now();

    console.log(`starting at ${now}`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    now = Date.now();

    console.log(`finished successfully at ${now}`);

    process.exit(0)

}

main();

