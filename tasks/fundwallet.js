task("fundwallet", "Send ETH to own test account")
  .addParam("to", "Address you want to fund")
  .addOptionalParam("amount", "Amount to send in ether, default 10")
  .setAction(async (taskArgs, { _, ethers }) => {

    let to = await ethers.getAddress(taskArgs.to);
    const amount = taskArgs.amount ? taskArgs.amount : "0";
    const [fromSigner] = await ethers.getSigners();

    const tx = await fromSigner.sendTransaction({
      to: to,
      value: ethers.parseEther(amount),
    });
    await tx.wait();
    console.log(`wallet ${to} funded with ${amount} ETH at transaction ${tx.hash}`);
  });