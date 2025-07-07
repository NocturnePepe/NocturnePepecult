import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";
import { assert } from "chai";
import { NocturneSwap } from "../target/types/nocturne_swap";

describe("nocturne-swap", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NocturneSwap as Program<NocturneSwap>;
  
  let tokenAMint: PublicKey;
  let tokenBMint: PublicKey;
  let userTokenAAccount: PublicKey;
  let userTokenBAccount: PublicKey;
  let poolPda: PublicKey;
  let tokenAVault: PublicKey;
  let tokenBVault: PublicKey;
  
  const user = Keypair.generate();
  const mintAuthority = Keypair.generate();

  before(async () => {
    // Fund the user account
    await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(mintAuthority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    
    // Create token mints
    tokenAMint = await createMint(
      provider.connection,
      mintAuthority,
      mintAuthority.publicKey,
      null,
      9
    );
    
    tokenBMint = await createMint(
      provider.connection,
      mintAuthority,
      mintAuthority.publicKey,
      null,
      9
    );
    
    // Create user token accounts
    userTokenAAccount = await createAccount(
      provider.connection,
      user,
      tokenAMint,
      user.publicKey
    );
    
    userTokenBAccount = await createAccount(
      provider.connection,
      user,
      tokenBMint,
      user.publicKey
    );
    
    // Mint tokens to user
    await mintTo(
      provider.connection,
      mintAuthority,
      tokenAMint,
      userTokenAAccount,
      mintAuthority.publicKey,
      1000 * 10**9 // 1000 tokens
    );
    
    await mintTo(
      provider.connection,
      mintAuthority,
      tokenBMint,
      userTokenBAccount,
      mintAuthority.publicKey,
      1000 * 10**9 // 1000 tokens
    );
    
    // Derive pool PDA
    [poolPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from("pool"),
        tokenAMint.toBuffer(),
        tokenBMint.toBuffer()
      ],
      program.programId
    );
    
    // Create vault accounts
    tokenAVault = await createAccount(
      provider.connection,
      user,
      tokenAMint,
      poolPda
    );
    
    tokenBVault = await createAccount(
      provider.connection,
      user,
      tokenBMint,
      poolPda
    );
  });

  it("Initializes the swap pool", async () => {
    const feeRate = new anchor.BN(100); // 1% fee
    
    const tx = await program.methods
      .initializePool(feeRate)
      .accounts({
        authority: user.publicKey,
        pool: poolPda,
        tokenAMint: tokenAMint,
        tokenBMint: tokenBMint,
        tokenAVault: tokenAVault,
        tokenBVault: tokenBVault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([user])
      .rpc();
    
    console.log("Initialize pool transaction signature", tx);
    
    // Verify pool was created
    const poolAccount = await program.account.pool.fetch(poolPda);
    assert.ok(poolAccount.authority.equals(user.publicKey));
    assert.ok(poolAccount.tokenAMint.equals(tokenAMint));
    assert.ok(poolAccount.tokenBMint.equals(tokenBMint));
    assert.ok(poolAccount.feeRate.eq(feeRate));
  });

  it("Adds liquidity to the pool", async () => {
    const amountA = new anchor.BN(100 * 10**9); // 100 tokens
    const amountB = new anchor.BN(100 * 10**9); // 100 tokens
    const minLiquidity = new anchor.BN(50 * 10**9); // 50 tokens minimum
    
    const tx = await program.methods
      .addLiquidity(amountA, amountB, minLiquidity)
      .accounts({
        user: user.publicKey,
        pool: poolPda,
        userTokenA: userTokenAAccount,
        userTokenB: userTokenBAccount,
        vaultA: tokenAVault,
        vaultB: tokenBVault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();
    
    console.log("Add liquidity transaction signature", tx);
    
    // Verify liquidity was added
    const vaultAInfo = await provider.connection.getTokenAccountBalance(tokenAVault);
    const vaultBInfo = await provider.connection.getTokenAccountBalance(tokenBVault);
    
    assert.ok(vaultAInfo.value.uiAmount === 100);
    assert.ok(vaultBInfo.value.uiAmount === 100);
  });

  it("Performs a token swap", async () => {
    const amountIn = new anchor.BN(10 * 10**9); // 10 tokens
    const minimumAmountOut = new anchor.BN(5 * 10**9); // 5 tokens minimum
    const isAToB = true;
    
    // Get initial balances
    const userTokenABalanceBefore = await provider.connection.getTokenAccountBalance(userTokenAAccount);
    const userTokenBBalanceBefore = await provider.connection.getTokenAccountBalance(userTokenBAccount);
    
    const tx = await program.methods
      .swap(amountIn, minimumAmountOut, isAToB)
      .accounts({
        user: user.publicKey,
        pool: poolPda,
        userTokenIn: userTokenAAccount,
        userTokenOut: userTokenBAccount,
        vaultIn: tokenAVault,
        vaultOut: tokenBVault,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();
    
    console.log("Swap transaction signature", tx);
    
    // Verify swap occurred
    const userTokenABalanceAfter = await provider.connection.getTokenAccountBalance(userTokenAAccount);
    const userTokenBBalanceAfter = await provider.connection.getTokenAccountBalance(userTokenBAccount);
    
    // User should have less token A and more token B
    assert.ok(userTokenABalanceAfter.value.uiAmount < userTokenABalanceBefore.value.uiAmount);
    assert.ok(userTokenBBalanceAfter.value.uiAmount > userTokenBBalanceBefore.value.uiAmount);
    
    console.log("Token A balance before:", userTokenABalanceBefore.value.uiAmount);
    console.log("Token A balance after:", userTokenABalanceAfter.value.uiAmount);
    console.log("Token B balance before:", userTokenBBalanceBefore.value.uiAmount);
    console.log("Token B balance after:", userTokenBBalanceAfter.value.uiAmount);
  });

  it("Fails when slippage is too high", async () => {
    const amountIn = new anchor.BN(50 * 10**9); // 50 tokens (large amount)
    const minimumAmountOut = new anchor.BN(45 * 10**9); // 45 tokens (too high minimum)
    const isAToB = true;
    
    try {
      await program.methods
        .swap(amountIn, minimumAmountOut, isAToB)
        .accounts({
          user: user.publicKey,
          pool: poolPda,
          userTokenIn: userTokenAAccount,
          userTokenOut: userTokenBAccount,
          vaultIn: tokenAVault,
          vaultOut: tokenBVault,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();
      
      assert.fail("Should have failed due to slippage");
    } catch (error) {
      assert.ok(error.toString().includes("SlippageExceeded"));
    }
  });
});
